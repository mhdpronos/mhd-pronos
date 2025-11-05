// ----- Firebase (même projet que tes autres pages) -----
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    const db   = getFirestore(app);

    const form       = document.getElementById('form-signalement');
    const needAuth   = document.getElementById('need-auth');
    const statusSpan = document.getElementById('status');

    // Affichage conditionnel du formulaire selon l'auth
    onAuthStateChanged(auth, (user) => {
      const authenticated = !!user;
      window.__mhdIsAuthenticated = authenticated;
      window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
      if(user){
        needAuth.classList.add('hidden');
        form.classList.remove('hidden');
        form.dataset.uid = user.uid;
      }else{
        form.classList.add('hidden');
        needAuth.classList.remove('hidden');
      }
    });

    // Soumission vers Firestore
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusSpan.textContent = "Envoi en cours...";
      const uid    = form.dataset.uid || null;
      const nom    = document.getElementById('nom').value.trim();
      const prenom = document.getElementById('prenom').value.trim();
      const titre  = document.getElementById('titre').value.trim();
      const msg    = document.getElementById('message').value.trim();

      if(!nom || !prenom || !titre || !msg){
        statusSpan.textContent = "Veuillez remplir tous les champs.";
        return;
      }
      try{
        await addDoc(collection(db, "messages_signalement"), {
          uid, nom, prenom, titre, message: msg,
          date_envoi: serverTimestamp()
        });
        statusSpan.textContent = "Message envoyé avec succès ✅";
        form.reset();
        setTimeout(()=> statusSpan.textContent="", 3000);
      }catch(err){
        console.error(err);
        statusSpan.textContent = "Erreur lors de l’envoi. Réessaie.";
      }
    });

    // ----- Modale d’aperçu d’image -----
    const modal = document.getElementById('modal-view');
    const modalImg = document.getElementById('modal-img');
    const closeModalBtn = document.getElementById('close-modal');

    function openModal(src){
      if(!src) return;
      modalImg.src = src;
      modal.classList.add('active');
    }
    function closeModal(){
      modal.classList.remove('active');
      modalImg.src = "";
    }
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

    // Délégation : click sur carte/btn "Agrandir"
    document.addEventListener('click', (e)=>{
      const target = e.target.closest('[data-modal-target]');
      if(target){
        const src = target.getAttribute('data-img');
        openModal(src);
      }
    });

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
