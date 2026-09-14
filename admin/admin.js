import { db, auth } from '../js/firebase-config.js';
import {
  signInWithEmailAndPassword, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence, browserSessionPersistence,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
  collection, getDocs, doc, writeBatch, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

/* Fixed internal login identity — Mirna only ever types a password (see
   admin/index.html comment); must match migration/create-admin-user.js. */
const ADMIN_EMAIL = 'mirna.admin@mirnabeyjosemiguel.com';

const els = {
  initLoading: document.getElementById('adminInitLoading'),
  login: document.getElementById('adminLogin'),
  loginForm: document.getElementById('adminLoginForm'),
  loginPassword: document.getElementById('adminPassword'),
  loginError: document.getElementById('adminLoginError'),
  loginSubmit: document.getElementById('adminLoginSubmit'),
  togglePassword: document.getElementById('adminTogglePassword'),
  remember: document.getElementById('adminRemember'),
  dash: document.getElementById('adminDash'),
  logout: document.getElementById('adminLogout'),
  loading: document.getElementById('adminLoading'),
  error: document.getElementById('adminError'),
  tableWrap: document.getElementById('adminTableWrap'),
  tableBody: document.getElementById('adminTableBody'),
  empty: document.getElementById('adminEmpty'),
  filters: document.getElementById('adminFilters'),
  search: document.getElementById('adminSearch'),
  sort: document.getElementById('adminSort'),
  modal: document.getElementById('adminModal'),
  modalBackdrop: document.getElementById('adminModalBackdrop'),
  modalClose: document.getElementById('adminModalClose'),
  modalCancel: document.getElementById('adminModalCancel'),
  modalName: document.getElementById('adminModalName'),
  modalError: document.getElementById('adminModalError'),
  editForm: document.getElementById('adminEditForm'),
  editEstado: document.getElementById('editEstado'),
  editConfirmados: document.getElementById('editConfirmados'),
  editComentario: document.getElementById('editComentario'),
  editMaxPases: document.getElementById('editMaxPases'),
};

let allGuests = [];
let state = { filter: 'TODOS', search: '', sort: 'nombre' };
let editingId = null;
let lastFocusedEditBtn = null;

function normalize(str) {
  return (str || '').normalize('NFD').replace(/\p{Mn}/gu, '').trim().toUpperCase();
}

function authErrorMessage(err) {
  if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') return 'Contraseña incorrecta.';
  if (err.code === 'auth/too-many-requests') return 'Demasiados intentos. Intenta más tarde.';
  if (err.code === 'auth/network-request-failed') return 'Sin conexión. Revisa tu internet.';
  return 'No se pudo iniciar sesión. Intenta de nuevo.';
}

els.togglePassword.addEventListener('click', () => {
  const showing = els.loginPassword.type === 'text';
  els.loginPassword.type = showing ? 'password' : 'text';
  els.togglePassword.textContent = showing ? 'Ver' : 'Ocultar';
  els.togglePassword.setAttribute('aria-pressed', String(!showing));
  els.togglePassword.setAttribute('aria-label', showing ? 'Mostrar contraseña' : 'Ocultar contraseña');
});

els.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  els.loginError.hidden = true;
  els.loginSubmit.disabled = true;
  els.loginSubmit.textContent = 'Entrando…';
  try {
    /* Some mobile browsers/webviews silently fall back to in-memory
       (tab-only) persistence unless local persistence is requested
       explicitly — "Recordar mi sesión" controls that choice. */
    await setPersistence(auth, els.remember.checked ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, els.loginPassword.value);
    // onAuthStateChanged below hides the login box and shows the
    // dashboard once Firebase confirms the sign-in.
  } catch (err) {
    els.loginError.hidden = false;
    els.loginError.textContent = authErrorMessage(err);
    els.loginSubmit.disabled = false;
    els.loginSubmit.textContent = 'Entrar';
  }
});

els.logout.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  els.initLoading.hidden = true;
  if (user) {
    els.login.hidden = true;
    els.dash.hidden = false;
    window.scrollTo(0, 0);
    loadGuests();
  } else {
    els.dash.hidden = true;
    els.login.hidden = false;
    window.scrollTo(0, 0);
    els.loginPassword.value = '';
    els.loginPassword.type = 'password';
    els.togglePassword.textContent = 'Ver';
    els.togglePassword.setAttribute('aria-pressed', 'false');
    els.loginSubmit.disabled = false;
    els.loginSubmit.textContent = 'Entrar';
  }
});

