/*
  RSVP: search-first flow backed by Firestore. See firestore.rules for
  the data model (guests/ admin-only, rsvp_public/ for this flow,
  search_index/public for the fuzzy matcher below).

  This is a module (index.html loads it with type="module") so it can
  import the Firebase SDK and js/firebase-config.js directly.
*/
import { db } from './firebase-config.js';
import {
  doc, getDoc, updateDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

/* ============================================================
   Name matching — no external library. Normalizes accents/case/
   spacing, then does token-level AND-matching with a small
   optimal-string-alignment edit-distance for typo tolerance
   (transpositions count as one edit, e.g. "Frenanda" ~ "Fernanda").
   ============================================================ */

function normalizeName(str) {
  return str
    .normalize('NFD')
    .replace(new RegExp('\\p{Mn}', 'gu'), '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

function editDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }
  return d[m][n];
}

function fuzzyTolerance(len) {
  if (len <= 3) return 0;
  if (len <= 6) return 1;
  return 2;
}

function tokensMatch(queryToken, nameToken) {
  if (nameToken === queryToken) return true;
  if (queryToken.length >= 3 && nameToken.startsWith(queryToken)) return true;
  const tolerance = fuzzyTolerance(queryToken.length);
  if (tolerance === 0) return false;
  return editDistance(queryToken, nameToken) <= tolerance;
}

/*
  Returns 0 (best: query is a literal substring of the name — an exact
  or near-verbatim search), 1 (every query token matched some name token,
  possibly fuzzily), or -1 (no match).
*/
function scoreGuestMatch(queryTokens, normalizedQuery, nameTokens, normalizedName) {
  if (normalizedQuery.length >= 3 && normalizedName.includes(normalizedQuery)) return 0;
  for (const qt of queryTokens) {
    if (!nameTokens.some((nt) => tokensMatch(qt, nt))) return -1;
  }
  return 1;
}

/*
  Returns { tooShort: true } | { notFound: true } | { ambiguous: true }
  | { match: {id, nombre_busqueda, pases_maximos} }
  Never returns more than one candidate name — ambiguous cases must never
  leak the guest list.
*/
function searchGuests(rawQuery, entries) {
  const normalizedQuery = normalizeName(rawQuery);
  if (normalizedQuery.length < 2) return { tooShort: true };

  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  const scored = [];
  for (const entry of entries) {
    const normalizedName = normalizeName(entry.nombre_busqueda);
    const nameTokens = normalizedName.split(' ').filter(Boolean);
    const score = scoreGuestMatch(queryTokens, normalizedQuery, nameTokens, normalizedName);
    if (score >= 0) scored.push({ entry, score });
  }

  if (scored.length === 0) return { notFound: true };

  const bestScore = Math.min(...scored.map((s) => s.score));
  const best = scored.filter((s) => s.score === bestScore);
  if (best.length > 1) return { ambiguous: true };
  return { match: best[0].entry };
}

/* ============================================================
   DOM wiring
   ============================================================ */

const rsvpSearchInput = document.getElementById('rsvpSearchInput');
const rsvpSearchBtn = document.getElementById('rsvpSearchBtn');
const rsvpSearchResult = document.getElementById('rsvpSearchResult');
const rsvpActions = document.getElementById('rsvpActions');

function isEnglish() {
  return document.documentElement.lang === 'en';
}

let searchIndexPromise = null;
async function loadSearchIndex() {
  if (!searchIndexPromise) {
    searchIndexPromise = getDoc(doc(db, 'search_index', 'public'))
      .then((snap) => (snap.exists() ? snap.data().entries || [] : []));
  }
  return searchIndexPromise;
}

function clearActions() {
  rsvpActions.innerHTML = '';
  rsvpActions.hidden = true;
}

function showMessage(target, text, isError) {
  target.hidden = false;
  target.innerHTML = '';
  const p = document.createElement('p');
  if (isError) p.className = 'rsvp__error';
  p.textContent = text;
  target.appendChild(p);
}

function genericErrorText() {
  return isEnglish()
    ? "Something went wrong on our end and we couldn't complete that. Please try again in a moment."
    : 'Tuvimos un problema de nuestro lado y no pudimos completar esto. Intenta de nuevo en un momento.';
}

function offlineErrorText() {
  return isEnglish()
    ? "You seem to be offline. Check your connection and try again."
    : 'Parece que no tienes conexión. Revisa tu internet e intenta de nuevo.';
}

/* Renders the Sí/No buttons + (if attending) the attendee-count step. */
function renderRsvpButtons(guestId, pasesMaximos, currentConfirmed) {
  clearActions();
  rsvpActions.hidden = false;
  const en = isEnglish();

  const btnYes = document.createElement('button');
  btnYes.type = 'button';
  btnYes.className = 'rsvp__btn rsvp__btn--yes';
  btnYes.textContent = en ? 'Yes, I\'ll be there' : 'Sí asistiré';

  const btnNo = document.createElement('button');
  btnNo.type = 'button';
  btnNo.className = 'rsvp__btn rsvp__btn--no';
  btnNo.textContent = en ? "I can't make it" : 'No podré asistir';

  const row = document.createElement('div');
  row.className = 'rsvp__btn-row';
  row.appendChild(btnYes);
  row.appendChild(btnNo);
  rsvpActions.appendChild(row);

  btnYes.addEventListener('click', () => renderAttendeeStep(guestId, pasesMaximos, currentConfirmed));
  btnNo.addEventListener('click', () => submitRsvp(guestId, 'NO_ASISTE', 0, pasesMaximos));
}

function renderAttendeeStep(guestId, pasesMaximos, currentConfirmed) {
  clearActions();
  rsvpActions.hidden = false;
  const en = isEnglish();

  const label = document.createElement('label');
  label.setAttribute('for', 'rsvpAttendeeSelect');
  label.textContent = en
    ? `How many from your invitation will attend (including you, max ${pasesMaximos})?`
    : `¿Cuántos de tu invitación asistirán (incluyéndote, máximo ${pasesMaximos})?`;

  const select = document.createElement('select');
  select.id = 'rsvpAttendeeSelect';
  for (let i = 1; i <= pasesMaximos; i++) {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = en ? (i === 1 ? '1 person' : `${i} people`) : (i === 1 ? '1 persona' : `${i} personas`);
    if (i === (currentConfirmed || pasesMaximos)) opt.selected = true;
    select.appendChild(opt);
  }

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'rsvp__btn rsvp__btn--confirm';
  confirmBtn.textContent = en ? 'Confirm' : 'Confirmar';
  confirmBtn.addEventListener('click', () => {
    const n = Number(select.value);
    if (!Number.isInteger(n) || n < 1 || n > pasesMaximos) return; // frontend guard; rules enforce it too
    submitRsvp(guestId, 'CONFIRMADO', n, pasesMaximos);
  });

  const field = document.createElement('div');
  field.className = 'rsvp__field';
  field.appendChild(label);
  field.appendChild(select);
  rsvpActions.appendChild(field);
  rsvpActions.appendChild(confirmBtn);
}

function renderChangeResponse(guestId, pasesMaximos, currentConfirmed) {
  clearActions();
  rsvpActions.hidden = false;
  const en = isEnglish();
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'rsvp__btn rsvp__btn--change';
  btn.textContent = en ? 'Change my response' : 'Cambiar respuesta';
  btn.addEventListener('click', () => renderRsvpButtons(guestId, pasesMaximos, currentConfirmed));
  rsvpActions.appendChild(btn);
}

async function submitRsvp(guestId, estado, asistentesConfirmados, pasesMaximos) {
  clearActions();
  rsvpActions.hidden = false;
  const en = isEnglish();
  const savingMsg = document.createElement('p');
  savingMsg.className = 'rsvp__saving';
  savingMsg.textContent = en ? 'Saving…' : 'Guardando…';
  rsvpActions.appendChild(savingMsg);

  if (!navigator.onLine) {
    clearActions();
    rsvpActions.hidden = false;
    showMessage(rsvpActions, offlineErrorText(), true);
    return;
  }

  try {
    await updateDoc(doc(db, 'rsvp_public', guestId), {
      rsvp_estado: estado,
      asistentes_confirmados: asistentesConfirmados,
      pases_maximos: pasesMaximos,
      rsvp_actualizado: serverTimestamp(),
    });
    showStatus(guestId, { pases_maximos: pasesMaximos, rsvp_estado: estado, asistentes_confirmados: asistentesConfirmados });
  } catch (err) {
    clearActions();
    rsvpActions.hidden = false;
    showMessage(rsvpActions, genericErrorText(), true);
  }
}

/* Renders the current saved status (thanks / already-responded state)
   plus a "cambiar respuesta" action. */
function showStatus(guestId, rsvp) {
  clearActions();
  rsvpActions.hidden = false;
  const en = isEnglish();
  const p = document.createElement('p');
  p.className = 'rsvp__status';

  if (rsvp.rsvp_estado === 'CONFIRMADO') {
    p.textContent = en
      ? `You currently have ${rsvp.asistentes_confirmados} ${rsvp.asistentes_confirmados === 1 ? 'person' : 'people'} confirmed. Thank you!`
      : `Actualmente tienes confirmadas ${rsvp.asistentes_confirmados} persona${rsvp.asistentes_confirmados === 1 ? '' : 's'}. ¡Gracias!`;
  } else if (rsvp.rsvp_estado === 'NO_ASISTE') {
    p.textContent = en
      ? "Thanks for letting us know. We'll miss celebrating with you."
      : 'Gracias por avisarnos. Sentiremos mucho no poder celebrar contigo.';
  } else {
    p.textContent = en
      ? `Your invitation covers ${rsvp.pases_maximos} ${rsvp.pases_maximos === 1 ? 'spot' : 'spots'}.`
      : `Tu invitación incluye ${rsvp.pases_maximos} lugar${rsvp.pases_maximos === 1 ? '' : 'es'}.`;
  }
  rsvpActions.appendChild(p);

  if (rsvp.rsvp_estado === 'PENDIENTE') {
    renderRsvpButtons(guestId, rsvp.pases_maximos, rsvp.asistentes_confirmados);
  } else {
    const changeBtn = document.createElement('button');
    changeBtn.type = 'button';
    changeBtn.className = 'rsvp__btn rsvp__btn--change';
    changeBtn.textContent = en ? 'Change my response' : 'Cambiar respuesta';
    changeBtn.addEventListener('click', () => renderRsvpButtons(guestId, rsvp.pases_maximos, rsvp.asistentes_confirmados));
    rsvpActions.appendChild(changeBtn);
  }
}

async function showFoundGuest(matchEntry) {
  rsvpSearchResult.hidden = false;
  rsvpSearchResult.innerHTML = '';
  const en = isEnglish();
  const nameLine = document.createElement('p');
  nameLine.className = 'rsvp__result-name';
  nameLine.textContent = en
    ? `We found your invitation: ${matchEntry.nombre_mostrar}`
    : `Encontramos tu invitación: ${matchEntry.nombre_mostrar}`;
  rsvpSearchResult.appendChild(nameLine);

  clearActions();
  rsvpActions.hidden = false;
  const loading = document.createElement('p');
  loading.textContent = en ? 'Loading…' : 'Cargando…';
  rsvpActions.appendChild(loading);

  try {
    const snap = await getDoc(doc(db, 'rsvp_public', matchEntry.id));
    if (!snap.exists()) {
      clearActions();
      rsvpActions.hidden = false;
      showMessage(rsvpActions, genericErrorText(), true);
      return;
    }
    showStatus(matchEntry.id, snap.data());
  } catch (err) {
    clearActions();
    rsvpActions.hidden = false;
    showMessage(rsvpActions, navigator.onLine ? genericErrorText() : offlineErrorText(), true);
  }
}

function showNotFound(query) {
  clearActions();
  showMessage(
    rsvpSearchResult,
    isEnglish()
      ? `We couldn't find "${query}" on the list. Check how you typed it, or contact us directly if the problem continues.`
      : `No encontramos "${query}" en la lista. Revisa cómo lo escribiste, o contáctanos directamente si el problema sigue.`,
    false,
  );
}

function showAmbiguous() {
  clearActions();
  showMessage(
    rsvpSearchResult,
    isEnglish()
      ? 'We found more than one invitation that looks similar. Please also type your last name.'
      : 'Encontramos más de una invitación parecida. Escribe también tu apellido.',
    false,
  );
}

function showTooShort() {
  clearActions();
  showMessage(
    rsvpSearchResult,
    isEnglish() ? 'Type at least 2 letters of your name.' : 'Escribe al menos 2 letras de tu nombre.',
    false,
  );
}

async function handleSearch() {
  const raw = rsvpSearchInput.value;
  if (!raw || !raw.trim()) return;

  rsvpSearchResult.hidden = false;
  rsvpSearchResult.innerHTML = '';
  const loading = document.createElement('p');
  loading.textContent = isEnglish() ? 'Searching…' : 'Buscando…';
  rsvpSearchResult.appendChild(loading);
  clearActions();

  let entries;
  try {
    entries = await loadSearchIndex();
  } catch (err) {
    showMessage(rsvpSearchResult, navigator.onLine ? genericErrorText() : offlineErrorText(), true);
    return;
  }

  const result = searchGuests(raw, entries);
  if (result.tooShort) showTooShort();
  else if (result.notFound) showNotFound(raw.trim());
  else if (result.ambiguous) showAmbiguous();
  else showFoundGuest(result.match);
}

if (rsvpSearchBtn) {
  rsvpSearchBtn.addEventListener('click', handleSearch);
  rsvpSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  });
}
