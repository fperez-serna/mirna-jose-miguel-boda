import { db, auth } from '../js/firebase-config.js';
import {
  signInWithEmailAndPassword, onAuthStateChanged, signOut,
  setPersistence, browserLocalPersistence, browserSessionPersistence,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import {
  collection, getDocs, doc, runTransaction, serverTimestamp, query, orderBy,
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
  viewToggle: document.getElementById('adminViewToggle'),
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
  editNombre: document.getElementById('editNombre'),
  editPases: document.getElementById('editPases'),
  editNinos: document.getElementById('editNinos'),
  editTelefono: document.getElementById('editTelefono'),
  editNotas: document.getElementById('editNotas'),
  modalTitle: document.getElementById('adminModalTitle'),
  modalDelete: document.getElementById('adminModalDelete'),
  addGuest: document.getElementById('adminAddGuest'),
  exportCsv: document.getElementById('adminExportCsv'),
  toggleAdvice: document.getElementById('adminToggleAdvice'),
  adviceModal: document.getElementById('adviceModal'),
  adviceModalBackdrop: document.getElementById('adviceModalBackdrop'),
  adviceModalClose: document.getElementById('adviceModalClose'),
  adviceLoading: document.getElementById('adviceLoading'),
  adviceListError: document.getElementById('adviceListError'),
  adviceEmpty: document.getElementById('adviceEmpty'),
  adviceList: document.getElementById('adviceList'),
};

let allGuests = [];
let state = {
  filter: 'TODOS',
  search: '',
  sort: 'nombre',
  compactMobile: localStorage.getItem('admin_compact_view') === '1',
};
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
    /* The public RSVP flow (js/rsvp.js) only ever writes to
       rsvp_public/{id} — guests/{id} is admin-only and never touched
       by a public confirm/change. So guests/{id} is the source of
       truth for name/pases/telefono/notas, but rsvp_public/{id} is the
       source of truth for the LIVE rsvp_estado/asistentes_confirmados/
       rsvp_actualizado/rsvp_comentario — merge both by id. */
    const [guestsSnap, rsvpSnap] = await Promise.all([
      getDocs(collection(db, 'guests')),
      getDocs(collection(db, 'rsvp_public')),
    ]);
    const rsvpById = new Map(rsvpSnap.docs.map((d) => [d.id, d.data()]));
    allGuests = guestsSnap.docs.map((d) => {
      const base = { id: d.id, ...d.data() };
      const live = rsvpById.get(d.id);
      if (live) {
        base.rsvp_estado = live.rsvp_estado;
        base.asistentes_confirmados = live.asistentes_confirmados;
        base.rsvp_actualizado = live.rsvp_actualizado;
        base.rsvp_comentario = live.rsvp_comentario;
      }
      return base;
    });
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

function applyCompactView() {
  els.tableWrap.classList.toggle('is-compact', state.compactMobile);
  els.viewToggle.setAttribute('aria-pressed', String(state.compactMobile));
  els.viewToggle.textContent = state.compactMobile ? 'Vista completa' : 'Vista compacta';
}

function renderTable() {
  const list = getFiltered();
  els.tableBody.innerHTML = '';
  applyCompactView();

  if (list.length === 0) {
    els.tableWrap.hidden = true;
    els.empty.hidden = false;
    return;
  }
  els.empty.hidden = true;
  els.tableWrap.hidden = false;

  list.forEach((g) => {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => {
      if (state.compactMobile) openEditModal(g, editBtn);
    });

    const tdName = document.createElement('td');
    tdName.className = 'admin-td-nombre';
    tdName.setAttribute('data-label', 'Nombre');
    tdName.textContent = g.nombre_mostrar;
    tr.appendChild(tdName);

    const tdPases = document.createElement('td');
    tdPases.setAttribute('data-label', 'Pases');
    tdPases.textContent = g.ninos_maximos ? `${g.pases_maximos} (${g.ninos_maximos} ${g.ninos_maximos === 1 ? 'niño' : 'niños'})` : g.pases_maximos;
    tr.appendChild(tdPases);

    const tdEstado = document.createElement('td');
    tdEstado.className = 'admin-td-estado';
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
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(g, editBtn);
    });
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

els.viewToggle.addEventListener('click', () => {
  state.compactMobile = !state.compactMobile;
  localStorage.setItem('admin_compact_view', state.compactMobile ? '1' : '0');
  applyCompactView();
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
   Edit / add / delete guest.

   The admin panel is the source of truth for the guest list (the old
   Excel is no longer used). Every write keeps three places in sync:
     guests/{id}        full record (admin-only)
     rsvp_public/{id}   what the public RSVP flow reads/writes
     search_index/public single doc with {id, nombre_busqueda,
                        nombre_mostrar, pases_maximos, ninos_maximos}
                        per guest — this is what the public name
                        search matches against, so a rename/add/
                        delete here shows up for guests on their
                        next page load.
   All three are changed in ONE transaction so they can't drift.
   ============================================================ */

let isAddMode = false;

function stripAccents(str) {
  return str.normalize('NFD').replace(/\p{Mn}/gu, '');
}

function nextGuestId() {
  const nums = allGuests
    .map((g) => /^INV-(\d+)$/.exec(g.id))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `INV-${String(next).padStart(3, '0')}`;
}

function openEditModal(guest, triggerBtn) {
  isAddMode = !guest;
  editingId = guest ? guest.id : null;
  lastFocusedEditBtn = triggerBtn || null;

  els.modalTitle.textContent = isAddMode ? 'Agregar invitado' : 'Editar invitado';
  els.modalName.textContent = isAddMode ? 'Nueva invitación' : guest.nombre_mostrar;
  els.modalDelete.hidden = isAddMode;

  els.editNombre.value = guest ? guest.nombre_mostrar : '';
  els.editPases.value = guest ? guest.pases_maximos : 1;
  els.editNinos.value = guest ? (guest.ninos_maximos || 0) : 0;
  els.editTelefono.value = guest ? (guest.telefono || '') : '';
  els.editNotas.value = guest ? (guest.notas_invitacion || '') : '';
  els.editEstado.value = guest ? (guest.rsvp_estado || 'PENDIENTE') : 'PENDIENTE';
  els.editConfirmados.value = guest ? (guest.asistentes_confirmados ?? 0) : 0;
  els.editComentario.value = guest ? (guest.rsvp_comentario || '') : '';
  syncPasesLabel();
  syncConfirmadosField();
  els.modalError.hidden = true;
  els.modal.hidden = false;
  els.editNombre.focus();
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  els.modal.hidden = true;
  document.body.style.overflow = '';
  editingId = null;
  isAddMode = false;
  if (lastFocusedEditBtn) lastFocusedEditBtn.focus();
}

function syncPasesLabel() {
  const pases = Number(els.editPases.value) || 0;
  els.editMaxPases.textContent = pases;
  els.editConfirmados.max = pases;
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
els.editPases.addEventListener('input', syncPasesLabel);
els.addGuest.addEventListener('click', () => openEditModal(null, els.addGuest));
els.modalClose.addEventListener('click', closeEditModal);
els.modalCancel.addEventListener('click', closeEditModal);
els.modalBackdrop.addEventListener('click', closeEditModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.modal.hidden) closeEditModal();
});

function showModalError(msg) {
  els.modalError.hidden = false;
  els.modalError.textContent = msg;
}

function saveErrorMessage() {
  return navigator.onLine
    ? 'No se pudo guardar. Intenta de nuevo.'
    : 'Sin conexión. Revisa tu internet e intenta de nuevo.';
}

els.editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  els.modalError.hidden = true;

  const nombre = els.editNombre.value.trim().replace(/\s+/g, ' ');
  const pases = Number(els.editPases.value);
  const ninos = Number(els.editNinos.value || 0);
  const estado = els.editEstado.value;
  let confirmados = Number(els.editConfirmados.value);
  if (estado !== 'CONFIRMADO') confirmados = 0;

  if (!nombre) return showModalError('Escribe el nombre del invitado.');
  if (!Number.isInteger(pases) || pases < 1 || pases > 20) return showModalError('Los pases deben ser un número entre 1 y 20.');
  if (!Number.isInteger(ninos) || ninos < 0 || ninos > pases - 1) {
    return showModalError('Los niños deben ser un número entre 0 y los pases menos 1 (siempre hay al menos un adulto).');
  }
  if (!Number.isInteger(confirmados) || confirmados < 0 || confirmados > pases) {
    return showModalError(`Las personas confirmadas deben estar entre 0 y ${pases}.`);
  }
  const nombreMostrar = nombre.toUpperCase();
  const nombreBusqueda = stripAccents(nombreMostrar);
  const dup = allGuests.find((g) => g.id !== editingId && stripAccents(g.nombre_mostrar.toUpperCase()) === nombreBusqueda);
  if (dup) return showModalError('Ya existe un invitado con ese nombre exacto. Agrega un apellido o distintivo para que el buscador no los confunda.');

  const telefono = els.editTelefono.value.trim() || null;
  const notas = els.editNotas.value.trim() || null;
  const comentario = els.editComentario.value.trim() || null;

  const existing = editingId ? allGuests.find((g) => g.id === editingId) : null;
  const id = editingId || nextGuestId();

  const saveBtn = document.getElementById('adminModalSave');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Guardando…';

  try {
    await runTransaction(db, async (tx) => {
      const searchRef = doc(db, 'search_index', 'public');
      const searchSnap = await tx.get(searchRef);
      const entries = searchSnap.exists() ? [...(searchSnap.data().entries || [])] : [];

      const meta = {
        nombre_mostrar: nombreMostrar,
        nombre_busqueda: nombreBusqueda,
        pases_maximos: pases,
        ninos_maximos: ninos,
        telefono,
        notas_invitacion: notas,
      };
      const rsvpChanged = !existing
        || existing.rsvp_estado !== estado
        || (existing.asistentes_confirmados ?? 0) !== confirmados
        || (existing.rsvp_comentario || null) !== comentario;
      const rsvp = {
        rsvp_estado: estado,
        asistentes_confirmados: confirmados,
        rsvp_comentario: comentario,
      };
      if (rsvpChanged) rsvp.rsvp_actualizado = serverTimestamp();

      const guestRef = doc(db, 'guests', id);
      const publicRef = doc(db, 'rsvp_public', id);
      const publicMeta = { pases_maximos: pases, ninos_maximos: ninos };

      if (existing) {
        tx.update(guestRef, { ...meta, ...rsvp });
        tx.update(publicRef, { ...publicMeta, ...rsvp });
      } else {
        tx.set(guestRef, { ...meta, ...rsvp, rsvp_actualizado: rsvp.rsvp_actualizado || null });
        tx.set(publicRef, { ...publicMeta, ...rsvp, rsvp_actualizado: rsvp.rsvp_actualizado || null });
      }

      const entry = {
        id,
        nombre_busqueda: nombreBusqueda,
        nombre_mostrar: nombreMostrar,
        pases_maximos: pases,
        ninos_maximos: ninos,
      };
      const idx = entries.findIndex((en) => en.id === id);
      if (idx >= 0) entries[idx] = entry; else entries.push(entry);
      tx.set(searchRef, { entries, updated_at: serverTimestamp() });
    });

    closeEditModal();
    await loadGuests();
  } catch (err) {
    showModalError(saveErrorMessage());
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Guardar';
  }
});

