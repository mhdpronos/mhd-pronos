import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== BADGE NOTIFICATIONS =====
const notifBadge = document.getElementById("notifBadge");

async function refreshNotificationBadge() {
  if (!notifBadge) return;

  try {
    const q = query(collection(db, "notifications"), where("lu", "==", false));
    const snapshot = await getDocs(q);

    const unread = snapshot.size;

    if (unread > 0) {
      notifBadge.textContent = unread > 99 ? "99+" : String(unread);
      notifBadge.classList.remove("hidden");
    } else {
      notifBadge.classList.add("hidden");
    }
  } catch (err) {
    console.error("Erreur de chargement badge notif:", err);
    notifBadge.classList.add("hidden");
  }
}

// ===== BADGE INFOFOOT =====
const infofootBadge = document.getElementById("infofoot-badge");

async function refreshInfofootBadge() {
  if (!infofootBadge) return;

  try {
    const snapshot = await getDocs(collection(db, "infofoot"));
    const totalNews = snapshot.size;

    let lastRead = Number(localStorage.getItem("infofoot_read_count") || "0");

    if (window.location.pathname.includes("infofoot.html")) {
      localStorage.setItem("infofoot_read_count", String(totalNews));
      lastRead = totalNews;
    }

    if (totalNews > lastRead) {
      const diff = totalNews - lastRead;
      infofootBadge.textContent = diff > 9 ? "9+" : String(diff);
      infofootBadge.classList.remove("hidden");
    } else {
      infofootBadge.classList.add("hidden");
    }

  } catch (err) {
    console.error("Erreur badge infofoot:", err);
    infofootBadge.classList.add("hidden");
  }
}

// Lancement et rafraîchissement
refreshNotificationBadge();
refreshInfofootBadge();

setInterval(() => {
  refreshNotificationBadge();
  refreshInfofootBadge();
}, 60000);
