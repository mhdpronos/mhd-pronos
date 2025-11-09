// Extracted from conseil.html - script block 1
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    // ⚙️ CONFIG FIREBASE (identique à tes autres pages)
    const firebaseConfig = {
      apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
      authDomain: "mhd-pronos.firebaseapp.com",
      projectId: "mhd-pronos",
      storageBucket: "mhd-pronos.firebasestorage.app",
      messagingSenderId: "366441954219",
      appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
    };

    const app = initializeApp(firebaseConfig);
    const db  = getFirestore(app);

    // 📚 Collection Firestore: "conseils"
    // Champs attendus par document :
    // - title (string) - OBLIGATOIRE
    // - body (string)  - OBLIGATOIRE
    // - imageUrl (string, ex: lien imgbb) - OPTIONNEL
    // - category (string: "Astuce", "Pari du jour", "Motivation", "Discipline", "Analyse") - OBLIGATOIRE
    // - publishedAt (Timestamp Firestore) - OBLIGATOIRE
    // - pinned (bool) - OPTIONNEL
    const colRef = collection(db, "conseils");
    const q = query(colRef, orderBy("publishedAt", "desc"));

    // 🧠 État
    let allDocs = [];
    let currentCat = "ALL";

    // 🧩 Helpers
    const fmtDate = (ts) => {
      if(!ts) return "";
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleString();
    };

    const $list = document.getElementById("adviceList");
    const $modal = document.getElementById("modal");
    const $mTitle = document.getElementById("mTitle");
    const $mMeta = document.getElementById("mMeta");
    const $mImg = document.getElementById("mImg");
    const $mBody = document.getElementById("mBody");
    const $mClose = document.getElementById("mClose");
    const $markAll = document.getElementById("markAllRead");

    function cardTemplate(d){
      const cat = d.category || "Conseil";
      const dateTxt = fmtDate(d.publishedAt);
      const img = d.imageUrl || "";
      const excerpt = (d.body || "").slice(0, 140) + ((d.body || "").length > 140 ? "…" : "");

      return `
        <article class="glass rounded-2xl p-3 card-anim fade-in">
          <div class="relative">
            ${img ? `<img src="${img}" alt="" class="w-full h-44 object-cover rounded-xl mb-3">`
                  : `<div class="w-full h-44 rounded-xl mb-3" style="background:linear-gradient(135deg,#2a2f45,#1b2134)"></div>`}
            <span class="badge-cat absolute top-2 left-2">${cat}</span>
          </div>
          <h4 class="font-bold text-lg leading-tight">${d.title || "(Sans titre)"}</h4>
          <div class="text-xs text-white/60 mt-1">${dateTxt}</div>
          <p class="text-sm text-white/80 mt-2">${excerpt}</p>
          <div class="mt-3 flex items-center justify-between">
            <button class="px-3 py-1.5 rounded-xl text-sm btn-primary" data-open="${d.id}">Lire</button>
            ${d.pinned ? `<span class="text-[11px] text-yellow-300">📌 Épinglé</span>` : `<span></span>`}
          </div>
        </article>
      `;
    }

    function render(){
      const rows = currentCat==="ALL" ? allDocs : allDocs.filter(d => (d.category||"") === currentCat);
      if(rows.length === 0){
        $list.innerHTML = `
          <div class="col-span-full glass rounded-2xl p-6 text-center text-sm text-white/70">
            Aucun conseil à afficher pour ce filtre.
          </div>`;
        return;
      }
      $list.innerHTML = rows.map(cardTemplate).join("");

      // boutons "Lire"
      $list.querySelectorAll("[data-open]").forEach(btn=>{
        btn.addEventListener("click", ()=>{
          const id = btn.getAttribute("data-open");
          const d = allDocs.find(x => x.id === id);
          if(!d) return;
          $mTitle.textContent = d.title || "";
          $mMeta.textContent = `${d.category || "Conseil"} • ${fmtDate(d.publishedAt)}`;
          if(d.imageUrl){
            $mImg.src = d.imageUrl; $mImg.classList.remove("hidden");
          } else {
            $mImg.classList.add("hidden");
          }
          $mBody.textContent = d.body || "";
          $modal.classList.add("open");
        });
      });
    }

    // 🏷️ Filtres
    document.querySelectorAll("[data-cat]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        document.querySelectorAll(".chip").forEach(x=>x.classList.remove("active"));
        btn.classList.add("active");
        currentCat = btn.getAttribute("data-cat");
        render();
      });
    });

    // ❌ Fermer modal
    $mClose.addEventListener("click", ()=> $modal.classList.remove("open"));
    $modal.addEventListener("click", (e)=>{ if(e.target === $modal) $modal.classList.remove("open"); });

    // 🔴 Unread counter : on stocke la dernière consultation
    function updateUnreadBadgeState(){
      if(allDocs.length === 0) {
        localStorage.setItem("conseil_unread_count", "0");
        return;
      }
      const lastRead = Number(localStorage.getItem("conseil_last_read") || 0);
      const count = allDocs.filter(d=>{
        const ms = d.publishedAt?.toMillis ? d.publishedAt.toMillis() : new Date(d.publishedAt).getTime();
        return ms > lastRead;
      }).length;
      localStorage.setItem("conseil_unread_count", String(count));
      const latestMs = Math.max(...allDocs.map(d => d.publishedAt?.toMillis ? d.publishedAt.toMillis() : new Date(d.publishedAt).getTime()));
      localStorage.setItem("conseil_latest_ms", String(latestMs));
    }

    // ✅ Marquer tout lu
    $markAll.addEventListener("click", ()=>{
      const now = Date.now();
      localStorage.setItem("conseil_last_read", String(now));
      updateUnreadBadgeState();
      $markAll.textContent = "Tout marqué comme lu ✓";
      setTimeout(()=>{$markAll.textContent="Marquer tout comme lu"}, 1500);
    });

    // 🔄 Écoute Firestore temps réel
    onSnapshot(q, (snap)=>{
      allDocs = snap.docs.map(d=> ({id:d.id, ...d.data()}));
      render();
      // quand on visite la page, on considère qu'on a consulté
      localStorage.setItem("conseil_last_read", String(Date.now()));
      updateUnreadBadgeState();
    });

// Extracted from conseil.html - script block 2
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

