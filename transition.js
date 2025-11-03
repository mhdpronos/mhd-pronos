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

    #floating-home-button {
      position: fixed;
      bottom: clamp(18px, 3vw, 32px);
      right: clamp(18px, 3vw, 32px);
      z-index: 9998;
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.9rem 1.35rem;
      border-radius: 9999px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(236, 72, 153, 0.95));
      color: #ffffff;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-size: 0.85rem;
      text-decoration: none;
      box-shadow: 0 18px 40px rgba(99, 102, 241, 0.35), 0 10px 22px rgba(8, 8, 17, 0.55);
      transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
    }

    #floating-home-button:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 22px 46px rgba(129, 140, 248, 0.45), 0 12px 26px rgba(8, 8, 17, 0.6);
      filter: brightness(1.05);
    }

    #floating-home-button:active {
      transform: translateY(-1px) scale(0.99);
    }

    #floating-home-button .floating-home-icon {
      width: 2.35rem;
      height: 2.35rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.16);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
    }

    #floating-home-button svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    @media (max-width: 480px) {
      #floating-home-button {
        padding: 0.75rem 1.1rem;
        font-size: 0.78rem;
      }

      #floating-home-button .floating-home-icon {
        width: 2.1rem;
        height: 2.1rem;
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

  const overlay = document.createElement('div');
  overlay.id = 'page-transition-overlay';
  overlay.innerHTML = `
    <div class="transition-wrapper">
      <img src="anime.gif" alt="Chargement MHD Pronos">
      <div class="transition-text">Chargement...</div>
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

  const createHomeButton = () => {
    if (document.getElementById('floating-home-button')) {
      return;
    }

    const homeButton = document.createElement('a');
    homeButton.id = 'floating-home-button';
    homeButton.href = 'index.html';
    homeButton.setAttribute('aria-label', "Revenir à l'accueil");
    homeButton.innerHTML = `
      <span class="floating-home-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.5 10.75L12 4l7.5 6.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M6.75 9.25V19.5a.75.75 0 0 0 .75.75h9a.75.75 0 0 0 .75-.75V9.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M10 20.25v-5a2 2 0 0 1 4 0v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span class="floating-home-text">Accueil</span>
    `;

    document.body.appendChild(homeButton);
  };

  if (document.body) {
    createHomeButton();
  } else {
    document.addEventListener('DOMContentLoaded', createHomeButton, { once: true });
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
})();

(function injectPushModule() {
  if (window.__mhdPushScriptInjected) {
    return;
  }
  window.__mhdPushScriptInjected = true;

  const loadPushScript = () => {
    if (document.querySelector('script[data-mhd-push]')) {
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'push-notifications.js';
    script.setAttribute('data-mhd-push', '');
    document.head.appendChild(script);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPushScript, { once: true });
  } else {
    loadPushScript();
  }
})();