els.modalDelete.addEventListener('click', async () => {
  if (!editingId) return;
  const guest = allGuests.find((g) => g.id === editingId);
  if (!guest) return;
  const responded = guest.rsvp_estado && guest.rsvp_estado !== 'PENDIENTE';
  const msg = `¿Borrar a ${guest.nombre_mostrar}?${responded ? '\n\nEsta invitación ya tiene una respuesta registrada, que también se borrará.' : ''}\n\nNo se puede deshacer.`;
  if (!window.confirm(msg)) return;

  els.modalDelete.disabled = true;
  try {
    await runTransaction(db, async (tx) => {
      const searchRef = doc(db, 'search_index', 'public');
      const searchSnap = await tx.get(searchRef);
      const entries = (searchSnap.exists() ? searchSnap.data().entries || [] : []).filter((en) => en.id !== guest.id);
      tx.delete(doc(db, 'guests', guest.id));
      tx.delete(doc(db, 'rsvp_public', guest.id));
      tx.set(searchRef, { entries, updated_at: serverTimestamp() });
    });
    closeEditModal();
    await loadGuests();
  } catch (err) {
    showModalError(saveErrorMessage());
  } finally {
    els.modalDelete.disabled = false;
  }
});

/* ============================================================
   Export CSV — every guest (not just the current filter), with the
   merged live RSVP state. UTF-8 BOM so Excel opens accents correctly.
   ============================================================ */

