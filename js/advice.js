/*
  "Secretos para un matrimonio feliz" submission — writes to Firestore
  (advice/{autoId}, see firestore.rules: public can only create, never
  read/list/edit/delete). Readable only from /admin.
*/
import { db } from './firebase-config.js';
import {
  collection, addDoc, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

const adviceForm = document.getElementById('adviceForm');
const adviceThanks = document.getElementById('adviceThanks');
const adviceError = document.getElementById('adviceError');
const adviceAnon = document.getElementById('adviceAnon');

function isEnglish() {
  return document.documentElement.lang === 'en';
}

if (adviceForm) {
  adviceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    adviceError.hidden = true;

    const secreto = adviceForm.secreto.value.trim();
    if (!secreto) return;
    const firmaRaw = adviceForm.firma.value.trim();
    const anonimo = adviceAnon.checked;

    const submitBtn = adviceForm.querySelector('.advice__submit');
    submitBtn.disabled = true;
    submitBtn.textContent = isEnglish() ? 'Sending…' : 'Enviando…';

    try {
      await addDoc(collection(db, 'advice'), {
        secreto,
        firma: anonimo ? null : (firmaRaw || null),
        anonimo,
        submitted_at: serverTimestamp(),
      });
      adviceForm.hidden = true;
      adviceThanks.hidden = false;
    } catch (err) {
      adviceError.hidden = false;
      adviceError.textContent = navigator.onLine
        ? (isEnglish() ? "Something went wrong — please try again." : 'Algo salió mal — intenta de nuevo.')
        : (isEnglish() ? "You're offline. Check your connection and try again." : 'Sin conexión. Revisa tu internet e intenta de nuevo.');
      submitBtn.disabled = false;
      submitBtn.textContent = isEnglish() ? 'Submit' : 'Enviar';
    }
  });
}
