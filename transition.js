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
})();
