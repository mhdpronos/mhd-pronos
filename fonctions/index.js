const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

const APP_BASE_URL = functions.config().app?.base_url || "https://mhd-pronos.web.app";
const ICON_URL = `${APP_BASE_URL}/Image/logo.JPG`;
const MAX_TOKENS_PER_BATCH = 500;
const INVALID_TOKEN_ERRORS = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
]);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mo64166946@gmail.com",
    pass: "catvoboxzrspuzuc",
  },
});

exports.envoyerEmail = functions.https.onCall(async (data) => {
  const { email, sujet, message } = data || {};

  if (!email || !sujet || !message) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Les champs email, sujet et message sont obligatoires."
    );
  }

  const mailOptions = {
    from: `"MHD Pronos" <${transporter.options.auth.user}>`,
    to: email,
    subject: sujet,
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "📨 E-mail envoyé avec succès !" };
  } catch (error) {
    console.error("Erreur d’envoi d’e-mail :", error);
    throw new functions.https.HttpsError("internal", "Impossible d'envoyer l'e-mail.");
  }
});

exports.proxy = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const API_TOKEN = "KAYxTdFviUVgBb9yBHOMIZVTGrwJK5RxMgO6rCjzHB6Av9YsKsoJDEgHcxWn";
  const API_URL = "https://api.sportmonks.com/v3/football/livescores?include=league;participants;state;scores";

  try {
    const response = await fetch(`${API_URL}&api_token=${API_TOKEN}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erreur lors de l'appel proxy :", error);
    res.status(500).json({ error: "Erreur de chargement" });
  }
});

const sanitizeData = (data = {}) => {
  const result = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    result[key] = typeof value === "string" ? value : JSON.stringify(value);
  });
  return result;
};

const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const broadcastPushNotification = async ({ title, body, link, tag, data }) => {
  const tokensSnapshot = await db.collection("fcmTokens").get();

  if (tokensSnapshot.empty) {
    console.log("Aucun token FCM enregistré, notification ignorée.");
    return null;
  }

  const entries = tokensSnapshot.docs.map((docSnap) => ({
    token: docSnap.id,
    ref: docSnap.ref,
  }));

  const sanitizedData = sanitizeData({
    ...(data || {}),
    link: link || `${APP_BASE_URL}/`,
    click_action: link || `${APP_BASE_URL}/`,
    tag: tag || "mhd-pronos",
  });

  let successCount = 0;
  let failureCount = 0;

  for (const batch of chunkArray(entries, MAX_TOKENS_PER_BATCH)) {
    const response = await messaging.sendEachForMulticast({
      tokens: batch.map((item) => item.token),
      notification: {
        title,
        body,
      },
      data: sanitizedData,
      webpush: {
        notification: {
          icon: ICON_URL,
          badge: ICON_URL,
          tag: tag || "mhd-pronos",
          vibrate: [120, 60, 120],
          actions: link
            ? [
                {
                  action: "open",
                  title: "Voir",
                },
              ]
            : undefined,
        },
        fcmOptions: {
          link: link || `${APP_BASE_URL}/`,
        },
      },
    });

    successCount += response.successCount;
    failureCount += response.failureCount;

    const tokensToDelete = [];
    response.responses.forEach((resp, index) => {
      if (!resp.success && resp.error && INVALID_TOKEN_ERRORS.has(resp.error.code)) {
        tokensToDelete.push(batch[index].ref);
      }
    });

    if (tokensToDelete.length) {
      await Promise.all(tokensToDelete.map((ref) => ref.delete()));
    }
  }

  console.log(
    `Notification push envoyée — succès: ${successCount}, échecs: ${failureCount}`
  );

  return { successCount, failureCount };
};

const summarizeText = (text, maxLength = 120) => {
  if (!text) {
    return "Consultez les détails sur MHD Pronos.";
  }
  const normalized = String(text).trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength)}…`;
};

exports.onNotificationCreated = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snap, context) => {
    const payload = snap.data() || {};
    const docId = context.params.notificationId;
    const title = payload.titre || "Nouvelle notification";
    const body = payload.message || "Retrouvez le détail dans la section Notifications.";
    const link = payload.lien || `${APP_BASE_URL}/notifications.html`;

    return broadcastPushNotification({
      title,
      body,
      link,
      tag: "notifications",
      data: {
        type: "notifications",
        docId,
        lien: payload.lien || "",
      },
    });
  });

exports.onInfoFootCreated = functions.firestore
  .document("infofoot/{infoId}")
  .onCreate(async (snap, context) => {
    const payload = snap.data() || {};
    const docId = context.params.infoId;
    const title = payload.title || "Nouvelle info foot";
    const body = summarizeText(payload.body || payload.description);
    const link = `${APP_BASE_URL}/infofoot.html?doc=${docId}`;

    return broadcastPushNotification({
      title,
      body,
      link,
      tag: "infofoot",
      data: {
        type: "infofoot",
        docId,
        category: payload.category || "",
      },
    });
  });

exports.onConseilCreated = functions.firestore
  .document("conseils/{conseilId}")
  .onCreate(async (snap, context) => {
    const payload = snap.data() || {};
    const docId = context.params.conseilId;
    const title = payload.title || "Nouveau conseil";
    const body = summarizeText(payload.body);
    const link = `${APP_BASE_URL}/conseil.html?doc=${docId}`;

    return broadcastPushNotification({
      title,
      body,
      link,
      tag: "conseils",
      data: {
        type: "conseils",
        docId,
        category: payload.category || "",
      },
    });
  });