function csvCell(v) {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

els.exportCsv.addEventListener('click', () => {
  const header = ['ID', 'Nombre', 'Pases máximos', 'Niños', 'Estado', 'Personas confirmadas', 'Teléfono', 'Notas', 'Comentario', 'Última actualización'];
  const rows = [...allGuests]
    .sort((a, b) => a.nombre_mostrar.localeCompare(b.nombre_mostrar, 'es'))
    .map((g) => [
      g.id, g.nombre_mostrar, g.pases_maximos, g.ninos_maximos || 0,
      ESTADO_LABEL[g.rsvp_estado] || g.rsvp_estado, g.asistentes_confirmados ?? 0,
      g.telefono, g.notas_invitacion, g.rsvp_comentario,
      g.rsvp_actualizado ? formatDate(g.rsvp_actualizado) : '',
    ]);
  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `invitados-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

/* ============================================================
   Consejos de matrimonio ("Secretos para un matrimonio feliz")
   — loaded lazily, only the first time the panel is opened.
   ============================================================ */

let adviceLoaded = false;

async function openAdviceModal() {
  els.adviceModal.hidden = false;
  document.body.style.overflow = 'hidden';
  els.adviceModalClose.focus();
  if (!adviceLoaded) {
    adviceLoaded = true;
    await loadAdvice();
  }
}

function closeAdviceModal() {
  els.adviceModal.hidden = true;
  document.body.style.overflow = '';
  els.toggleAdvice.focus();
}

els.toggleAdvice.addEventListener('click', openAdviceModal);
els.adviceModalClose.addEventListener('click', closeAdviceModal);
els.adviceModalBackdrop.addEventListener('click', closeAdviceModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !els.adviceModal.hidden) closeAdviceModal();
});

function formatAdviceDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
}

async function loadAdvice() {
  els.adviceLoading.hidden = false;
  els.adviceListError.hidden = true;
  els.adviceEmpty.hidden = true;
  els.adviceList.innerHTML = '';
  try {
    const snap = await getDocs(query(collection(db, 'advice'), orderBy('submitted_at', 'desc')));
    els.adviceLoading.hidden = true;
    if (snap.empty) {
      els.adviceEmpty.hidden = false;
      return;
    }
    snap.forEach((docSnap) => {
      const a = docSnap.data();
      const li = document.createElement('li');
      li.className = 'admin-advice__item';

      const secreto = document.createElement('p');
      secreto.className = 'admin-advice__secreto';
      secreto.textContent = a.secreto;
      li.appendChild(secreto);

      const meta = document.createElement('p');
      meta.className = 'admin-advice__meta';
      const who = a.anonimo || !a.firma ? 'Anónimo' : a.firma;
      const when = formatAdviceDate(a.submitted_at);
      meta.textContent = when ? `${who} · ${when}` : who;
      li.appendChild(meta);

      els.adviceList.appendChild(li);
    });
  } catch (err) {
    els.adviceLoading.hidden = true;
    els.adviceListError.hidden = false;
    els.adviceListError.textContent = navigator.onLine
      ? 'No pudimos cargar los consejos. Intenta de nuevo.'
      : 'Sin conexión. Revisa tu internet e intenta de nuevo.';
  }
}