async function loadGuests() {
  els.loading.hidden = false;
  els.error.hidden = true;
  els.tableWrap.hidden = true;
  els.empty.hidden = true;
  try {
    const snap = await getDocs(collection(db, 'guests'));
    allGuests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    els.loading.hidden = true;
    renderMetrics();
    renderTable();
  } catch (err) {
    els.loading.hidden = true;
    els.error.hidden = false;
    els.error.textContent = navigator.onLine
      ? 'No pudimos cargar la lista de invitados. Intenta de nuevo.'
      : 'Sin conexión. Revisa tu internet e intenta de nuevo.';
  }
}

function renderMetrics() {
  const total = allGuests.length;
  const lugares = allGuests.reduce((s, g) => s + (g.pases_maximos || 0), 0);
  const confirmadas = allGuests.filter((g) => g.rsvp_estado === 'CONFIRMADO');
  const noAsisten = allGuests.filter((g) => g.rsvp_estado === 'NO_ASISTE');
  const pendientes = allGuests.filter((g) => g.rsvp_estado === 'PENDIENTE');
  const personasConfirmadas = confirmadas.reduce((s, g) => s + (g.asistentes_confirmados || 0), 0);
  const respondidas = confirmadas.length + noAsisten.length;
  const pct = total ? Math.round((respondidas / total) * 100) : 0;

  document.getElementById('mTotalInvitaciones').textContent = total;
  document.getElementById('mTotalLugares').textContent = lugares;
  document.getElementById('mPersonasConfirmadas').textContent = personasConfirmadas;
  document.getElementById('mInvitacionesConfirmadas').textContent = confirmadas.length;
  document.getElementById('mNoAsisten').textContent = noAsisten.length;
  document.getElementById('mPendientes').textContent = pendientes.length;
  document.getElementById('mRespuestas').textContent = `${respondidas} de ${total} invitaciones respondidas, ${pct}%`;
}

const ESTADO_LABEL = { PENDIENTE: 'Pendiente', CONFIRMADO: 'Confirmado', NO_ASISTE: 'No asiste' };
const ESTADO_RANK = { CONFIRMADO: 0, NO_ASISTE: 1, PENDIENTE: 2 };

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

function getFiltered() {
  let list = allGuests;
  if (state.filter !== 'TODOS') list = list.filter((g) => g.rsvp_estado === state.filter);
  if (state.search.trim()) {
    const q = normalize(state.search);
    list = list.filter((g) => normalize(g.nombre_mostrar).includes(q));
  }
  const sorted = [...list];
  if (state.sort === 'nombre') {
    sorted.sort((a, b) => a.nombre_mostrar.localeCompare(b.nombre_mostrar, 'es'));
  } else if (state.sort === 'estado') {
    sorted.sort((a, b) => (ESTADO_RANK[a.rsvp_estado] ?? 9) - (ESTADO_RANK[b.rsvp_estado] ?? 9)
      || a.nombre_mostrar.localeCompare(b.nombre_mostrar, 'es'));
  } else if (state.sort === 'actualizado') {
    sorted.sort((a, b) => {
      const at = a.rsvp_actualizado ? a.rsvp_actualizado.toMillis() : -1;
      const bt = b.rsvp_actualizado ? b.rsvp_actualizado.toMillis() : -1;
      return bt - at;
    });
  } else if (state.sort === 'confirmados') {
    sorted.sort((a, b) => (b.asistentes_confirmados || 0) - (a.asistentes_confirmados || 0));
  }
  return sorted;
}

function renderTable() {
  const list = getFiltered();
  els.tableBody.innerHTML = '';

  if (list.length === 0) {
    els.tableWrap.hidden = true;
    els.empty.hidden = false;
    return;
  }
  els.empty.hidden = true;
  els.tableWrap.hidden = false;

  list.forEach((g) => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.setAttribute('data-label', 'Nombre');
    tdName.textContent = g.nombre_mostrar;
    tr.appendChild(tdName);

    const tdPases = document.createElement('td');
    tdPases.setAttribute('data-label', 'Pases');
    tdPases.textContent = g.pases_maximos;
    tr.appendChild(tdPases);

    const tdEstado = document.createElement('td');
    tdEstado.setAttribute('data-label', 'Estado');
    const badge = document.createElement('span');
    badge.className = `admin-status admin-status--${g.rsvp_estado}`;
    badge.textContent = ESTADO_LABEL[g.rsvp_estado] || g.rsvp_estado;
    tdEstado.appendChild(badge);
    tr.appendChild(tdEstado);

    const tdConfirmados = document.createElement('td');
    tdConfirmados.setAttribute('data-label', 'Confirmados');
    tdConfirmados.textContent = g.asistentes_confirmados ?? 0;
    tr.appendChild(tdConfirmados);

    const tdPhone = document.createElement('td');
    tdPhone.setAttribute('data-label', 'Teléfono');
    if (g.telefono) {
      const a = document.createElement('a');
      a.className = 'admin-phone';
      a.href = `https://wa.me/${g.telefono.replace(/[^\d]/g, '')}`;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = g.telefono;
      tdPhone.appendChild(a);
    } else {
      tdPhone.textContent = '—';
    }
    tr.appendChild(tdPhone);

    const tdNotas = document.createElement('td');
    tdNotas.setAttribute('data-label', 'Notas');
    tdNotas.textContent = g.notas_invitacion || '—';
    tr.appendChild(tdNotas);

    const tdUpdated = document.createElement('td');
    tdUpdated.setAttribute('data-label', 'Actualizado');
    tdUpdated.textContent = formatDate(g.rsvp_actualizado);
    tr.appendChild(tdUpdated);

    const tdEdit = document.createElement('td');
    tdEdit.setAttribute('data-label', '');
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'admin-edit-btn';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => openEditModal(g, editBtn));
    tdEdit.appendChild(editBtn);
    tr.appendChild(tdEdit);

    els.tableBody.appendChild(tr);
  });
}

