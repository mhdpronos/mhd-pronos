/* ============================
   POPUP PUBLICITÉ (5 secondes)
============================ */

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
    if (countdownInterval) clearInterval(countdownInterval);
    if (countdownValue) countdownValue.textContent = countdownDuration;
  };

  const startCountdown = () => {
    if (!countdownValue) return;
    let remaining = countdownDuration;
    countdownValue.textContent = remaining;

    countdownInterval = setInterval(() => {
      remaining -= 1;
      countdownValue.textContent = Math.max(remaining, 0);

      if (remaining <= 0) hidePromo();
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

  closeButtons.forEach(button => {
    button.addEventListener('click', e => {
      e.preventDefault();
      hidePromo();
    });
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === backdrop) hidePromo();
  });

})();


/* =======================
   RÉVÉLATION AU SCROLL
======================= */

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('show');
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));


/* ===========================
   MENU MOBILE
=========================== */

const btn = document.getElementById('menuBtn');
const menu = document.getElementById('mobileMenu');

if (btn && menu) {
  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });
}


/* ======================================
   AUTHENTIFICATION — MODALE PROTÉGÉE
====================================== */

(function () {
  const modal = document.getElementById('authModal');
  const btnClose = document.getElementById('authClose');
  const btnLogin = document.getElementById('goLogin');
  const btnSignup = document.getElementById('goSignup');

  let pendingTarget = null;

  function openModal() { modal.classList.add('open'); }
  function closeModal() { modal.classList.remove('open'); pendingTarget = null; }

  btnClose?.addEventListener('click', closeModal);

  function updateAuthLinks(targetHref) {
    const enc = encodeURIComponent(targetHref);
    btnLogin.href = `connexion.html?redirect=${enc}`;
    btnSignup.href = `inscription.html?redirect=${enc}`;
  }

  function wireAuthGuards(user) {
    document.querySelectorAll('a.requires-auth').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href') || '#';
        if (user) return; // OK si connecté

        e.preventDefault();
        pendingTarget = href;
        updateAuthLinks(href);
        sessionStorage.setItem('postLoginRedirect', href);
        openModal();
      }, { capture: true });
    });
  }

  // Surveille l'état via event custom envoyé par Firebase
  window.addEventListener('mhd:auth-state', (e) => {
    wireAuthGuards(e.detail?.authenticated);
  });

})();


/* ===========================
   BADGE CONSEIL DU JOUR
=========================== */

(function () {
  const badge = document.getElementById('badge-conseil');
  if (!badge) return;

  function refreshBadge() {
    const count = Number(localStorage.getItem('conseil_unread_count') || '0');
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  refreshBadge();

  window.addEventListener('storage', e => {
    if (e.key === 'conseil_unread_count') refreshBadge();
  });

  setInterval(refreshBadge, 5000);
})();


/* ===================================
   COUPONS DU JOUR — AUTH VISUELLE
=================================== */

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


/* ===========================
   ABOUT & NOTIFICATIONS
=========================== */

document.getElementById('aboutBtn')?.addEventListener('click', () => {
  window.location.href = 'about.html';
});

document.getElementById('notificationsBtn')?.addEventListener('click', () => {
  window.location.href = 'notifications.html';
});


/* ===================================
   ANIMATIONS / TRANSITIONS CUSTOM
=================================== */

(function () {
  if (!window.transitionEnabled) return;
  try { import("./transition.js"); } catch {}
})();
