// Extracted from plan abonnement.html - script block 1
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
      authDomain: "mhd-pronos.firebaseapp.com",
      projectId: "mhd-pronos",
      storageBucket: "mhd-pronos.firebasestorage.app",
      messagingSenderId: "366441954219",
      appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Connaître l'état d'auth rapidement
    let isAuthed = null;
    onAuthStateChanged(auth, (user) => {
      const authenticated = !!user;
      window.__mhdIsAuthenticated = authenticated;
      window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
      isAuthed = authenticated;
    });

    // Boutons "S’abonner" => <a href="paiement.html" data-plan="...">
    const planLinks = document.querySelectorAll('[data-plan]');
    planLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const plan = JSON.parse(link.getAttribute('data-plan'));
        localStorage.setItem('selectedPlan', JSON.stringify(plan));
        // Si pas connecté → on interrompt et on redirige vers login
        if (!isAuthed) {
          e.preventDefault();
          alert("Connectez-vous pour continuer votre abonnement.");
          window.location.href = "connexion.html"; // ta page de connexion
        }
        // Sinon on laisse suivre le href="paiement.html"
      }, { passive: false });
    });

    // Animations reveal
    const io = new IntersectionObserver((entries)=> {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Menu mobile
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');
    if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));

// Extracted from plan abonnement.html - script block 2
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

  // ⚙️ CONFIG FIREBASE (identique aux autres pages)
  const firebaseConfig = {
    apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
    authDomain: "mhd-pronos.firebaseapp.com",
    projectId: "mhd-pronos",
    storageBucket: "mhd-pronos.firebasestorage.app",
    messagingSenderId: "366441954219",
    appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Références modale
  const modal = document.getElementById('authModal');
  const btnClose = document.getElementById('authClose');
  const btnLogin = document.getElementById('goLogin');
  const btnSignup = document.getElementById('goSignup');

  // Retient vers où on voulait aller
  let pendingTarget = null;

  // Ouvre/ferme modale
  function openModal(){ modal.classList.add('open'); }
  function closeModal(){ modal.classList.remove('open'); pendingTarget = null; }

  btnClose.addEventListener('click', closeModal);

  // Ajoute ?redirect=<url> aux liens login/inscription
  function updateAuthLinks(targetHref){
    const enc = encodeURIComponent(targetHref);
    btnLogin.href  = `connexion.html?redirect=${enc}`;
    btnSignup.href = `inscription.html?redirect=${enc}`;
  }

  // Intercepteur sur tous les liens protégés
  function wireAuthGuards(user){
    document.querySelectorAll('a.requires-auth').forEach(a=>{
      a.addEventListener('click', (e)=>{
        const href = a.getAttribute('href') || '#';
        if(user){ return; } // utilisateur connecté : laisser passer
        e.preventDefault();
        pendingTarget = href;
        updateAuthLinks(href);
        // En plus, on garde dans sessionStorage au cas où
        sessionStorage.setItem('postLoginRedirect', href);
        openModal();
      }, { capture:true });
    });
  }

  // Dès que l’état change, recâble les gardes
  onAuthStateChanged(auth, (user)=>{
    const authenticated = !!user;
    window.__mhdIsAuthenticated = authenticated;
    window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
    wireAuthGuards(user);
  });

