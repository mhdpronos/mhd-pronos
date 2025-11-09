// Extracted from index.html - script block 1
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

// Extracted from index.html - script block 2
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

// Extracted from index.html - script block 3
const io = new IntersectionObserver((entries)=> {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Extracted from index.html - script block 4
// Toggle menu mobile
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');
    if (btn && menu) {
      btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
      });
    }

// Extracted from index.html - script block 6
// Met à jour le badge "CONSEIL DU JOUR" à partir du localStorage
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

    // 1) initial
    refreshBadge();

    // 2) si info mise à jour depuis une autre page/onglet
    window.addEventListener('storage', (e)=>{
      if(e.key === 'conseil_unread_count') refreshBadge();
    });

    // 3) petit rafraîchissement périodique au cas où
    setInterval(refreshBadge, 5000);
  })();

