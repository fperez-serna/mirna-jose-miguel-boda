const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/*
  No backend wired yet — see index.html §11 comment. Swap this for a real
  POST to the Google Form's formResponse endpoint once that URL exists;
  keep the same show-thanks UX on success.
*/
const adviceForm = document.getElementById('adviceForm');
const adviceThanks = document.getElementById('adviceThanks');

if (adviceForm) {
  adviceForm.addEventListener('submit', (e) => {
    e.preventDefault();
    adviceForm.hidden = true;
    adviceThanks.hidden = false;
  });
}

/*
  Gifts — "Copiar" buttons (§15). Copies the raw account/phone digits to
  the clipboard and briefly swaps the button label to "Copiado"/"Copied".
*/
document.querySelectorAll('.gifts__copy').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const value = btn.getAttribute('data-copy');
    try {
      await navigator.clipboard.writeText(value);
    } catch (e) {
      /* clipboard API unavailable (older browser, insecure context) —
         fall back to a manual select so the user can still copy. */
      const temp = document.createElement('textarea');
      temp.value = value;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      try { document.execCommand('copy'); } catch (e2) { /* give up silently */ }
      document.body.removeChild(temp);
    }
    const en = document.documentElement.lang === 'en';
    btn.textContent = en ? 'Copied!' : '¡Copiado!';
    btn.classList.add('is-copied');
    setTimeout(() => {
      btn.textContent = en ? 'Copy' : 'Copiar';
      btn.classList.remove('is-copied');
    }, 1800);
  });
});
