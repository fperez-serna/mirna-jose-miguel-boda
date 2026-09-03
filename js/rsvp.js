/*
  RSVP search-then-confirm flow. Client-side only for now — see the
  index.html §4 comment for the privacy tradeoff and the pending
  submission backend.
*/
function normalizeName(str) {
  return str
    .normalize('NFD')
    .replace(new RegExp('\\p{Mn}', 'gu'), '')
    .trim()
    .toUpperCase();
}

const rsvpSearchInput = document.getElementById('rsvpSearchInput');
const rsvpSearchBtn = document.getElementById('rsvpSearchBtn');
const rsvpSearchResult = document.getElementById('rsvpSearchResult');
const rsvpForm = document.getElementById('rsvpForm');
const rsvpPartyField = document.getElementById('rsvpPartyField');
const rsvpPartyLabel = document.getElementById('rsvpPartyLabel');
const rsvpPartySelect = document.getElementById('rsvpPartySelect');
const rsvpThanks = document.getElementById('rsvpThanks');

function showFoundGuest(guest) {
  rsvpSearchResult.hidden = false;
  rsvpSearchResult.innerHTML = '';

  const nameLine = document.createElement('p');
  nameLine.className = 'rsvp__result-name';
  nameLine.textContent = `¡Te encontramos, ${guest.name}!`;
  rsvpSearchResult.appendChild(nameLine);

  const detailLine = document.createElement('p');
  detailLine.className = 'rsvp__result-detail';

  if (guest.pase > 1) {
    detailLine.textContent = `Tu invitación incluye hasta ${guest.pase} personas.`;
    rsvpPartyField.hidden = false;
    rsvpPartyLabel.textContent = `¿Cuántos de tu invitación asistirán (incluyéndote, máximo ${guest.pase})?`;
    rsvpPartySelect.innerHTML = '';
    for (let i = 1; i <= guest.pase; i++) {
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = i === 1 ? '1 persona' : `${i} personas`;
      if (i === guest.pase) opt.selected = true;
      rsvpPartySelect.appendChild(opt);
    }
  } else {
    detailLine.textContent = 'Tu invitación es individual.';
    rsvpPartyField.hidden = true;
  }
  rsvpSearchResult.appendChild(detailLine);

  rsvpForm.hidden = false;
}

function showNotFound(query) {
  rsvpSearchResult.hidden = false;
  rsvpSearchResult.textContent = `No encontramos "${query}" en la lista. Revisa cómo lo escribiste, o contáctanos directamente si el problema sigue.`;
  rsvpForm.hidden = true;
  rsvpPartyField.hidden = true;
}

function handleSearch() {
  const raw = rsvpSearchInput.value;
  if (!raw || !raw.trim()) return;
  const query = normalizeName(raw);

  const matches = GUESTS.filter((g) => normalizeName(g.name).includes(query));

  if (matches.length === 0) {
    showNotFound(raw.trim());
  } else if (matches.length === 1) {
    showFoundGuest(matches[0]);
  } else {
    rsvpSearchResult.hidden = false;
    rsvpSearchResult.innerHTML = '';
    const label = document.createElement('p');
    label.textContent = 'Encontramos varias coincidencias — ¿cuál eres?';
    rsvpSearchResult.appendChild(label);
    matches.forEach((guest) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rsvp__match-btn';
      btn.textContent = guest.name;
      btn.addEventListener('click', () => showFoundGuest(guest));
      rsvpSearchResult.appendChild(btn);
    });
    rsvpForm.hidden = true;
    rsvpPartyField.hidden = true;
  }
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

if (rsvpForm) {
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    rsvpForm.hidden = true;
    document.getElementById('rsvpSearch').hidden = true;
    rsvpThanks.hidden = false;
  });
}
