// ==== IMPORTS FIREBASE (module) ====
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==== CONFIG FIREBASE (unique, réutilisée) ====
const firebaseConfig = {
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
};

// Évite l’erreur "App already exists"
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==== HEADER : boutons simples ====
const aboutBtn = document.getElementById('aboutBtn');
aboutBtn?.addEventListener('click', () => {
  window.location.href = 'about.html';
});

const notifBtn = document.getElementById('notificationsBtn');
const notifBadge = document.getElementById('notifBadge');

notifBtn?.addEventListener('click', () => {
  window.location.href = 'notifications.html';
});

// ==== BADGE NOTIFICATIONS FIRESTORE ====
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

// ==== MODALE D’AUTHENTIFICATION (GUARD requires-auth) ====
const modal = document.getElementById('authModal');
const btnClose = document.getElementById('authClose');
const btnLogin = document.getElementById('goLogin');
const btnSignup = document.getElementById('goSignup');

let pendingTarget = null;

function openModal() {
  if (modal) modal.classList.add('open');
}
function closeModal() {
  if (modal) modal.classList.remove('open');
  pendingTarget = null;
}
btnClose?.addEventListener('click', closeModal);

function updateAuthLinks(targetHref) {
  if (!btnLogin || !btnSignup) return;
  const enc = encodeURIComponent(targetHref);
  btnLogin.href  = `connexion.html?redirect=${enc}`;
  btnSignup.href = `inscription.html?redirect=${enc}`;
}

function wireAuthGuards(user) {
  document.querySelectorAll('a.requires-auth').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '#';
      if (user) {
        return; // connecté → laisse passer
      }
      e.preventDefault();
      pendingTarget = href;
      updateAuthLinks(href);
      sessionStorage.setItem('postLoginRedirect', href);
      openModal();
    }, { capture: true });
  });
}

// ==== SUIVI DE L'ÉTAT AUTH GLOBALE ====
onAuthStateChanged(auth, (user) => {
  const authenticated = !!user;
  window.__mhdIsAuthenticated = authenticated;
  window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));

  if (user) {
    console.log("Utilisateur connecté :", user.email);
  } else {
    console.log("Utilisateur non connecté");
  }

  wireAuthGuards(user);
});

// ==== COUPONS DU JOUR (floutage / défloutage) ====
(function () {
  const card = document.getElementById('dailyCouponsCard');
  if (!card) return;

  const tableWrapper = card.querySelector('[data-coupons-table]');
  const overlay = card.querySelector('[data-coupons-overlay]');

  const toggleAccess = (authenticated) => {
    if (!tableWrapper || !overlay) return;
    if (authenticated) {
      tableWrapper.classList.remove('coupon-blurred');
      overlay.classList.add('hidden');
      localStorage.setItem('loggedIn', 'true');
    } else {
      tableWrapper.classList.add('coupon-blurred');
      overlay.classList.remove('hidden');
      localStorage.removeItem('loggedIn');
    }
  };

  // État initial
  toggleAccess(window.__mhdIsAuthenticated === true);

  // Réagit aux changements d'état auth
  window.addEventListener('mhd:auth-state', (event) => {
    toggleAccess(Boolean(event.detail && event.detail.authenticated));
  });
})();

// ==== POPUP PUBLICITÉ AVEC COMPTE À REBOURS ====
(function () {
  const overlay = document.getElementById('promoOverlay');
  if (!overlay) return;
  const closeButtons = overlay.querySelectorAll('[data-action="promo-close"]');
  const backdrop = overlay.querySelector('.promo-backdrop');
  const body = document.body;
  const countdownContainer = overlay.querySelector('#promoCountdown');
  const countdownValue = countdownContainer?.querySelector('[data-countdown-value]');
  const countdownDuration = 15;
  let countdownInterval;

  const resetCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = undefined;
    }
    if (countdownValue) {
      countdownValue.textContent = String(countdownDuration);
    }
  };

  const hidePromo = () => {
    overlay.classList.remove('active');
    body.classList.remove('promo-open');
    resetCountdown();
  };

  const startCountdown = () => {
    if (!countdownValue) return;
    let remaining = countdownDuration;
    countdownValue.textContent = String(remaining);
    countdownInterval = setInterval(() => {
      remaining -= 1;
      countdownValue.textContent = String(Math.max(remaining, 0));
      if (remaining <= 0) {
        hidePromo();
      }
    }, 1000);
  };

  const showPromo = () => {
    overlay.classList.add('active');
    body.classList.add('promo-open');
    startCountdown();
  };

  // Affiche après 5 secondes
  setTimeout(showPromo, 5000);

  closeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      hidePromo();
    });
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target === backdrop) {
      hidePromo();
    }
  });
})();

// ==== ANIMATION AU SCROLL POUR .reveal ====
const io = new IntersectionObserver((entries)=> {
  entries.forEach(e => { 
    if (e.isIntersecting) e.target.classList.add('show'); 
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ==== MENU MOBILE ====
{
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }
}

// ==== BADGE "CONSEIL DU JOUR" (localStorage) ====
(function(){
  const badge = document.getElementById('badge-conseil');
  if(!badge) return;

  function refreshBadge(){
    const count = Number(localStorage.getItem('conseil_unread_count') || '0');
    if(count > 0){
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // initial
  refreshBadge();

  // si info mise à jour depuis une autre page/onglet
  window.addEventListener('storage', (e)=>{
    if(e.key === 'conseil_unread_count') refreshBadge();
  });

  // petit rafraîchissement périodique
  setInterval(refreshBadge, 5000);
})();
