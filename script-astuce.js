// Reveal on scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("show");
    });
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Mobile menu
const btn = document.getElementById("menuBtn");
const menu = document.getElementById("mobileMenu");
if (btn && menu)
  btn.addEventListener("click", () => menu.classList.toggle("hidden"));

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const here = window.location.pathname.split("/").pop() || "index.html";

onAuthStateChanged(auth, (user) => {
  const authenticated = !!user;
  window.__mhdIsAuthenticated = authenticated;
  window.dispatchEvent(
    new CustomEvent("mhd:auth-state", { detail: { authenticated } }),
  );
  if (!user) {
    // pas connecté → on garde la cible et on pousse vers la connexion
    sessionStorage.setItem("postLoginRedirect", here);
    const enc = encodeURIComponent(here);
    window.location.href = `connexion.html?redirect=${enc}`;
  }
});
