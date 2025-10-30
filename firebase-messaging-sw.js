// firebase-messaging-sw.js

// Importez les fonctions nécessaires de Firebase SDK pour le service worker
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
    authDomain: "mhd-pronos.firebaseapp.com",
    projectId: "mhd-pronos",
    storageBucket: "mhd-pronos.firebasestorage.app",
    messagingSenderId: "366441954219",
    appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
};

// Initialisez Firebase dans le service worker
const app = initializeApp(firebaseConfig);

// Récupérez l'instance de messagerie pour le service worker
const messaging = getMessaging(app);

// Gérez les messages en arrière-plan
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Personnalisation 
  const notificationTitle = payload.notification.title || 'mhd pronos';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.JPG'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
