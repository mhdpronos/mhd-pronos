// firebase-messaging-sw.js

// Importez les fonctions nécessaires de Firebase SDK pour le service worker
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Copiez ici votre configuration Firebase (la même que dans votre application principale)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
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
