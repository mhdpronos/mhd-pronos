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

  toggleAccess(window.__mhdIsAuthenticated === true);

  window.addEventListener('mhd:auth-state', (event) => {
    toggleAccess(Boolean(event.detail && event.detail.authenticated));
  });
})();

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

  const hidePromo = () => {
    overlay.classList.remove('active');
    body.classList.remove('promo-open');
    resetCountdown();
  };

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

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => io.observe(element));

const menuButton = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

const aboutBtn = document.getElementById('aboutBtn');
aboutBtn?.addEventListener('click', () => {
  window.location.href = 'about.html';
});

const notifBtn = document.getElementById('notificationsBtn');
const notifBadge = document.getElementById('notifBadge');
notifBtn?.addEventListener('click', () => {
  window.location.href = 'notifications.html';
});

const infofootBadge = document.getElementById('infofoot-badge');

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

function refreshBadgeConseil() {
  const badge = document.getElementById('badge-conseil');
  if (!badge) return;

  function refreshBadge() {
    const count = Number(localStorage.getItem('conseil_unread_count') || '0');
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  refreshBadge();

  window.addEventListener('storage', (event) => {
    if (event.key === 'conseil_unread_count') refreshBadge();
  });

  setInterval(refreshBadge, 5000);
}

refreshBadgeConseil();

const modal = document.getElementById('authModal');
const btnClose = document.getElementById('authClose');
const btnLogin = document.getElementById('goLogin');
const btnSignup = document.getElementById('goSignup');
let pendingTarget = null;

function openModal() {
  modal?.classList.add('open');
}

function closeModal() {
  modal?.classList.remove('open');
  pendingTarget = null;
}

btnClose?.addEventListener('click', closeModal);

function updateAuthLinks(targetHref) {
  const enc = encodeURIComponent(targetHref);
  if (btnLogin) btnLogin.href = `connexion.html?redirect=${enc}`;
  if (btnSignup) btnSignup.href = `inscription.html?redirect=${enc}`;
}

function wireAuthGuards(user) {
  document.querySelectorAll('a.requires-auth').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href') || '#';
      if (user) {
        return;
      }
      event.preventDefault();
      pendingTarget = href;
      updateAuthLinks(href);
      sessionStorage.setItem('postLoginRedirect', href);
      openModal();
    }, { capture: true });
  });
}

onAuthStateChanged(auth, (user) => {
  const authenticated = !!user;
  window.__mhdIsAuthenticated = authenticated;
  window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
  wireAuthGuards(user);
  if (user) {
    console.log('Utilisateur connecté :', user.email);
  } else {
    console.log('Utilisateur non connecté');
  }
});

refreshNotificationBadge();
refreshInfofootBadge();

setInterval(() => {
  refreshNotificationBadge();
  refreshInfofootBadge();
}, 60000);
