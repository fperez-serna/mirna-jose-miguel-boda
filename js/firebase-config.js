/*
  Firebase config + initialized SDK handles, shared by the public RSVP
  flow (js/rsvp.js) and the admin panel (admin/admin.js). These values
  are not secret (they identify the project, not authenticate as it —
  real security lives in firestore.rules).
*/
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyADOT9gpwNSi5m_Q2RAUCFvSvxftlCL9s0',
  authDomain: 'mirna-jose-miguel-boda.firebaseapp.com',
  projectId: 'mirna-jose-miguel-boda',
  storageBucket: 'mirna-jose-miguel-boda.firebasestorage.app',
  messagingSenderId: '245236277541',
  appId: '1:245236277541:web:7ed3d0f46670dcc6077acc',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
