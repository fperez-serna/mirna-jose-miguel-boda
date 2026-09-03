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
    'namesBanner.meta': '16 DE ENERO, 2027<br class="names-banner__break" /> PUERTO VALLARTA, JALISCO',

    'details.eyebrow': 'Detalles',
    'details.title': 'Ceremonia &amp; Recepción',
    'details.stub': 'Pendiente: horarios, nombres/direcciones de sedes, código de vestimenta.',
    'details.ceremonyTitle': 'Ceremonia',
    'details.ceremonyDatetime': '16 de enero de 2027 &middot; 12:00 p.m.',
    'details.ceremonyVenue': 'Iglesia de Mismaloya<br />Calle 5 de Mayo S/N<br />48294 Puerto Vallarta, Jalisco',
    'details.ceremonyDesc': 'Acompáñanos a celebrar el momento en que comienza nuestra historia para siempre.',
    'details.receptionTitle': 'Recepción',
    'details.receptionDatetime': '16 de enero de 2027 &middot; 1:00 p.m.',
    'details.receptionVenue': 'Cándida Azucena 88<br />48300 Puerto Vallarta, Jalisco',
    'details.receptionDesc': 'Después de la ceremonia, nos vemos para brindar, comer, bailar y celebrar juntos.',

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
    'dresscode.womenLabel': 'Mujeres &middot; Formal de playa',
    'dresscode.womenDesc': 'Vestidos largos o midi, telas ligeras, colores y estampados que se sientan elegantes, frescos y perfectos para celebrar junto al mar.',
    'dresscode.menLabel': 'Hombres &middot; Traje de lino',
    'dresscode.menDesc': 'Traje de lino o telas ligeras, acompañado de camisa y zapatos acordes a una celebración formal en la playa.',
    'dresscode.note': 'Las guayaberas son muy lindas —pero esta vez, no forman parte del dress code de la boda.',
    'dresscode.moodboardQ': '¿Todavía tienes dudas sobre qué ponerte?',
    'dresscode.moodboardText': 'Échale un vistazo a nuestro moodboard en Pinterest para inspirarte y conocer mejor el estilo que imaginamos para este día.',
    'dresscode.moodboardLink': 'Ver moodboard en Pinterest →',

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
    'faq.q1': '¿A qué hora es la ceremonia y la recepción?',
    'faq.a1': '<p>La misa es a las 12:00 p.m. en Iglesia Mismaloya (Calle 5 de Mayo S/N, 48294 Puerto Vallarta). La recepción comienza a la 1:00 p.m. en Cándida Azucena 88, 48300 Puerto Vallarta, Jal.</p>',
    'faq.q2': '¿En qué hotel me puedo quedar?',
    'faq.a2': '<p>Hay varias opciones cerca del venue, ordenadas por distancia:</p><ul><li>Hotel Casa Iguana — 4 min</li><li>Barceló Puerto Vallarta All Inclusive — 6 min</li><li>Grand Park Royal All Inclusive — 10 min</li><li>Hilton Vallarta Riviera All-Inclusive Resort — 15 min</li><li>Hotel Playa Fiesta — 15 min</li><li>Hyatt Ziva Puerto Vallarta — 21 min</li></ul>',
    'faq.q3': '¿Cómo llego del aeropuerto a la zona de la boda?',
    'faq.a3': '<p>En el <a href="https://www.aeropuertosgap.com.mx/es/puerto-vallarta.html" target="_blank" rel="noopener">aeropuerto de Puerto Vallarta</a> hay sitio de taxis a la mano, es la opción segura y directa — aprox. $700–800 MXN. Uber sí existe en Puerto Vallarta y es más económico (aprox. $300–400 MXN), pero <strong>no puede recoger pasajeros dentro del aeropuerto</strong>, solo dejarlos ahí. Para llegar desde el aeropuerto hay que tomar taxi de sitio; para moverte después durante tu estancia, Uber es una buena opción más barata.</p>',
    'faq.q4': '¿Puedo dar un regalo en efectivo o transferencia?',
    'faq.a4': '<p>Sí, hay dos opciones:</p><ul><li>A nombre de Mirna: Santander, cuenta 014730605754380960</li><li>A nombre de José Miguel: <a href="https://www.zellepay.com/" target="_blank" rel="noopener">Zelle</a> a su celular (número disponible directamente con la pareja)</li></ul>',
    'faq.q5': '¿Puedo llevar niños?',
    'faq.a5': '<p>Nos encantan los pequeños, pero debido a que tendremos una celebración íntima y con cupo limitado, únicamente podrán acompañarnos los niños que estén incluidos en la invitación.</p><p>Si el nombre de tu hijo o hija aparece en tu invitación, ¡lo esperamos con mucho gusto!</p><p>Gracias por ayudarnos a mantener este día tan especial tal como lo hemos planeado.</p>',
    'faq.q6': '¿Hay fecha límite para confirmar asistencia (RSVP)?',
    'faq.a6': '<p>Pendiente de confirmar con Mirna.</p>',
    'faq.q7': '¿Hay opciones vegetarianas o veganas?',
    'faq.a7': '<p>En esta ocasión no contaremos con un menú especial vegetariano o vegano. Agradecemos mucho tu comprensión.</p>',
    'faq.q8': '¿A qué hora termina el evento?',
    'faq.a8': '<p>Pendiente de confirmar con Mirna.</p>',
    'faq.q9': '¿Hay estacionamiento en la recepción?',
    'faq.a9': '<p>Pendiente de confirmar con Mirna.</p>',
    'faq.q10': '¿Puedo llevar acompañante (+1)?',
    'faq.a10': '<p>Si tu invitación incluye un <em>+1</em>, ¡puedes venir con acompañante! Si tu invitación es individual, significa que hemos reservado ese lugar especialmente para ti.</p>',
    'faq.q11': '¿Qué tan lejos está el aeropuerto de la zona del evento?',
    'faq.a11': '<p>Aproximadamente 27 km entre el aeropuerto y la dirección de recepción (Cándida Azucena 88), unos 35–40 minutos en auto dependiendo del tráfico.</p>',
  },
  en: {
    'nav.itinerary': 'Itinerary',
    'nav.rsvp': 'RSVP',
    'nav.hotels': 'Hotels',
    'nav.dresscode': 'Dresscode',
    'nav.gifts': 'Registry',
    'nav.gallery': 'Gallery',

    'cover.eyebrow': "We're getting married",
    'cover.date': 'January 16th, 2027',
    'cover.city': 'Puerto Vallarta, Jalisco',
    'namesBanner.meta': 'JANUARY 16TH, 2027<br class="names-banner__break" /> PUERTO VALLARTA, JALISCO',

    'details.eyebrow': 'Details',
    'details.title': 'Ceremony &amp; Reception',
    'details.stub': 'Pending: times, venue names/addresses, dress code.',
    'details.ceremonyTitle': 'Ceremony',
    'details.ceremonyDatetime': 'January 16th, 2027 &middot; 12:00 pm',
    'details.ceremonyVenue': 'Iglesia de Mismaloya<br />Calle 5 de Mayo S/N<br />48294 Puerto Vallarta, Jalisco',
    'details.ceremonyDesc': 'Join us to celebrate the moment our story together truly begins.',
    'details.receptionTitle': 'Reception',
    'details.receptionDatetime': 'January 16th, 2027 &middot; 1:00 pm',
    'details.receptionVenue': 'Cándida Azucena 88<br />48300 Puerto Vallarta, Jalisco',
    'details.receptionDesc': 'After the ceremony, join us to toast, eat, dance, and celebrate together.',

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
    'dresscode.womenLabel': 'Women &middot; Beach formal',
    'dresscode.womenDesc': 'Long or midi dresses, light fabrics, colors and prints that feel elegant, fresh, and perfect for celebrating by the sea.',
    'dresscode.menLabel': 'Men &middot; Linen suit',
    'dresscode.menDesc': 'A linen suit or other light fabric, with a shirt and shoes fitting a formal beach celebration.',
    'dresscode.note': 'Guayaberas are lovely — but this time, they\'re not part of the wedding dress code.',
    'dresscode.moodboardQ': 'Still not sure what to wear?',
    'dresscode.moodboardText': 'Take a look at our Pinterest moodboard for inspiration and to get a better feel for the style we have in mind for this day.',
    'dresscode.moodboardLink': 'See moodboard on Pinterest →',

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
    'faq.q1': 'What time are the ceremony and reception?',
    'faq.a1': '<p>The ceremony is at 12:00 pm at Iglesia Mismaloya (Calle 5 de Mayo S/N, 48294 Puerto Vallarta). The reception starts at 1:00 pm at Cándida Azucena 88, 48300 Puerto Vallarta, Jal.</p>',
    'faq.q2': 'Which hotel can I stay at?',
    'faq.a2': '<p>There are several options near the venue, ordered by distance:</p><ul><li>Hotel Casa Iguana — 4 min</li><li>Barceló Puerto Vallarta All Inclusive — 6 min</li><li>Grand Park Royal All Inclusive — 10 min</li><li>Hilton Vallarta Riviera All-Inclusive Resort — 15 min</li><li>Hotel Playa Fiesta — 15 min</li><li>Hyatt Ziva Puerto Vallarta — 21 min</li></ul>',
    'faq.q3': 'How do I get from the airport to the wedding area?',
    'faq.a3': '<p>At the <a href="https://www.aeropuertosgap.com.mx/es/puerto-vallarta.html" target="_blank" rel="noopener">Puerto Vallarta airport</a> there\'s an official taxi stand right there, the safe and direct option — approx. $700–800 MXN. Uber does exist in Puerto Vallarta and is cheaper (approx. $300–400 MXN), but <strong>it cannot pick up passengers inside the airport</strong>, only drop them off. To get from the airport you\'ll need an official taxi; to get around later during your stay, Uber is a good, cheaper option.</p>',
    'faq.q4': 'Can I give a cash or bank transfer gift?',
    'faq.a4': '<p>Yes, there are two options:</p><ul><li>To Mirna: Santander, account 014730605754380960</li><li>To José Miguel: <a href="https://www.zellepay.com/" target="_blank" rel="noopener">Zelle</a> to his cell number (available directly from the couple)</li></ul>',
    'faq.q5': 'Can I bring kids?',
    'faq.a5': '<p>We love little ones, but since this will be an intimate celebration with limited capacity, only children included in the invitation will be able to join us.</p><p>If your son or daughter\'s name appears on your invitation, we\'d love to have them!</p><p>Thank you for helping us keep this special day exactly as we\'ve planned it.</p>',
    'faq.q6': 'Is there an RSVP deadline?',
    'faq.a6': '<p>Still to be confirmed with Mirna.</p>',
    'faq.q7': 'Are there vegetarian or vegan options?',
    'faq.a7': '<p>There won\'t be a special vegetarian or vegan menu this time. We really appreciate your understanding.</p>',
    'faq.q8': 'What time does the event end?',
    'faq.a8': '<p>Still to be confirmed with Mirna.</p>',
    'faq.q9': 'Is there parking at the reception?',
    'faq.a9': '<p>Still to be confirmed with Mirna.</p>',
    'faq.q10': 'Can I bring a plus-one?',
    'faq.a10': '<p>If your invitation includes a <em>+1</em>, you\'re welcome to bring a guest! If your invitation is individual, it means we\'ve reserved that spot especially for you.</p>',
    'faq.q11': 'How far is the airport from the event area?',
    'faq.a11': '<p>About 27 km between the airport and the reception address (Cándida Azucena 88), roughly 35–40 minutes by car depending on traffic.</p>',
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
