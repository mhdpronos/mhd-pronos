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

const io = new IntersectionObserver((entries)=> {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const btn = document.getElementById('menuBtn');
const menu = document.getElementById('mobileMenu');
if (btn && menu) {
  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });
}

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

  refreshBadge();

  window.addEventListener('storage', (e)=>{
    if(e.key === 'conseil_unread_count') refreshBadge();
  });

  setInterval(refreshBadge, 5000);
})();
