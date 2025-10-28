/* firebase-messaging-sw.js — à la racine du site */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ⚠️ Mets EXACTEMENT la même config que dans tes pages
firebase.initializeApp({
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
});

const messaging = firebase.messaging();

// Affichage des notifications quand le site est en arrière-plan / fermé
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, click_action } = payload.notification || {};
  self.registration.showNotification(title || "MHD PRONOS", {
    body: body || "Nouvelle notification",
    icon: icon || "/logo.JPG",
    data: { url: click_action || "/notifications.html" }
  });
});

// Ouvrir la page au clic
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/notifications.html';
  event.waitUntil(self.clients.openWindow(url));
});
