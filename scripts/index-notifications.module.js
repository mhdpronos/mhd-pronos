import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
  const authenticated = !!user;
  window.__mhdIsAuthenticated = authenticated;
  window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
  if (user) {
    console.log("Utilisateur connecté :", user.email);
  } else {
    console.log("Utilisateur non connecté");
  }
});

const aboutBtn = document.getElementById('aboutBtn');
aboutBtn?.addEventListener('click', () => {
  window.location.href = 'about.html';
});

const notifBtn = document.getElementById('notificationsBtn');
const notifBadge = document.getElementById('notifBadge');

notifBtn?.addEventListener('click', () => {
  window.location.href = 'notifications.html';
});

async function refreshNotificationBadge() {
  if (!notifBadge) return;
  try {
    const q = query(collection(db, 'notifications'), where('lu', '==', false));
    const snapshot = await getDocs(q);
    const unread = snapshot.size;
    if (unread > 0) {
      notifBadge.textContent = unread > 99 ? '99+' : String(unread);
      notifBadge.classList.remove('hidden');
    } else {
      notifBadge.classList.add('hidden');
    }
  } catch (err) {
    console.error('Erreur de chargement des notifications :', err);
    notifBadge.classList.add('hidden');
  }
}

const infofootBadge = document.getElementById('infofoot-badge');

async function refreshInfofootBadge() {
  if (!infofootBadge) return;
  try {
    const snapshot = await getDocs(collection(db, 'infofoot'));
    const totalNews = snapshot.size;
    let lastRead = Number(localStorage.getItem('infofoot_read_count') || 0);

    if (window.location.pathname.includes('infofoot.html')) {
      localStorage.setItem('infofoot_read_count', String(totalNews));
      lastRead = totalNews;
    }

    if (totalNews > lastRead) {
      const diff = totalNews - lastRead;
      infofootBadge.textContent = diff > 9 ? '9+' : String(diff);
      infofootBadge.classList.remove('hidden');
    } else {
      infofootBadge.classList.add('hidden');
    }
  } catch (err) {
    console.error('Erreur de chargement des actualités :', err);
    infofootBadge.classList.add('hidden');
  }
}

refreshNotificationBadge();
refreshInfofootBadge();

setInterval(() => {
  refreshNotificationBadge();
  refreshInfofootBadge();
}, 60000);