els.filters.querySelectorAll('.admin-filter').forEach((btn) => {
  btn.addEventListener('click', () => {
    els.filters.querySelectorAll('.admin-filter').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    state.filter = btn.getAttribute('data-filter');
    renderTable();
  });
});

els.search.addEventListener('input', () => {
  state.search = els.search.value;
  renderTable();
});

els.sort.addEventListener('change', () => {
  state.sort = els.sort.value;
  renderTable();
});

/* ============================================================
   Edit modal — rsvp_estado / asistentes_confirmados /
   rsvp_comentario only. document_id, nombre, pases_maximos are
   never editable from here.
   ============================================================ */

function openEditModal(guest, triggerBtn) {
  editingId = guest.id;
  lastFocusedEditBtn = triggerBtn || null;
  els.modalName.textContent = `${guest.nombre_mostrar} · máx. ${guest.pases_maximos} pases`;
  els.editEstado.value = guest.rsvp_estado || 'PENDIENTE';
  els.editConfirmados.value = guest.asistentes_confirmados ?? 0;
  els.editConfirmados.max = guest.pases_maximos;
  els.editMaxPases.textContent = guest.pases_maximos;
  els.editComentario.value = guest.rsvp_comentario || '';
  syncConfirmadosField();
  els.modalError.hidden = true;
  els.modal.hidden = false;
  els.editEstado.focus();
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  els.modal.hidden = true;
  document.body.style.overflow = '';
  editingId = null;
  if (lastFocusedEditBtn) lastFocusedEditBtn.focus();
}

function syncConfirmadosField() {
  if (els.editEstado.value === 'PENDIENTE' || els.editEstado.value === 'NO_ASISTE') {
    els.editConfirmados.value = 0;
    els.editConfirmados.disabled = true;
  } else {
    els.editConfirmados.disabled = false;
    if (Number(els.editConfirmados.value) < 1) els.editConfirmados.value = 1;
  }
}

els.editEstado.addEventListener('change', syncConfirmadosField);
els.modalClose.addEventListener('click', closeEditModal);
els.modalCancel.addEventListener('click', closeEditModal);
els.modalBackdrop.addEventListener('click', closeEditModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.modal.hidden) closeEditModal();
});

els.editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!editingId) return;
  const guest = allGuests.find((g) => g.id === editingId);
  if (!guest) return;

  const estado = els.editEstado.value;
  let confirmados = Number(els.editConfirmados.value);
  if (estado !== 'CONFIRMADO') confirmados = 0;
  if (!Number.isInteger(confirmados) || confirmados < 0 || confirmados > guest.pases_maximos) {
    els.modalError.hidden = false;
    els.modalError.textContent = `Las personas confirmadas deben estar entre 0 y ${guest.pases_maximos}.`;
    return;
  }
  const comentario = els.editComentario.value.trim() || null;

  const saveBtn = document.getElementById('adminModalSave');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Guardando…';

  try {
    const batch = writeBatch(db);
    const update = {
      rsvp_estado: estado,
      asistentes_confirmados: confirmados,
      rsvp_comentario: comentario,
      rsvp_actualizado: serverTimestamp(),
    };
    batch.update(doc(db, 'guests', editingId), update);
    batch.update(doc(db, 'rsvp_public', editingId), update);
    await batch.commit();

    Object.assign(guest, update, { rsvp_actualizado: { toDate: () => new Date(), toMillis: () => Date.now() } });
    renderMetrics();
    renderTable();
    closeEditModal();
  } catch (err) {
    els.modalError.hidden = false;
    els.modalError.textContent = navigator.onLine
      ? 'No se pudo guardar. Intenta de nuevo.'
      : 'Sin conexión. Revisa tu internet e intenta de nuevo.';
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Guardar';
  }
});
