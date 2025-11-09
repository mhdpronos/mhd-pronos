(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const pageName = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    // ===== about.html =====
    (() => {
        const io = new IntersectionObserver((entries)=> {
              entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
            }, { threshold: 0.12 });
            document.querySelectorAll('.reveal').forEach(el => io.observe(el));

            const btn = document.getElementById('menuBtn');
            const menu = document.getElementById('mobileMenu');
            if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    })();

    // ===== astuce.html =====
    (() => {
        // Reveal on scroll
            const io = new IntersectionObserver((entries)=> {
              entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
            }, { threshold: 0.12 });
            document.querySelectorAll('.reveal').forEach(el => io.observe(el));

            // Mobile menu
            const btn = document.getElementById('menuBtn');
            const menu = document.getElementById('mobileMenu');
            if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

          if (pageName !== 'astuce.html') {
            return;
          }

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
    })();

    // ===== connexion.html =====
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

            const firebaseConfig = { apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k", authDomain: "mhd-pronos.firebaseapp.com", projectId: "mhd-pronos", storageBucket: "mhd-pronos.firebasestorage.app", messagingSenderId: "366441954219", appId: "1:366441954219:web:a8be6641c5c922c59cf0ee" };
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);

            const noticeEl = document.getElementById('notice');
            const emailForm = document.getElementById('emailForm');
            const phoneForm = document.getElementById('phoneLoginForm');
            const toggleEmailBtn = document.getElementById('toggleEmail');
            const togglePhoneBtn = document.getElementById('togglePhone');
            const phoneStatus = document.getElementById('phoneStatus');
            if (pageName !== 'connexion.html' || !noticeEl || !emailForm || !phoneForm || !toggleEmailBtn || !togglePhoneBtn || !phoneStatus) {
              return;
            }
            let loginConfirmation = null;
            let loginRecaptcha = null;
            function showNotice(msg, type = 'info') {
              noticeEl.textContent = msg;
              noticeEl.className = 'mb-4 text-center text-sm ' + (type === 'error' ? 'text-red-400' : 'text-green-400');
            }

            const switchToEmail = () => {
              emailForm.classList.remove('hidden');
              phoneForm.classList.add('hidden');
              phoneStatus.textContent = '';
              toggleEmailBtn.classList.replace('bg-gray-700', 'bg-blue-600');
              toggleEmailBtn.classList.replace('hover:bg-gray-600', 'hover:bg-blue-700');
              togglePhoneBtn.classList.replace('bg-blue-600', 'bg-gray-700');
              togglePhoneBtn.classList.replace('hover:bg-blue-700', 'hover:bg-gray-600');
              if (loginRecaptcha) {
                loginRecaptcha.clear();
                loginRecaptcha = null;
                document.getElementById('recaptcha-container-login').innerHTML = '';
              }
              loginConfirmation = null;
            };

            const switchToPhone = () => {
              emailForm.classList.add('hidden');
              phoneForm.classList.remove('hidden');
              phoneStatus.textContent = '';
              togglePhoneBtn.classList.replace('bg-gray-700', 'bg-blue-600');
              togglePhoneBtn.classList.replace('hover:bg-gray-600', 'hover:bg-blue-700');
              toggleEmailBtn.classList.replace('bg-blue-600', 'bg-gray-700');
              toggleEmailBtn.classList.replace('hover:bg-blue-700', 'hover:bg-gray-600');
            };

            toggleEmailBtn.addEventListener('click', (event) => {
              event.preventDefault();
              switchToEmail();
            });

            togglePhoneBtn.addEventListener('click', (event) => {
              event.preventDefault();
              switchToPhone();
            });

            switchToEmail();

            function handlePostLoginRedirect() {
              const urlParams = new URLSearchParams(window.location.search);
              const fromUrl = urlParams.get('redirect') || sessionStorage.getItem('postLoginRedirect');
              sessionStorage.removeItem('postLoginRedirect');
              window.location.href = fromUrl || 'index.html';
            }

            onAuthStateChanged(auth, (user) => {
              const authenticated = !!user;
              window.__mhdIsAuthenticated = authenticated;
              window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
              if (user) {
                localStorage.setItem('loggedIn', 'true');
                handlePostLoginRedirect();
              }
            });

            function isPasswordStrong(password) {
              const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.#^_-])[A-Za-z\d@$!%*?&.#^_-]{8,}$/;
              return regex.test(password);
            }

            emailForm.addEventListener("submit", async (e) => {
              e.preventDefault();
              const email = document.getElementById("email").value.trim();
              const password = document.getElementById("password").value.trim();

              if (!isPasswordStrong(password)) {
                showNotice("Le mot de passe est trop faible.", "error");
                return;
              }
              try {
                await signInWithEmailAndPassword(auth, email, password);
                handlePostLoginRedirect();
              } catch (err) {
                showNotice("Erreur : " + err.message, "error");
              }
            });

            document.getElementById("forgotPassword").addEventListener("click", async () => {
              const email = document.getElementById("email").value.trim();
              if (!email) return showNotice("Entrez votre e-mail d'abord", "error");
              try {
                await sendPasswordResetEmail(auth, email);
                showNotice("Lien envoyé à " + email);
              } catch (err) { showNotice("Erreur : " + err.message, "error"); }
            });

            const initRecaptcha = () => {
              if (loginRecaptcha) {
                loginRecaptcha.clear();
              }
              loginRecaptcha = new RecaptchaVerifier(auth, 'recaptcha-container-login', {
                size: 'normal',
                callback: () => {
                  phoneStatus.textContent = "reCAPTCHA validé. Vous pouvez envoyer le code.";
                  phoneStatus.className = 'text-center text-sm mt-4 text-green-400';
                },
                'expired-callback': () => {
                  phoneStatus.textContent = "reCAPTCHA expiré. Veuillez recommencer.";
                  phoneStatus.className = 'text-center text-sm mt-4 text-yellow-300';
                }
              });
            };

            const formatPhoneNumber = (value) => {
              const trimmed = value.trim();
              if (!trimmed.startsWith('+')) {
                return '+' + trimmed.replace(/^0+/, '');
              }
              return trimmed;
            };

            document.getElementById('sendLoginCode').addEventListener('click', async (event) => {
              event.preventDefault();
              const rawPhone = document.getElementById('phoneNumber').value;
              const phoneNumber = formatPhoneNumber(rawPhone);
              if (phoneNumber.length < 8) {
                phoneStatus.textContent = "Entrez un numéro de téléphone valide avec l'indicatif pays.";
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
                return;
              }

              try {
                if (!loginRecaptcha) {
                  initRecaptcha();
                }
                loginConfirmation = await signInWithPhoneNumber(auth, phoneNumber, loginRecaptcha);
                phoneStatus.textContent = `Code envoyé au ${phoneNumber}. Consultez vos SMS.`;
                phoneStatus.className = 'text-center text-sm mt-4 text-green-400';
              } catch (error) {
                phoneStatus.textContent = "Erreur lors de l'envoi du code : " + error.message;
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
                if (loginRecaptcha) {
                  loginRecaptcha.clear();
                  loginRecaptcha = null;
                }
              }
            });

            phoneForm.addEventListener('submit', async (event) => {
              event.preventDefault();
              if (!loginConfirmation) {
                phoneStatus.textContent = "Demandez d'abord un code SMS.";
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
                return;
              }

              const code = document.getElementById('verificationCode').value.trim();
              if (!code) {
                phoneStatus.textContent = "Entrez le code de vérification reçu par SMS.";
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
                return;
              }

              try {
                await loginConfirmation.confirm(code);
                phoneStatus.textContent = "Connexion réussie !";
                phoneStatus.className = 'text-center text-sm mt-4 text-green-400';
                handlePostLoginRedirect();
              } catch (error) {
                phoneStatus.textContent = "Erreur lors de la vérification du code : " + error.message;
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
              }
            });

            function setupSocialLogin(buttonId, providerFactory, providerLabel) {
              const button = document.getElementById(buttonId);
              if (!button) return;
              button.addEventListener("click", async () => {
                try {
                  await signInWithPopup(auth, providerFactory());
                  handlePostLoginRedirect();
                } catch (err) {
                  showNotice(`Erreur ${providerLabel} : ${err.message}`, "error");
                }
              });
            }

            setupSocialLogin("googleBtn", () => new GoogleAuthProvider(), "Google");
            setupSocialLogin("facebookBtn", () => new FacebookAuthProvider(), "Facebook");
            setupSocialLogin("appleBtn", () => new OAuthProvider("apple.com"), "Apple");
            setupSocialLogin("microsoftBtn", () => new OAuthProvider("microsoft.com"), "Microsoft");
    })();

    // ===== conseil.html =====
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, collection, query, orderBy, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            if (pageName !== 'conseil.html') {
              return;
            }

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
            if (!$list || !$modal || !$mTitle || !$mMeta || !$mImg || !$mBody || !$mClose || !$markAll) {
              return;
            }

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
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

          if (pageName !== 'conseil.html') {
            return;
          }

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
    })();

    // ===== firebase.html =====
    (() => {
        document.addEventListener('DOMContentLoaded', function() {
                const loadEl = document.querySelector('#load');
                if (pageName !== 'firebase.html' || !loadEl) {
                  return;
                }
                // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
                // // The Firebase SDK is initialized and available here!
                //
                // firebase.auth().onAuthStateChanged(user => { });
                // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
                // firebase.firestore().doc('/foo/bar').get().then(() => { });
                // firebase.functions().httpsCallable('yourFunction')().then(() => { });
                // firebase.messaging().requestPermission().then(() => { });
                // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
                // firebase.analytics(); // call to activate
                // firebase.analytics().logEvent('tutorial_completed');
                // firebase.performance(); // call to activate
                //
                // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

                try {
                  let app = firebase.app();
                  let features = [
                    'auth', 
                    'database', 
                    'firestore',
                    'functions',
                    'messaging', 
                    'storage', 
                    'analytics', 
                    'remoteConfig',
                    'performance',
                  ].filter(feature => typeof app[feature] === 'function');
                  loadEl.textContent = `Firebase SDK loaded with ${features.join(', ')}`;
                } catch (e) {
                  console.error(e);
                  loadEl.textContent = 'Error loading the Firebase SDK, check the console.';
                }
              });
    })();

    // ===== index.html =====
    (() => {
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
    })();
    (() => {
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
    })();
    (() => {
        const io = new IntersectionObserver((entries)=> {
              entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
            }, { threshold: 0.12 });

            document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    })();
    (() => {
        // Toggle menu mobile
            const btn = document.getElementById('menuBtn');
            const menu = document.getElementById('mobileMenu');
            if (btn && menu) {
              btn.addEventListener('click', () => {
                menu.classList.toggle('hidden');
              });
            }
    })();
    (async () => {
        const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getFirestore, collection, getDocs, query, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const firebaseConfig = {
              apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
              authDomain: "mhd-pronos.firebaseapp.com",
              projectId: "mhd-pronos",
              storageBucket: "mhd-pronos.firebasestorage.app",
              messagingSenderId: "366441954219",
              appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
            };

            const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);

            onAuthStateChanged(auth, (user) => {
              const authenticated = !!user;
              window.__mhdIsAuthenticated = authenticated;
              window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
              if (user) {
                console.log("Utilisateur connecté :", user.email);
              } else {
                console.log("Utilisateur non connecté");
              }
            });

            const aboutBtn = document.getElementById('aboutBtn');
            aboutBtn?.addEventListener('click', () => {
              window.location.href = 'about.html';
            });

            const notifBtn = document.getElementById('notificationsBtn');
            const notifBadge = document.getElementById('notifBadge');

            notifBtn?.addEventListener('click', () => {
              window.location.href = 'notifications.html';
            });

            async function refreshNotificationBadge() {
              if (!notifBadge) return;
              try {
                const q = query(collection(db, 'notifications'), where('lu', '==', false));
                const snapshot = await getDocs(q);
                const unread = snapshot.size;
                if (unread > 0) {
                  notifBadge.textContent = unread > 99 ? '99+' : String(unread);
                  notifBadge.classList.remove('hidden');
                } else {
                  notifBadge.classList.add('hidden');
                }
              } catch (err) {
                console.error('Erreur de chargement des notifications :', err);
                notifBadge.classList.add('hidden');
              }
            }

            const infofootBadge = document.getElementById('infofoot-badge');

            async function refreshInfofootBadge() {
              if (!infofootBadge) return;
              try {
                const snapshot = await getDocs(collection(db, 'infofoot'));
                const totalNews = snapshot.size;
                let lastRead = Number(localStorage.getItem('infofoot_read_count') || 0);

                if (window.location.pathname.includes('infofoot.html')) {
                  localStorage.setItem('infofoot_read_count', String(totalNews));
                  lastRead = totalNews;
                }

                if (totalNews > lastRead) {
                  const diff = totalNews - lastRead;
                  infofootBadge.textContent = diff > 9 ? '9+' : String(diff);
                  infofootBadge.classList.remove('hidden');
                } else {
                  infofootBadge.classList.add('hidden');
                }
              } catch (err) {
                console.error('Erreur de chargement des actualités :', err);
                infofootBadge.classList.add('hidden');
              }
            }

            refreshNotificationBadge();
            refreshInfofootBadge();

            setInterval(() => {
              refreshNotificationBadge();
              refreshInfofootBadge();
            }, 60000);
    })();
    (() => {
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
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

          if (pageName !== 'victoires.html') {
            return;
          }

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

          if (!modal || !btnClose || !btnLogin || !btnSignup) {
            return;
          }

          if (!modal || !btnClose || !btnLogin || !btnSignup) {
            return;
          }

          if (!modal || !btnClose || !btnLogin || !btnSignup) {
            return;
          }

          if (!modal || !btnClose || !btnLogin || !btnSignup) {
            return;
          }

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
    })();

    // ===== infofoot.html =====
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, collection, query, orderBy, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        if (pageName !== 'infofoot.html') {
          return;
        }

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

        if (!$list) {
          return;
        }

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
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

          if (pageName !== 'infofoot.html') {
            return;
          }

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
    })();

    // ===== inscription.html =====
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

            if (pageName !== 'inscription.html') {
              return;
            }

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

            function motDePasseValide(password) {
              const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.#^_-])[A-Za-z\d@$!%*?&.#^_-]{8,}$/;
              return regex.test(password);
            }

            const emailForm = document.getElementById("formInscription");
            const phoneForm = document.getElementById("phoneSignupForm");
            const toggleEmailBtn = document.getElementById('toggleEmail');
            const togglePhoneBtn = document.getElementById('togglePhone');
            const phoneStatus = document.getElementById('phoneStatus');
            const phoneDisplayNameInput = document.getElementById('phoneDisplayName');
            if (!emailForm || !phoneForm || !toggleEmailBtn || !togglePhoneBtn || !phoneStatus || !phoneDisplayNameInput) {
              return;
            }
            let confirmationResult = null;
            let recaptchaVerifier = null;

            const switchToEmail = () => {
              emailForm.classList.remove('hidden');
              phoneForm.classList.add('hidden');
              phoneStatus.textContent = '';
              toggleEmailBtn.classList.replace('bg-gray-700', 'bg-blue-600');
              toggleEmailBtn.classList.replace('hover:bg-gray-600', 'hover:bg-blue-700');
              togglePhoneBtn.classList.replace('bg-blue-600', 'bg-gray-700');
              togglePhoneBtn.classList.replace('hover:bg-blue-700', 'hover:bg-gray-600');
              if (recaptchaVerifier) {
                recaptchaVerifier.clear();
                recaptchaVerifier = null;
                document.getElementById('recaptcha-container').innerHTML = '';
              }
              confirmationResult = null;
            };

            const switchToPhone = () => {
              emailForm.classList.add('hidden');
              phoneForm.classList.remove('hidden');
              phoneStatus.textContent = '';
              togglePhoneBtn.classList.replace('bg-gray-700', 'bg-blue-600');
              togglePhoneBtn.classList.replace('hover:bg-gray-600', 'hover:bg-blue-700');
              toggleEmailBtn.classList.replace('bg-blue-600', 'bg-gray-700');
              toggleEmailBtn.classList.replace('hover:bg-blue-700', 'hover:bg-gray-600');
            };

            toggleEmailBtn.addEventListener('click', (event) => {
              event.preventDefault();
              switchToEmail();
            });

            togglePhoneBtn.addEventListener('click', (event) => {
              event.preventDefault();
              switchToPhone();
            });

            switchToEmail();

            emailForm.addEventListener("submit", async (e) => {
              e.preventDefault();
              const email = document.getElementById("email").value.trim();
              const password = document.getElementById("password").value.trim();

              if (!motDePasseValide(password)) {
                alert("Le mot de passe doit contenir au moins 8 caractères, avec lettres, chiffres et symboles.");
                return;
              }

              try {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Inscription réussie !");
                const urlParams = new URLSearchParams(window.location.search);
        const fromUrl = urlParams.get('redirect') || sessionStorage.getItem('postLoginRedirect');
        sessionStorage.removeItem('postLoginRedirect');
        window.location.href = fromUrl || 'index.html';

              } catch (error) {
                alert("Erreur : " + error.message);
              }
            });

            const googleProvider = new GoogleAuthProvider();
            const facebookProvider = new FacebookAuthProvider();
            const appleProvider = new OAuthProvider('apple.com');
            const microsoftProvider = new OAuthProvider('microsoft.com');

            const redirectAfterLogin = () => {
              const urlParams = new URLSearchParams(window.location.search);
              const fromUrl = urlParams.get('redirect') || sessionStorage.getItem('postLoginRedirect');
              sessionStorage.removeItem('postLoginRedirect');
              window.location.href = fromUrl || 'index.html';
            };

            const attachPopupHandler = (elementId, provider) => {
              const button = document.getElementById(elementId);
              if (!button) return;

              button.addEventListener('click', () =>
                signInWithPopup(auth, provider)
                  .then(redirectAfterLogin)
                  .catch(e => alert("Erreur : " + e.message))
              );
            };

            attachPopupHandler('googleSignUp', googleProvider);
            attachPopupHandler('facebookSignUp', facebookProvider);
            attachPopupHandler('appleSignUp', appleProvider);
            attachPopupHandler('microsoftSignUp', microsoftProvider);

            const initRecaptcha = () => {
              if (recaptchaVerifier) {
                recaptchaVerifier.clear();
              }
              recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'normal',
                callback: () => {
                  phoneStatus.textContent = "reCAPTCHA validé. Vous pouvez envoyer le code.";
                  phoneStatus.className = 'text-center text-sm mt-4 text-green-400';
                },
                'expired-callback': () => {
                  phoneStatus.textContent = "reCAPTCHA expiré. Veuillez valider à nouveau.";
                  phoneStatus.className = 'text-center text-sm mt-4 text-yellow-300';
                }
              });
            };

            const formatPhoneNumber = (value) => {
              const trimmed = value.trim();
              if (!trimmed.startsWith('+')) {
                return '+' + trimmed.replace(/^0+/, '');
              }
              return trimmed;
            };

            document.getElementById('sendCode').addEventListener('click', async (event) => {
              event.preventDefault();
              const rawPhone = document.getElementById('phoneNumber').value;
              const phoneNumber = formatPhoneNumber(rawPhone);
              if (phoneNumber.length < 8) {
                phoneStatus.textContent = "Entrez un numéro de téléphone valide avec l'indicatif pays.";
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
                return;
              }

              try {
                if (!recaptchaVerifier) {
                  initRecaptcha();
                }
                confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
                phoneStatus.textContent = `Code envoyé au ${phoneNumber}. Consultez vos SMS.`;
                phoneStatus.className = 'text-center text-sm mt-4 text-green-400';
              } catch (error) {
                phoneStatus.textContent = "Erreur lors de l'envoi du code : " + error.message;
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
                if (recaptchaVerifier) {
                  recaptchaVerifier.clear();
                  recaptchaVerifier = null;
                }
              }
            });

            phoneForm.addEventListener('submit', async (event) => {
              event.preventDefault();
              if (!confirmationResult) {
                phoneStatus.textContent = "Veuillez d'abord demander un code SMS.";
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
                return;
              }

              const code = document.getElementById('verificationCode').value.trim();
              if (!code) {
                phoneStatus.textContent = "Entrez le code de vérification reçu par SMS.";
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
                return;
              }

              try {
                const result = await confirmationResult.confirm(code);
                const user = result.user;
                const displayName = phoneDisplayNameInput.value.trim() || document.getElementById('nom').value.trim();
                if (displayName) {
                  await updateProfile(user, { displayName });
                }
                phoneStatus.textContent = "Connexion réussie !";
                phoneStatus.className = 'text-center text-sm mt-4 text-green-400';
                redirectAfterLogin();
              } catch (error) {
                phoneStatus.textContent = "Erreur lors de la vérification du code : " + error.message;
                phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
              }
            });
    })();

    // ===== notifications.html =====
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, collection, query, orderBy, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            const container = document.getElementById("notificationsContainer");
            if (!container) {
              return;
            }

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

            window.loadNotifications = loadNotifications;
            loadNotifications();
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const { getFirestore, collection, getDocs, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

          const container = document.getElementById("notificationsContainer");
          if (!container) {
            return;
          }

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
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, collection, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        const container = document.getElementById("notificationsContainer");
        if (!container) {
          return;
        }

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
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

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
    })();

    // ===== page payment.html =====
    (() => {
        // ---- Helpers
          if (pageName !== 'page payment.html') {
            return;
          }
          const fmtCurrency = (n) => new Intl.NumberFormat('fr-FR', { style:'currency', currency:'XOF' }).format(n);
          const $ = (sel) => document.querySelector(sel);
          const $$ = (sel) => Array.from(document.querySelectorAll(sel));

          // ---- Chargement du plan sélectionné (depuis plan abonnement.html)
          const plan = JSON.parse(localStorage.getItem('selectedPlan') || 'null');
          const planLabelEl = $('#planLabel');
          const planPriceEl = $('#planPrice');
          const planDaysEl  = $('#planDays');
          const methodLabelEl = $('#methodLabel');
          const recapWarningEl = $('#recapWarning');
          const alreadyActiveEl = $('#alreadyActive');
          const feedbackEl = $('#feedback');

          if (!planLabelEl || !planPriceEl || !planDaysEl || !methodLabelEl || !recapWarningEl || !alreadyActiveEl || !feedbackEl) {
            return;
          }

            function renderPlan() {
              if (!plan) {
                recapWarningEl.classList.remove('hidden');
                return;
              }
              planLabelEl.textContent = plan.label;
              planPriceEl.textContent = fmtCurrency(plan.price);
              planDaysEl.textContent  = plan.days + ' jours';
            }

            // ---- Abonnement existant ?
            function getSubscription() {
              try { return JSON.parse(localStorage.getItem('subscription') || 'null'); }
              catch { return null; }
            }
            function isSubscriptionActive(sub) {
              if (!sub) return false;
              return new Date(sub.expiresISO).getTime() > Date.now();
            }

            // Si déjà actif → proposer d’aller sur VIP
            const currentSub = getSubscription();
            if (isSubscriptionActive(currentSub)) {
              alreadyActiveEl.classList.remove('hidden');
            }

            // ---- Sélection d’un moyen de paiement (simulation)
            let chosenMethod = localStorage.getItem('chosenPaymentMethod') || '';
            if (chosenMethod) methodLabelEl.textContent = chosenMethod;

            function selectMethod(method, cardEl) {
              chosenMethod = method;
              localStorage.setItem('chosenPaymentMethod', method);
              methodLabelEl.textContent = method;

              $$('.payment-card').forEach(c => c.classList.remove('selected'));
              if (cardEl) cardEl.classList.add('selected');
              showMsg('Moyen sélectionné : ' + method, 'info');
            }

            $$('.payment-card').forEach(card => {
              const method = card.getAttribute('data-method');
              const btn = card.querySelector('.select-btn');
              btn.addEventListener('click', () => selectMethod(method, card));
              card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('select-btn')) selectMethod(method, card);
              });
              // remettre l'état si déjà choisi
              if (chosenMethod && chosenMethod === method) card.classList.add('selected');
            });

            // ---- Validation (simulation + expiration selon plan)
            $('#validateBtn').addEventListener('click', () => {
              if (!plan) {
                showMsg('Aucun plan détecté. Merci de choisir une formule.', 'warn',
                  '<a href="plan abonnement.html" class="inline-btn btn-primary mt-2">Aller aux plans</a>');
                return;
              }
              if (!chosenMethod) {
                showMsg('Veuillez sélectionner un moyen de paiement avant de valider.', 'warn');
                return;
              }
              // Simulation : réussite → on crée l’abonnement + expiry
              const start = new Date();
              const expires = new Date(start.getTime() + plan.days * 24*60*60*1000);

              const subscription = {
                planId: plan.id, label: plan.label, price: plan.price, days: plan.days,
                method: chosenMethod,
                startISO: start.toISOString(),
                expiresISO: expires.toISOString()
              };
              localStorage.setItem('subscription', JSON.stringify(subscription));

              showMsg('✅ Paiement validé ! Redirection vers l’espace VIP…', 'ok');
              setTimeout(() => { window.location.href = 'vip.html'; }, 900);
            });

            // ---- UI helpers
            function showMsg(text, type='info', extraHTML='') {
              feedbackEl.classList.remove('hidden');
              feedbackEl.innerHTML = text + (extraHTML ? '<div class="mt-2">'+extraHTML+'</div>' : '');
              feedbackEl.className = 'mt-3 p-3 rounded-xl text-sm';
              if (type === 'ok') feedbackEl.classList.add('bg-green-500','bg-opacity-15','border','border-green-400');
              else if (type === 'warn') feedbackEl.classList.add('bg-yellow-500','bg-opacity-15','border','border-yellow-400');
              else feedbackEl.classList.add('glass');
            }

            // ---- Animations reveal
            const io = new IntersectionObserver((entries)=> {
              entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
            }, { threshold: 0.12 });
            document.querySelectorAll('.reveal').forEach(el => io.observe(el));

            // ---- Menu mobile
            const btn = document.getElementById('menuBtn');
            const menu = document.getElementById('mobileMenu');
            if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));

            // Init
            renderPlan();
    })();

    // ===== plan abonnement.html =====
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

        if (pageName !== 'plan abonnement.html') {
          return;
        }

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
        if (!planLinks.length) {
          return;
        }
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
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

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
    })();

    // ===== profil.html =====
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const authModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
            const { getAuth, onAuthStateChanged, signOut, updateEmail, updateProfile, sendEmailVerification, sendPasswordResetEmail, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } = authModule;
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            const { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } = firestoreModule;
            const storageModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
            const { getStorage, ref, uploadBytes, getDownloadURL } = storageModule;

            if (pageName !== 'profil.html') {
              return;
            }

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
            const db = getFirestore(app);
            const storage = getStorage(app);

            // UI refs
            const avatar = document.getElementById('avatar');
            const displayName = document.getElementById('displayName');
            const emailEl = document.getElementById('email');
            const vipBadge = document.getElementById('vipBadge');
            const createdAtEl = document.getElementById('createdAt');
            const lastLoginEl = document.getElementById('lastLogin');
            const photoInput = document.getElementById('photoInput');
            const savePhotoBtn = document.getElementById('savePhoto');

            const nameField = document.getElementById('nameField');
            const emailField = document.getElementById('emailField');
            const saveProfileBtn = document.getElementById('saveProfile');
            const verifyEmailBtn = document.getElementById('verifyEmail');
            const changePasswordBtn = document.getElementById('changePassword');

            const prefNotif = document.getElementById('prefNotif');
            const prefTips = document.getElementById('prefTips');
            const prefDark = document.getElementById('prefDark');
            const savePrefsBtn = document.getElementById('savePrefs');

            const logoutBtn = document.getElementById('logoutBtn');
            const logoutBtn2 = document.getElementById('logoutBtn2');
            const deleteAccountBtn = document.getElementById('deleteAccount');
            const statusBox = document.getElementById('status');
            const yearEl = document.getElementById('year');

            if (!avatar || !displayName || !emailEl || !vipBadge || !createdAtEl || !lastLoginEl || !photoInput || !savePhotoBtn || !nameField || !emailField || !saveProfileBtn || !verifyEmailBtn || !changePasswordBtn || !prefNotif || !prefTips || !prefDark || !savePrefsBtn || !logoutBtn || !logoutBtn2 || !deleteAccountBtn || !statusBox || !yearEl) {
              return;
            }

            yearEl.textContent = new Date().getFullYear();

            const defaultAvatarUrl = "https://api.dicebear.com/7.x/initials/svg?seed=Visiteur&backgroundType=gradientLinear&fontFamily=Arial";
            const interactiveElements = [
              photoInput,
              savePhotoBtn,
              nameField,
              emailField,
              saveProfileBtn,
              verifyEmailBtn,
              changePasswordBtn,
              prefNotif,
              prefTips,
              prefDark,
              savePrefsBtn,
              logoutBtn,
              logoutBtn2,
              deleteAccountBtn
            ];

            function setFormEnabled(enabled) {
              interactiveElements.forEach((el) => {
                if (!el) return;
                if (typeof el.disabled === 'boolean') {
                  el.disabled = !enabled;
                }
                el.classList.toggle('opacity-60', !enabled);
                el.classList.toggle('cursor-not-allowed', !enabled);
              });
            }

            function resetProfileView() {
              avatar.src = defaultAvatarUrl;
              displayName.textContent = 'Visiteur';
              emailEl.textContent = 'Non connecté';
              nameField.value = '';
              emailField.value = '';
              vipBadge.textContent = 'VIP : —';
              prefNotif.checked = false;
              prefTips.checked = false;
              prefDark.checked = true;
              createdAtEl.textContent = '—';
              lastLoginEl.textContent = '—';
            }

            function setStatus(msg, type='info') {
              statusBox.textContent = msg || '';
              statusBox.className = 'mt-6 text-sm ' + (type === 'error' ? 'text-red-400' : 'text-white/80');
            }

            function requireAuth() {
              const user = auth.currentUser;
              if (!user) {
                setStatus('Connectez-vous pour utiliser cette fonctionnalité.', 'error');
                return null;
              }
              return user;
            }

            setFormEnabled(false);
            resetProfileView();
            setStatus('Chargement du profil…');

            // Auth guard + chargement profil
            onAuthStateChanged(auth, async (user) => {
              const authenticated = !!user;
              window.__mhdIsAuthenticated = authenticated;
              window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
              if (!user) {
                resetProfileView();
                setFormEnabled(false);
                setStatus('Connectez-vous pour modifier votre profil. Vous pouvez consulter cette page librement.');
                return;
              }

              setFormEnabled(true);

              try {
                setStatus('');
                // Base Auth data
                displayName.textContent = user.displayName || 'Utilisateur';
                emailEl.textContent = user.email || '—';
                nameField.value = user.displayName || '';
                emailField.value = user.email || '';

                avatar.src = user.photoURL || defaultAvatarUrl;

                const created = user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null;
                const lastLogin = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime) : null;
                createdAtEl.textContent = created ? created.toLocaleDateString() : '—';
                lastLoginEl.textContent = lastLogin ? lastLogin.toLocaleDateString() : '—';

                // Firestore user doc
                const userRef = doc(db, 'users', user.uid);
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                  await setDoc(userRef, {
                    uid: user.uid,
                    displayName: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    vip: false,
                    preferences: { notif: false, tipsByEmail: false, dark: true },
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                  });
                  vipBadge.textContent = 'VIP : non';
                  prefNotif.checked = false;
                  prefTips.checked = false;
                  prefDark.checked = true;
                } else {
                  const data = snap.data();
                  vipBadge.textContent = 'VIP : ' + (data.vip ? 'oui' : 'non');
                  prefNotif.checked = !!data.preferences?.notif;
                  prefTips.checked = !!data.preferences?.tipsByEmail;
                  prefDark.checked = data.preferences?.dark !== false;
                }
              } catch (e) {
                setStatus('Erreur de chargement du profil : ' + e.message, 'error');
              }
            });

            // Save photo
            savePhotoBtn.addEventListener('click', async () => {
              const user = requireAuth();
              if (!user) return;
              const file = photoInput.files?.[0];
              if (!file) return setStatus("Choisissez une image avant d’enregistrer.", 'error');

              try {
                setStatus("Envoi de la photo…");
                const fileRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
                await uploadBytes(fileRef, file);
                const url = await getDownloadURL(fileRef);

                await updateProfile(user, { photoURL: url });
                avatar.src = url;

                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, { photoURL: url, updatedAt: serverTimestamp() });

                setStatus("Photo de profil mise à jour ✅");
              } catch (e) {
                setStatus("Erreur lors de l’upload : " + e.message, 'error');
              }
            });

            // Save name + email
            saveProfileBtn.addEventListener('click', async () => {
              const user = requireAuth();
              if (!user) return;
              const newName = nameField.value.trim();
              const newEmail = emailField.value.trim();

              try {
                setStatus("Mise à jour du profil…");
                if (newName && newName !== (user.displayName || '')) {
                  await updateProfile(user, { displayName: newName });
                  displayName.textContent = newName;
                }
                if (newEmail && newEmail !== user.email) {
                  // Update email (peut nécessiter une réauth)
                  await updateEmail(user, newEmail);
                  emailEl.textContent = newEmail;
                }
                await updateDoc(doc(db, 'users', user.uid), {
                  displayName: newName,
                  email: newEmail,
                  updatedAt: serverTimestamp()
                });
                setStatus("Profil mis à jour ✅");
              } catch (e) {
                if (e.code === 'auth/requires-recent-login') {
                  setStatus("Action sensible : veuillez vous réauthentifier (popup Google) puis réessayer.", 'error');
                  try {
                    await reauthenticateWithPopup(user, new GoogleAuthProvider());
                    setStatus("Réauthentification réussie, cliquez de nouveau sur Enregistrer.");
                  } catch (reauthErr) {
                    setStatus("Réauthentification annulée : " + reauthErr.message, 'error');
                  }
                } else {
                  setStatus("Erreur : " + e.message, 'error');
                }
              }
            });

            // Verify email
            verifyEmailBtn.addEventListener('click', async () => {
              const user = requireAuth();
              if (!user) return;
              try {
                await sendEmailVerification(user);
                setStatus("E-mail de vérification envoyé ✅");
              } catch (e) {
                setStatus("Erreur : " + e.message, 'error');
              }
            });

            // Change password (envoie un lien de reset)
            changePasswordBtn.addEventListener('click', async () => {
              const user = requireAuth();
              if (!user) return;
              if (!user.email) {
                setStatus("Aucun e-mail trouvé sur ce compte.", 'error');
                return;
              }
              try {
                await sendPasswordResetEmail(auth, user.email);
                setStatus("Lien de réinitialisation de mot de passe envoyé à " + user.email + " ✅");
              } catch (e) {
                setStatus("Erreur : " + e.message, 'error');
              }
            });

            // Save preferences
            savePrefsBtn.addEventListener('click', async () => {
              const user = requireAuth();
              if (!user) return;
              try {
                await updateDoc(doc(db, 'users', user.uid), {
                  preferences: {
                    notif: prefNotif.checked,
                    tipsByEmail: prefTips.checked,
                    dark: prefDark.checked
                  },
                  updatedAt: serverTimestamp()
                });
                setStatus("Préférences enregistrées ✅");
              } catch (e) {
                setStatus("Erreur : " + e.message, 'error');
              }
            });

            // Logout
            const doLogout = async () => {
              const user = requireAuth();
              if (!user) return;
              try {
                await signOut(auth);
                window.location.href = "index.html";
              } catch (e) {
                setStatus("Erreur : " + e.message, 'error');
              }
            };
            logoutBtn?.addEventListener('click', doLogout);
            logoutBtn2?.addEventListener('click', doLogout);

            // Delete account
            deleteAccountBtn.addEventListener('click', async () => {
              const user = requireAuth();
              if (!user) return;
              if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ?")) return;
              try {
                await deleteUser(user);
                alert("Compte supprimé.");
                window.location.href = "index.html";
              } catch (e) {
                if (e.code === 'auth/requires-recent-login') {
                  setStatus("Veuillez vous réauthentifier (popup Google), puis relancez la suppression.", 'error');
                  try {
                    await reauthenticateWithPopup(user, new GoogleAuthProvider());
                    await deleteUser(user);
                    alert("Compte supprimé.");
                    window.location.href = "index.html";
                  } catch (reauthErr) {
                    setStatus("Erreur suppression : " + reauthErr.message, 'error');
                  }
                } else {
                  setStatus("Erreur suppression : " + e.message, 'error');
                }
              }
            });
    })();

    // ===== victoires.html =====
    (async () => {
        // ----- Firebase (même projet que tes autres pages) -----
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

            if (pageName !== 'victoires.html') {
              return;
            }

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
            const modal = document.getElementById('modal-view');
            const modalImg = document.getElementById('modal-img');
            const closeModalBtn = document.getElementById('close-modal');

            if (!form || !needAuth || !statusSpan || !modal || !modalImg || !closeModalBtn) {
              return;
            }

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
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

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
    })();

    // ===== vip.html =====
    (() => {
        // Date automatique
          const dateTarget = document.getElementById("date-du-jour");
          if (pageName !== 'vip.html' || !dateTarget) {
            return;
          }
          dateTarget.textContent = new Date().toLocaleDateString("fr-FR", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
          });
    })();
    (async () => {
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

          if (pageName !== 'vip.html') {
            return;
          }

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
    })();

  });
})();
