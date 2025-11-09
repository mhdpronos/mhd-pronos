// Extracted from infofoot.html - script block 1
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
      authDomain: "mhd-pronos.firebaseapp.com",
      projectId: "mhd-pronos",
      storageBucket: "mhd-pronos.appspot.com",
      messagingSenderId: "366441954219",
      appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const colRef = collection(db, "infofoot");
    const q = query(colRef, orderBy("publishedAt", "desc"));
    const $list = document.getElementById("newsList");

    let allDocs = [];
    let currentCat = "ALL";

    const fmtDate = ts => {
      if (!ts) return "";
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString("fr-FR");
    };

    function render(){
      const rows = currentCat==="ALL" ? allDocs : allDocs.filter(d => (d.category||"") === currentCat);
      if (rows.length === 0){
        $list.innerHTML = `<div class='col-span-full glass rounded-2xl p-6 text-center text-sm text-white/70'>Aucune info disponible.</div>`;
        return;
      }
      $list.innerHTML = rows.map(d => `
        <article class="glass rounded-2xl p-3 card-anim fade-in">
          <div class="relative">
            ${d.imageUrl ? `<img src="${d.imageUrl}" class="w-full h-44 object-cover rounded-xl mb-3">`
                          : `<div class="w-full h-44 rounded-xl mb-3 bg-gray-800"></div>`}
            <span class="badge-cat absolute top-2 left-2">${d.category || "Info"}</span>
          </div>
          <h4 class="font-bold text-lg leading-tight">${d.title || "(Sans titre)"}</h4>
          <div class="text-xs text-white/60 mt-1">${fmtDate(d.publishedAt)}</div>
          <p class="text-sm text-white/80 mt-2">${(d.body || "").slice(0,140)}...</p>
          <button class="mt-3 px-3 py-1.5 rounded-xl text-sm btn-primary" onclick="openModal('${d.id}')">Lire</button>
        </article>
      `).join("");
    }

    window.openModal = id => {
      const d = allDocs.find(x => x.id === id);
      if (!d) return;
      document.getElementById("mTitle").textContent = d.title;
      document.getElementById("mMeta").textContent = `${d.category || "Info"} • ${fmtDate(d.publishedAt)}`;
      const img = document.getElementById("mImg");
      if (d.imageUrl){ img.src = d.imageUrl; img.classList.remove("hidden"); }
      else img.classList.add("hidden");
      document.getElementById("mBody").textContent = d.body || "";
      document.getElementById("modal").classList.add("open");
    };

    document.getElementById("mClose").addEventListener("click",()=>document.getElementById("modal").classList.remove("open"));
    document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")document.getElementById("modal").classList.remove("open")});

    document.querySelectorAll("[data-cat]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
        btn.classList.add("active");
        currentCat = btn.getAttribute("data-cat");
        render();
      });
    });

    onSnapshot(q, snap=>{
      allDocs = snap.docs.map(d=>({id:d.id, ...d.data()}));
      render();
      try {
        localStorage.setItem('infofoot_read_count', String(snap.size));
      } catch (err) {
        console.warn('Impossible de mettre à jour le compteur infofoot :', err);
      }
    });

// Extracted from infofoot.html - script block 2
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

  const here = window.location.pathname.split('/').pop() || 'index.html';

  onAuthStateChanged(auth, (user)=>{
    const authenticated = !!user;
    window.__mhdIsAuthenticated = authenticated;
    window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
    if(!user){
      // pas connecté → on garde la cible et on pousse vers la connexion
      sessionStorage.setItem('postLoginRedirect', here);
      const enc = encodeURIComponent(here);
      window.location.href = `connexion.html?redirect=${enc}`;
    }
  });

