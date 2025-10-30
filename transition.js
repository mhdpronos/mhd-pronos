(function () {
  if (window.__mhdTransitionInitialized) {
    return;
  }
  window.__mhdTransitionInitialized = true;

  const style = document.createElement('style');
  style.setAttribute('data-transition-style', '');
  style.textContent = `
    #page-transition-overlay {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at center, rgba(99, 102, 241, 0.25), rgba(10, 10, 19, 0.94)), #05050a;
      color: #f8f8ff;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 1;
      visibility: visible;
      transition: opacity 0.4s ease, visibility 0.4s ease;
      pointer-events: all;
    }

    #page-transition-overlay.hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    #page-transition-overlay .transition-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      text-transform: uppercase;
      letter-spacing: 0.45em;
      font-weight: 700;
      font-size: 1.1rem;
    }

    #page-transition-overlay img {
      width: clamp(68px, 18vw, 110px);
      height: clamp(68px, 18vw, 110px);
      object-fit: cover;
      border-radius: 22px;
      box-shadow: 0 14px 40px rgba(8, 8, 17, 0.55);
      animation: transition-float 2.6s ease-in-out infinite;
    }

    #page-transition-overlay .transition-text {
      text-align: center;
      color: rgba(255, 255, 255, 0.85);
      animation: transition-shimmer 1.9s ease-in-out infinite;
    }

    @keyframes transition-float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    @keyframes transition-shimmer {
      0%, 100% {
        opacity: 0.55;
      }
      50% {
        opacity: 1;
      }
    }

    #mhd-ad-overlay {
      position: fixed;
      inset: 0;
      z-index: 11000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(1.5rem, 6vw, 3rem);
      background: radial-gradient(circle at top, rgba(17, 24, 39, 0.94), rgba(7, 11, 25, 0.88));
      backdrop-filter: blur(3px);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.45s ease, visibility 0.45s ease;
    }

    #mhd-ad-overlay.visible {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    #mhd-ad-overlay .ad-card {
      position: relative;
      width: min(460px, 100%);
      border-radius: 1.5rem;
      background: linear-gradient(145deg, rgba(37, 32, 72, 0.97), rgba(22, 18, 52, 0.98));
      border: 1px solid rgba(167, 139, 250, 0.28);
      box-shadow: 0 28px 60px rgba(9, 9, 20, 0.68);
      padding: clamp(1.75rem, 6vw, 2.6rem);
      transform: translateY(26px) scale(0.94);
      opacity: 0;
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease;
    }

    #mhd-ad-overlay.visible .ad-card {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    #mhd-ad-overlay .ad-close {
      position: absolute;
      top: 0.85rem;
      right: 0.85rem;
      width: 2.1rem;
      height: 2.1rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.12);
      color: #f9fafb;
      display: grid;
      place-items: center;
      font-size: 1.1rem;
      border: none;
      cursor: pointer;
      transition: background 0.25s ease, transform 0.25s ease;
    }

    #mhd-ad-overlay .ad-close:hover,
    #mhd-ad-overlay .ad-close:focus {
      background: rgba(255, 255, 255, 0.24);
      transform: scale(1.05);
    }

    #mhd-ad-overlay .ad-close:focus {
      outline: 2px solid rgba(255, 255, 255, 0.45);
      outline-offset: 2px;
    }

    #mhd-ad-overlay .ad-image {
      width: 100%;
      border-radius: 1rem;
      box-shadow: 0 18px 45px rgba(11, 9, 27, 0.55);
      margin-bottom: 1.6rem;
    }

    #mhd-ad-overlay .ad-title {
      font-size: clamp(1.6rem, 4.4vw, 2.25rem);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      text-align: center;
      color: #f9fafb;
      margin-bottom: 1rem;
    }

    #mhd-ad-overlay .ad-highlight {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      background: rgba(99, 102, 241, 0.2);
      color: rgba(209, 213, 219, 0.9);
      margin-bottom: 0.75rem;
    }

    #mhd-ad-overlay .ad-text {
      color: rgba(229, 231, 235, 0.85);
      font-size: 0.97rem;
      line-height: 1.6;
      text-align: center;
      margin-bottom: 1.25rem;
    }

    #mhd-ad-overlay .ad-text strong {
      color: #fbbf24;
    }

    #mhd-ad-overlay .ad-list {
      list-style: none;
      display: grid;
      gap: 0.75rem;
      margin: 0 0 1.6rem 0;
      padding: 0;
      color: rgba(226, 232, 240, 0.92);
      font-size: 0.95rem;
    }

    #mhd-ad-overlay .ad-list li {
      position: relative;
      padding-left: 1.5rem;
      line-height: 1.5;
    }

    #mhd-ad-overlay .ad-list li::before {
      content: '';
      position: absolute;
      top: 0.35rem;
      left: 0;
      width: 0.65rem;
      height: 0.65rem;
      border-radius: 999px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.7);
    }

    #mhd-ad-overlay .ad-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 0.95rem 1.25rem;
      border-radius: 999px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: linear-gradient(135deg, #16a34a, #22d3ee);
      color: #0f172a;
      box-shadow: 0 18px 40px rgba(34, 211, 238, 0.45);
      transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
      text-decoration: none;
    }

    #mhd-ad-overlay .ad-button:hover,
    #mhd-ad-overlay .ad-button:focus {
      transform: translateY(-2px);
      box-shadow: 0 22px 46px rgba(34, 211, 238, 0.6);
      filter: brightness(1.05);
    }

    @media (max-width: 480px) {
      #mhd-ad-overlay .ad-card {
        border-radius: 1.25rem;
        padding: 1.5rem 1.25rem 1.75rem;
      }

      #mhd-ad-overlay .ad-image {
        margin-bottom: 1.2rem;
      }
    }
  `;

  const applyStyles = () => {
    if (!document.head.contains(style)) {
      document.head.appendChild(style);
    }
  };

  if (document.head) {
    applyStyles();
  } else {
    document.addEventListener('DOMContentLoaded', applyStyles, { once: true });
  }

  const authState = {
    value: window.__mhdIsAuthenticated === true,
  };

  const updateAuthState = (value) => {
    authState.value = value === true;
  };

  if (typeof window.__mhdIsAuthenticated !== 'undefined') {
    updateAuthState(window.__mhdIsAuthenticated);
  }

  window.addEventListener('mhd:auth-state', (event) => {
    if (!event || typeof event.detail === 'undefined') {
      updateAuthState(window.__mhdIsAuthenticated);
      return;
    }
    const next = event.detail && typeof event.detail.authenticated !== 'undefined'
      ? event.detail.authenticated
      : window.__mhdIsAuthenticated;
    updateAuthState(next);
  });

  const overlay = document.createElement('div');
  overlay.id = 'page-transition-overlay';
  overlay.innerHTML = `
    <div class="transition-wrapper">
      <img src="logo.JPG" alt="Chargement MHD Pronos">
      <div class="transition-text">mhd pronos</div>
    </div>
  `;

  const appendOverlay = () => {
    if (!document.body.contains(overlay)) {
      document.body.appendChild(overlay);
    }
  };

  if (document.body) {
    appendOverlay();
  } else {
    document.addEventListener('DOMContentLoaded', appendOverlay, { once: true });
  }

  const hideOverlay = () => {
    window.requestAnimationFrame(() => overlay.classList.add('hidden'));
  };

  const showOverlay = () => {
    overlay.classList.remove('hidden');
    // Force reflow so that removing the class reliably restarts the transition
    void overlay.offsetHeight;
  };

  const shouldHandleNavigation = (link) => {
    if (!link) return false;
    const href = link.getAttribute('href');
    if (!href) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;

    const lowerHref = href.toLowerCase();
    if (lowerHref.startsWith('javascript:') || lowerHref.startsWith('mailto:') || lowerHref.startsWith('tel:')) {
      return false;
    }
    if (href.startsWith('#')) {
      return false;
    }

    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin) {
      return false;
    }
    if (destination.pathname === window.location.pathname && destination.search === window.location.search) {
      return destination.hash && destination.hash !== window.location.hash;
    }
    return true;
  };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented) {
      return;
    }

    const link = event.target.closest('a');
    if (!shouldHandleNavigation(link)) {
      return;
    }

    if (link.classList && link.classList.contains('requires-auth') && authState.value !== true) {
      return;
    }

    event.preventDefault();
    showOverlay();

    setTimeout(() => {
      window.location.href = link.href;
    }, 220);
  });

  window.addEventListener('load', hideOverlay, { once: false });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      hideOverlay();
    }
  });

  window.addEventListener('beforeunload', () => {
    showOverlay();
  });

  const AD_SESSION_KEY = 'mhd-pronos:ad-shown';

  const getAdFlag = () => {
    try {
      return window.sessionStorage.getItem(AD_SESSION_KEY);
    } catch (error) {
      return null;
    }
  };

  const setAdFlag = () => {
    try {
      window.sessionStorage.setItem(AD_SESSION_KEY, '1');
    } catch (error) {
      // ignore write failures (private browsing, etc.)
    }
  };

  const closeAdOverlay = (container) => {
    if (!container) {
      return;
    }

    const handleTransitionEnd = () => {
      container.removeEventListener('transitionend', handleTransitionEnd);
      if (container.parentElement) {
        container.parentElement.removeChild(container);
      }
    };

    container.classList.remove('visible');
    container.addEventListener('transitionend', handleTransitionEnd, { once: true });
    window.setTimeout(handleTransitionEnd, 600);
  };

  const renderAdOverlay = () => {
    if (!document.body || document.getElementById('mhd-ad-overlay')) {
      return;
    }

    const container = document.createElement('div');
    container.id = 'mhd-ad-overlay';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.setAttribute('aria-labelledby', 'mhd-ad-title');

    container.innerHTML = `
      <div class="ad-card">
        <button type="button" class="ad-close" aria-label="Fermer la publicité">&times;</button>
        <span class="ad-highlight">by mhd</span>
        <div class="ad-title" id="mhd-ad-title">OFFRE POUT TOI !</div>
        <img src="logo.JPG" alt="Promotion AXEX pour MHD Pronos" class="ad-image" loading="lazy" />
        <p class="ad-text">Inscris-toi maintenant en utilisant le code promo <strong>AXEX</strong> et profite de <strong>200% de bonus jusqu'à 169.000F</strong> sur ton premier dépôt.</p>
        <ul class="ad-list">
          <li>100% de bonus sur tes rechargements chaque lundi et vendredi.</li>
          <li>Un remboursement sur toutes tes pertes chaque fin du mois.</li>
        </ul>
        <a class="ad-button" href="https://bit.ly/1xbetins_mhd_axex" target="_blank" rel="noopener noreferrer">S'INSCRIRE MAINTENANT</a>
      </div>
    `;

    function closeAndCleanup() {
      document.removeEventListener('keydown', handleKeyDown);
      closeAdOverlay(container);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' || event.key === 'Esc') {
        closeAndCleanup();
      }
    }

    const closeButton = container.querySelector('.ad-close');
    if (closeButton) {
      closeButton.addEventListener('click', closeAndCleanup);
    }

    document.addEventListener('keydown', handleKeyDown);

    container.addEventListener('click', (event) => {
      if (event.target === container) {
        closeAndCleanup();
      }
    });

    document.body.appendChild(container);
    setAdFlag();

    window.requestAnimationFrame(() => {
      container.classList.add('visible');
    });
  };

  const scheduleAdOverlay = () => {
    if (getAdFlag() === '1') {
      return;
    }

    window.setTimeout(() => {
      if (getAdFlag() === '1') {
        return;
      }
      renderAdOverlay();
    }, 5000);
  };

  if (document.readyState === 'complete') {
    scheduleAdOverlay();
  } else {
    window.addEventListener('load', scheduleAdOverlay, { once: true });
  }
})();
