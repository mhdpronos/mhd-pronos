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

const modal = document.getElementById('authModal');
const btnClose = document.getElementById('authClose');
const btnLogin = document.getElementById('goLogin');
const btnSignup = document.getElementById('goSignup');

let pendingTarget = null;

function openModal(){ modal.classList.add('open'); }
function closeModal(){ modal.classList.remove('open'); pendingTarget = null; }

btnClose.addEventListener('click', closeModal);

function updateAuthLinks(targetHref){
  const enc = encodeURIComponent(targetHref);
  btnLogin.href  = `connexion.html?redirect=${enc}`;
  btnSignup.href = `inscription.html?redirect=${enc}`;
}

function wireAuthGuards(user){
  document.querySelectorAll('a.requires-auth').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href') || '#';
      if(user){ return; }
      e.preventDefault();
      pendingTarget = href;
      updateAuthLinks(href);
      sessionStorage.setItem('postLoginRedirect', href);
      openModal();
    }, { capture:true });
  });
}

onAuthStateChanged(auth, (user)=>{
  const authenticated = !!user;
  window.__mhdIsAuthenticated = authenticated;
  window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
  wireAuthGuards(user);
});
