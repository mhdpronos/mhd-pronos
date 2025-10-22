const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// 🔐 Configuration de ton adresse Gmail ici
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mo64166946@gmail.com", // ton adresse Gmail
    pass: "catvoboxzrspuzuc" // ton mot de passe d'application SANS espaces
  }
});

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


const functions = require("firebase-functions");
const fetch = require("node-fetch");

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
