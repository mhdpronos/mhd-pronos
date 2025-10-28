importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Notification reçue en arrière-plan : ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.JPG'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
