// Extracted from notifications.html - script block 1
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
      authDomain: "mhd-pronos.firebaseapp.com",
      projectId: "mhd-pronos",
      storageBucket: "mhd-pronos.firebasestorage.app",
      messagingSenderId: "366441954219",
      appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    async function loadNotifications() {
      const container = document.getElementById("notificationsContainer");
      container.innerHTML = "<p class='text-center text-gray-400'>Chargement des notifications...</p>";

      const q = query(collection(db, "notifications"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        container.innerHTML = "<p class='text-center text-gray-500'>Aucune notification pour le moment.</p>";
        return;
      }

      container.innerHTML = "";
      const now = Date.now();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const diffHeures = (now - data.date.toMillis()) / (1000 * 60 * 60);
        const isNew = diffHeures < 24; // 🆕 badge si moins de 24h

        container.innerHTML += `
          <div class="notification-card">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-semibold">${data.titre} ${isNew ? "<span class='badge-new'>Nouveau</span>" : ""}</h3>
              <span class="text-sm text-gray-400">${new Date(data.date.toMillis()).toLocaleString()}</span>
            </div>
            <p class="text-gray-300 mb-2">${data.message}</p>
            ${data.lien ? `<a href="${data.lien}" target="_blank" class="text-blue-400 hover:underline">Voir plus</a>` : ""}
          </div>
        `;
      });
    }

    loadNotifications();

// Extracted from notifications.html - script block 2
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
    authDomain: "mhd-pronos.firebaseapp.com",
    projectId: "mhd-pronos",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  async function marquerToutesCommeLues() {
    const querySnapshot = await getDocs(collection(db, "notifications"));
    querySnapshot.forEach(async (notif) => {
      await updateDoc(doc(db, "notifications", notif.id), { lu: true });
    });
  }

  marquerToutesCommeLues();

// Extracted from notifications.html - script block 3
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔊 Charge le son de notification
const sound = new Audio("sounds/notification.mp3");

let previousCount = 0;

// 🧩 Surveille en temps réel la collection "notifications"
onSnapshot(collection(db, "notifications"), (snapshot) => {
  const currentCount = snapshot.docs.length;

  if (previousCount && currentCount > previousCount) {
    // 🆕 Nouvelle notification détectée → joue le son
    sound.play().catch(() => {
      console.warn("L'utilisateur doit interagir une fois avec le site avant que le son puisse jouer.");
    });
  }

  previousCount = currentCount;
});

// Extracted from notifications.html - script block 4
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

