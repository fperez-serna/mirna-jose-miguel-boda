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
