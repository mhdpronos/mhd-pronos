const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// 🔐 Configuration de ton adresse Gmail ici
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mo64166946@gmail.com", // ton email Gmail
    pass: "catvoboxzrspuzuc" // ton mot de passe d’application (collé sans espace)
  }
});

// ✅ Fonction Cloud pour envoyer un email personnalisé
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
    return { success: true, message: "E-mail envoyé avec succès 🚀" };
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail :", error);
    return { success: false, error: error.message };
  }
});
