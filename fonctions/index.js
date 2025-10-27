const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");

admin.initializeApp();

// 🔐 Configuration de ton adresse Gmail ici
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mo64166946@gmail.com", // ton adresse Gmail
    pass: "catvoboxzrspuzuc" // ton mot de passe d'application SANS espaces
  }
});

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("JSON invalide reçu dans notifyVisit", error);
    return {};
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ✅ Fonction pour envoyer un email personnalisé
exports.envoyerEmail = functions.https.onCall(async (data, context) => {
  const { email, sujet, message } = data;

  const mailOptions = {
    from: `"MHD Pronos" <mo64166946@gmail.com>`,
    to: email,
    subject: sujet,
    html: `<p>${message}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "📨 E-mail envoyé avec succès !" };
  } catch (error) {
    console.error("Erreur d’envoi d’e-mail :", error);
    return { success: false, error: error.message };
  }
});

exports.notifyVisit = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Méthode non autorisée" });
    return;
  }

  const payload = typeof req.body === "string" ? safeJsonParse(req.body) : req.body || {};

  const page = payload?.page || "(page inconnue)";
  const referrer = payload?.referrer || "(aucun référent)";
  const visitTime = payload?.timestamp || new Date().toISOString();
  const userAgent = payload?.userAgent || req.get("user-agent") || "(user-agent inconnu)";
  const visitorIp = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim() || "(IP inconnue)";

  const mailOptions = {
    from: `"MHD Pronos" <mo64166946@gmail.com>`,
    to: "mo64166946@gmail.com",
    subject: "Nouvelle visite sur MHD Pronos",
    html: `
      <p>👋 Une nouvelle personne vient de visiter ton site.</p>
      <ul>
        <li><strong>Page :</strong> ${escapeHtml(page)}</li>
        <li><strong>Date :</strong> ${escapeHtml(visitTime)}</li>
        <li><strong>Adresse IP :</strong> ${escapeHtml(visitorIp)}</li>
        <li><strong>Référent :</strong> ${escapeHtml(referrer)}</li>
        <li><strong>Navigateur :</strong> ${escapeHtml(userAgent)}</li>
      </ul>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Erreur d’envoi du mail de visite :", error);
    res.status(500).json({ success: false, error: "Impossible d'envoyer la notification" });
  }
});

exports.proxy = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send('');
    return;
  }

  const API_TOKEN = "KAYxTdFviUVgBb9yBHOMIZVTGrwJK5RxMgO6rCjzHB6Av9YsKsoJDEgHcxWn";
  const API_URL = "https://api.sportmonks.com/v3/football/livescores?include=league;participants;state;scores";

  try {
    const response = await fetch(`${API_URL}&api_token=${API_TOKEN}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur de chargement" });
  }
});
