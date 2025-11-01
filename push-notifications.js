const firebaseConfig = {
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee",
};

const firebaseVersion = "10.7.1";
const firebaseBase = `https://www.gstatic.com/firebasejs/${firebaseVersion}`;

Promise.all([
  import(`${firebaseBase}/firebase-app.js`),
  import(`${firebaseBase}/firebase-messaging.js`),
  import(`${firebaseBase}/firebase-firestore.js`),
  import(`${firebaseBase}/firebase-auth.js`),
]).then(async ([appMod, msgMod, firestoreMod, authMod]) => {
  const { initializeApp, getApps, getApp } = appMod;
  const { getMessaging, getToken, onMessage, isSupported } = msgMod;
  const { getFirestore, doc, setDoc, serverTimestamp } = firestoreMod;
  const { getAuth, onAuthStateChanged } = authMod;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const messagingSupported = await isSupported().catch(() => false);
  if (!messagingSupported) {
    console.info("Firebase messaging n'est pas supporté dans ce navigateur.");
    return;
  }

  const messaging = getMessaging(app);
  const db = getFirestore(app);
  const auth = getAuth(app);

  const STORAGE_KEY = "mhd:fcmToken:v1";
  const PERMISSION_PROMPT_KEY = "mhd:fcmPrompted";
  let serviceWorkerRegistration = null;
  let lastSavedToken = null;
  let foregroundSound = null;

  const safeSession = {
    get(key) {
      try {
        return sessionStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        sessionStorage.setItem(key, value);
      } catch (error) {
        /* ignore */
      }
    },
  };

  const resolveVapidKey = () => {
    const fromWindow = typeof window !== "undefined" ? window.__FIREBASE_VAPID_KEY : undefined;
    const fromConfig = firebaseConfig.vapidKey;
    return fromWindow || fromConfig;
  };

  const ensureServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service worker non disponible, notifications push désactivées.");
      return null;
    }
    if (serviceWorkerRegistration) {
      return serviceWorkerRegistration;
    }
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", { type: "module" });
      return serviceWorkerRegistration;
    } catch (error) {
      console.error("Échec de l'enregistrement du service worker Firebase Messaging", error);
      return null;
    }
  };

  const askNotificationPermission = async () => {
    if (typeof Notification === "undefined") {
      console.warn("API Notification non disponible.");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      console.info("L'utilisateur a refusé les notifications push.");
      return false;
    }

    const hasPrompted = safeSession.get(PERMISSION_PROMPT_KEY);
    if (!hasPrompted && typeof window !== "undefined" && typeof window.confirm === "function") {
      const shouldPrompt = window.confirm(
        "Souhaitez-vous recevoir les alertes MHD Pronos même lorsque le site est fermé ?"
      );
      safeSession.set(PERMISSION_PROMPT_KEY, "1");
      if (!shouldPrompt) {
        return false;
      }
    }

    try {
      const permissionResult = await Notification.requestPermission();
      return permissionResult === "granted";
    } catch (error) {
      console.error("Impossible de demander la permission de notification", error);
      return false;
    }
  };

  const saveToken = async (token, uid) => {
    if (!token || !uid) {
      return;
    }
    try {
      await setDoc(
        doc(db, "fcmTokens", token),
        {
          uid,
          updatedAt: serverTimestamp(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
          platform: typeof navigator !== "undefined" ? navigator.platform : "unknown",
        },
        { merge: true }
      );
      lastSavedToken = token;
      try {
        localStorage.setItem(STORAGE_KEY, token);
      } catch (error) {
        /* ignore */
      }
    } catch (error) {
      console.error("Impossible d'enregistrer le token FCM", error);
    }
  };

  const retrieveExistingToken = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  };

  const getTokenWithFallback = async (registration, vapidKey) => {
    try {
      return await getToken(messaging, { serviceWorkerRegistration: registration });
    } catch (error) {
      const errorCode = error && error.code ? error.code : "";
      if ((errorCode === "messaging/invalid-key" || errorCode === "messaging/invalid-config") && vapidKey) {
        return getToken(messaging, { serviceWorkerRegistration: registration, vapidKey });
      }
      if (errorCode === "messaging/invalid-key" && !vapidKey) {
        console.warn(
          "Aucune clé VAPID fournie. Définissez window.__FIREBASE_VAPID_KEY pour activer les notifications push."
        );
      }
      throw error;
    }
  };

  const ensureTokenForUser = async (user) => {
    if (!user) {
      return;
    }

    const registration = await ensureServiceWorker();
    if (!registration) {
      return;
    }

    const permissionGranted = await askNotificationPermission();
    if (!permissionGranted) {
      return;
    }

    const vapidKey = resolveVapidKey();

    let token;
    try {
      token = await getTokenWithFallback(registration, vapidKey);
    } catch (error) {
      console.error("Impossible de récupérer le token FCM", error);
      return;
    }

    if (!token) {
      console.warn("Aucun token FCM obtenu.");
      return;
    }

    const existing = retrieveExistingToken();
    if (existing !== token || lastSavedToken !== token) {
      await saveToken(token, user.uid);
    }
  };

  const ensureSound = () => {
    if (!foregroundSound) {
      foregroundSound = new Audio("/notification.mp3");
    }
    return foregroundSound;
  };

  const toastContainerId = "mhd-push-toast";
  const ensureToastContainer = () => {
    let container = document.getElementById(toastContainerId);
    if (!container) {
      container = document.createElement("div");
      container.id = toastContainerId;
      container.style.position = "fixed";
      container.style.bottom = "20px";
      container.style.right = "20px";
      container.style.zIndex = "99999";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "12px";
      container.style.maxWidth = "320px";
      document.body.appendChild(container);
    }
    return container;
  };

  const showToast = (title, body, link) => {
    const container = ensureToastContainer();
    const toast = document.createElement("button");
    toast.type = "button";
    toast.style.border = "none";
    toast.style.outline = "none";
    toast.style.background = "linear-gradient(135deg, rgba(99,102,241,0.92), rgba(14,165,233,0.92))";
    toast.style.color = "#fff";
    toast.style.padding = "14px 16px";
    toast.style.borderRadius = "16px";
    toast.style.boxShadow = "0 18px 35px rgba(15,23,42,0.35)";
    toast.style.display = "flex";
    toast.style.flexDirection = "column";
    toast.style.alignItems = "flex-start";
    toast.style.cursor = link ? "pointer" : "default";
    toast.style.textAlign = "left";

    const titleEl = document.createElement("strong");
    titleEl.textContent = title || "Nouvelle alerte";
    titleEl.style.fontSize = "15px";
    titleEl.style.marginBottom = "4px";

    const bodyEl = document.createElement("span");
    bodyEl.textContent = body || "";
    bodyEl.style.fontSize = "13px";
    bodyEl.style.opacity = "0.85";

    toast.appendChild(titleEl);
    toast.appendChild(bodyEl);

    const resolvedLink = link ? new URL(link, window.location.origin).href : null;

    if (resolvedLink) {
      toast.addEventListener("click", () => {
        window.location.assign(resolvedLink);
      });
    }

    container.appendChild(toast);

    ensureSound()
      .play()
      .catch(() => {
        /* ignore autoplay block */
      });

    setTimeout(() => {
      toast.style.transition = "opacity .3s ease, transform .3s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => {
        toast.remove();
        if (!container.hasChildNodes()) {
          container.remove();
        }
      }, 320);
    }, 6000);
  };

  onMessage(messaging, (payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};
    const link = data.link || data.click_action;
    showToast(notification.title, notification.body, link);
  });

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      return;
    }
    ensureTokenForUser(user).catch((error) => {
      console.error("Erreur lors de l'enregistrement du token FCM", error);
    });
  });

  const maybeExistingUser = auth.currentUser;
  if (maybeExistingUser) {
    ensureTokenForUser(maybeExistingUser).catch((error) => {
      console.error("Erreur lors de l'enregistrement initial du token FCM", error);
    });
  }
}).catch((error) => {
  console.error("Impossible de charger Firebase Messaging", error);
});
