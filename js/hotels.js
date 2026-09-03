/*
  Hotel data backing the popup. Phone numbers are each hotel's own direct
  line in full international format (+52...) so they're dialable as-is
  from both the US and Mexico — no separate US/MX numbers needed, a
  phone's dialer handles the "+" country-code prefix either way.

  Grand Park Royal has no separate direct line publicly listed (RCD
  Hotels manages it alongside Barceló/Hilton here) — used the shared
  reservations line instead; swap in a direct one if the client gets it.
*/
const HOTELS = [
  {
    name: 'Hotel Casa Iguana',
    url: 'https://www.casaiguana.com.mx/en',
    phone: '+52 322 228 0786',
    address: 'Cinco de Mayo 455, Mismaloya, 48294 Puerto Vallarta, Jal.',
    time: '4 min de la fiesta',
  },
  {
    name: 'Barceló Puerto Vallarta All Inclusive',
    url: 'https://www.barcelo.com/en-us/barcelo-puerto-vallarta/',
    phone: '+52 322 226 0660',
    address: 'Manzanillo - Puerto Vallarta Km. 11.5, Zona Hotelera Sur, 48300 Mismaloya, Jal.',
    time: '6 min de la fiesta',
  },
  {
    name: 'Grand Park Royal All Inclusive',
    url: 'https://www.park-royalhotels.com/en/grand-park-royal-puerto-vallarta.html',
    phone: '+1 305 774 0040',
    address: 'Carretera Costera a Barra de Navidad Km 8.5, Zona Hotelera, 48390 Puerto Vallarta, Jal.',
    time: '10 min de la fiesta',
  },
  {
    name: 'Hilton Vallarta Riviera All-Inclusive Resort',
    url: 'https://www.hilton.com/en/hotels/pvrpahh-hilton-vallarta-riviera-all-inclusive-resort/',
    phone: '+52 322 176 1340',
    address: 'Carr Barra De Navidad Km 4.5, Zona Hotelera Sur, 48390 Puerto Vallarta, Jal.',
    time: '15 min de la fiesta',
  },
  {
    name: 'Hotel Playa Fiesta',
    url: 'https://www.playafiesta.com/',
    phone: '+52 322 221 6109',
    address: 'Carr. Costera a Barra de Navidad Km. 5, Zona Hotelera Sur, 48390 Puerto Vallarta, Jal.',
    time: '15 min de la fiesta',
  },
  {
    name: 'Hyatt Ziva Puerto Vallarta',
    url: 'https://www.hyatt.com/en-US/hotel/mexico/hyatt-ziva-puerto-vallarta/pvrif',
    phone: '+52 322 226 5000',
    address: 'Carretera a Barra de Navidad, Km. 3.5, Zona Hotelera Sur, 48390 Puerto Vallarta, Jal.',
    time: '21 min de la fiesta',
  },
];

const hotelModal = document.getElementById('hotelModal');
const hotelModalBackdrop = document.getElementById('hotelModalBackdrop');
const hotelModalClose = document.getElementById('hotelModalClose');
const hotelModalName = document.getElementById('hotelModalName');
const hotelModalLink = document.getElementById('hotelModalLink');
const hotelModalTime = document.getElementById('hotelModalTime');
const hotelModalPhone = document.getElementById('hotelModalPhone');
const hotelModalPhoneText = document.getElementById('hotelModalPhoneText');
const hotelModalMap = document.getElementById('hotelModalMap');

let lastFocusedHotspot = null;

function openHotelModal(index) {
  const hotel = HOTELS[index];
  if (!hotel) return;

  hotelModalLink.href = hotel.url;
  hotelModalLink.textContent = hotel.name;
  hotelModalTime.textContent = hotel.time;

  const telDigits = hotel.phone.replace(/[^\d+]/g, '');
  hotelModalPhone.href = `tel:${telDigits}`;
  hotelModalPhoneText.textContent = hotel.phone;

  const mapQuery = encodeURIComponent(`${hotel.name}, ${hotel.address}`);
  hotelModalMap.src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  hotelModal.hidden = false;
  hotelModalClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeHotelModal() {
  hotelModal.hidden = true;
  hotelModalMap.src = '';
  document.body.style.overflow = '';
  if (lastFocusedHotspot) lastFocusedHotspot.focus();
}

document.querySelectorAll('.hotels__hotspot').forEach((btn) => {
  btn.addEventListener('click', () => {
    lastFocusedHotspot = btn;
    openHotelModal(Number(btn.dataset.hotel));
  });
});

hotelModalClose.addEventListener('click', closeHotelModal);
hotelModalBackdrop.addEventListener('click', closeHotelModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !hotelModal.hidden) closeHotelModal();
});
