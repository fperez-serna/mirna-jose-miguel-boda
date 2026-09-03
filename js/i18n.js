/*
  Site-wide ES/EN toggle (nav, section labels, RSVP copy, stub notes).
  Does NOT govern the Letters section — those show Spanish + English
  transcripts together, always, regardless of this toggle. See index.html
  §5 comment.
*/

const translations = {
  es: {
    'nav.itinerary': 'Itinerario',
    'nav.rsvp': 'RSVP',
    'nav.hotels': 'Hospedaje',
    'nav.dresscode': 'Dresscode',
    'nav.gifts': 'Mesa de regalos',
    'nav.gallery': 'Galería',

    'cover.eyebrow': 'Nos casamos',
    'cover.date': '16 de enero, 2027',
    'cover.city': 'Puerto Vallarta, Jalisco',

    'details.eyebrow': 'Detalles',
    'details.title': 'Ceremonia &amp; Recepción',
    'details.stub': 'Pendiente: horarios, nombres/direcciones de sedes, código de vestimenta.',

    'itinerary.eyebrow': 'Itinerario',
    'itinerary.title': 'Día 01 &amp; Día 02',
    'itinerary.stub': 'Pendiente: agenda de cada día y qué invitados asisten a cuál.',

    'rsvp.eyebrow': 'RSVP',
    'rsvp.title': 'Confirma tu asistencia',
    'rsvp.searchPrompt': 'Escribe tu nombre para buscar tu invitación.',
    'rsvp.searchPlaceholder': 'Tu nombre',
    'rsvp.searchButton': 'Buscar mi invitación',
    'rsvp.daysLabel': '¿A qué día(s) asistes?',
    'rsvp.day1': 'Día 01',
    'rsvp.day2': 'Día 02',
    'rsvp.partyLabel': '¿Cuántos de tu invitación asistirán (incluyéndote)?',
    'rsvp.mealLabel': 'Selección de menú',
    'rsvp.mealRegular': 'Regular',
    'rsvp.mealVeg': 'Vegetariano',
    'rsvp.mealVegan': 'Vegano',
    'rsvp.kidsLabel': '¿Asisten niños?',
    'rsvp.yes': 'Sí',
    'rsvp.no': 'No',
    'rsvp.submit': 'Enviar RSVP',
    'rsvp.thanks': '¡Gracias por confirmar!',

    'letters.eyebrow': 'Cartas',
    'letters.title': 'Para los novios',
    'letters.stub': 'Pendiente: diseño final de cada carta (hecho en Canva por la pareja).',

    'hotels.eyebrow': 'Hospedaje',
    'hotels.title': 'Dónde quedarse',
    'hotels.intro': 'Dale click a cualquier hotel para conocer todos los detalles. Están ordenados del más cercano al más lejano de la celebración.',
    'hotels.stub': 'Pendiente: hoteles recomendados, bloques de habitaciones, transporte.',

    'dresscode.eyebrow': 'Dresscode',
    'dresscode.title': 'Dresscode',
    'dresscode.stub': 'Pendiente: código de vestimenta para cada día del evento.',

    'gifts.eyebrow': 'Regalos',
    'gifts.title': 'Mesa de regalos',
    'gifts.stub': 'Pendiente: enlaces de mesa de regalos o nota de regalo en efectivo.',

    'gallery.eyebrow': 'Galería',
    'gallery.title': 'Nuestros momentos',
    'gallery.stub': 'Pendiente: set final de fotos de compromiso.',

    'nav.advice': 'Consejo',
    'advice.title': 'Secretos para un matrimonio feliz y una gran amistad',
    'advice.question': '¿Cuál es ese secreto que hace que el amor dure y la amistad crezca con los años?',
    'advice.prompt': 'Compártenos uno o varios consejos que, para ti, sean clave para construir un matrimonio feliz, divertido y lleno de complicidad.',
    'advice.placeholder': 'Escribe aquí...',
    'advice.signature': 'Firma (tu nombre)',
    'advice.anon': 'Anónimo',
    'advice.submit': 'Enviar',
    'advice.thanks': '¡Gracias por tu consejo!',

    'faq.eyebrow': 'FAQ',
    'faq.title': 'FAQ',
    'faq.stub': 'Pendiente: estacionamiento, clima, política de niños, contacto del día del evento.',
  },
  en: {
    'nav.itinerary': 'Itinerary',
    'nav.rsvp': 'RSVP',
    'nav.hotels': 'Hotels',
    'nav.dresscode': 'Dresscode',
    'nav.gifts': 'Registry',
    'nav.gallery': 'Gallery',

    'cover.eyebrow': "We're getting married",
    'cover.date': 'January 16, 2027',
    'cover.city': 'Puerto Vallarta, Jalisco',

    'details.eyebrow': 'Details',
    'details.title': 'Ceremony &amp; Reception',
    'details.stub': 'Pending: times, venue names/addresses, dress code.',

    'itinerary.eyebrow': 'Itinerary',
    'itinerary.title': 'Day 01 &amp; Day 02',
    'itinerary.stub': "Pending: each day's schedule and which guests are invited to which.",

    'rsvp.eyebrow': 'RSVP',
    'rsvp.title': 'Confirm your attendance',
    'rsvp.searchPrompt': 'Type your name to find your invitation.',
    'rsvp.searchPlaceholder': 'Your name',
    'rsvp.searchButton': 'Find my invitation',
    'rsvp.daysLabel': 'Which day(s) are you attending?',
    'rsvp.day1': 'Day 01',
    'rsvp.day2': 'Day 02',
    'rsvp.partyLabel': 'How many from your invitation will attend (including you)?',
    'rsvp.mealLabel': 'Meal selection',
    'rsvp.mealRegular': 'Regular',
    'rsvp.mealVeg': 'Vegetarian',
    'rsvp.mealVegan': 'Vegan',
    'rsvp.kidsLabel': 'Are kids attending?',
    'rsvp.yes': 'Yes',
    'rsvp.no': 'No',
    'rsvp.submit': 'Submit RSVP',
    'rsvp.thanks': 'Thank you for confirming!',

    'letters.eyebrow': 'Letters',
    'letters.title': 'For the couple',
    'letters.stub': 'Pending: final design for each letter (made in Canva by the couple).',

    'hotels.eyebrow': 'Hotels',
    'hotels.title': 'Where to stay',
    'hotels.intro': 'Tap any hotel to see its info. They\'re ordered closest to farthest from the party.',
    'hotels.stub': 'Pending: recommended hotels, room blocks, transport notes.',

    'dresscode.eyebrow': 'Dresscode',
    'dresscode.title': 'Dresscode',
    'dresscode.stub': 'Pending: dress code for each day of the event.',

    'gifts.eyebrow': 'Gifts',
    'gifts.title': 'Registry',
    'gifts.stub': 'Pending: registry links or a cash-gift note.',

    'gallery.eyebrow': 'Gallery',
    'gallery.title': 'Our moments',
    'gallery.stub': 'Pending: final set of engagement photos.',

    'nav.advice': 'Advice',
    'advice.title': 'Secrets for a happy marriage and a great friendship',
    'advice.question': 'What is the secret that makes love last and friendship grow through the years?',
    'advice.prompt': 'Share one or more pieces of advice that, for you, are key to building a marriage that is happy, fun, and full of complicity.',
    'advice.placeholder': 'Write here...',
    'advice.signature': 'Signature (your name)',
    'advice.anon': 'Anonymous',
    'advice.submit': 'Submit',
    'advice.thanks': 'Thank you for your advice!',

    'faq.eyebrow': 'FAQ',
    'faq.title': 'Frequently asked questions',
    'faq.stub': 'Pending: parking, weather, kids policy, day-of contact.',
  },
};

const LANG_KEY = 'mjm-lang';

function applyLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = translations[lang][key];
    if (value !== undefined) el.innerHTML = value;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = translations[lang][key];
    if (value !== undefined) el.setAttribute('placeholder', value);
  });

  const esLabel = document.querySelector('.lang-toggle__es');
  const enLabel = document.querySelector('.lang-toggle__en');
  if (esLabel && enLabel) {
    esLabel.classList.toggle('is-active', lang === 'es');
    enLabel.classList.toggle('is-active', lang === 'en');
  }

  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {
    /* private browsing or storage disabled — language just won't persist */
  }
}

function initLang() {
  let saved = 'es';
  try {
    saved = localStorage.getItem(LANG_KEY) || 'es';
  } catch (e) {
    /* ignore */
  }
  applyLang(saved);

  document.getElementById('langToggle').addEventListener('click', () => {
    const current = document.documentElement.lang === 'en' ? 'en' : 'es';
    applyLang(current === 'es' ? 'en' : 'es');
  });
}

initLang();
