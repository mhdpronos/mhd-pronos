import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function motDePasseValide(password) {
  const regex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.#^_-])[A-Za-z\d@$!%*?&.#^_-]{8,}$/;
  return regex.test(password);
}

const emailForm = document.getElementById("formInscription");
const phoneForm = document.getElementById("phoneSignupForm");
const toggleEmailBtn = document.getElementById("toggleEmail");
const togglePhoneBtn = document.getElementById("togglePhone");
const phoneStatus = document.getElementById("phoneStatus");
const phoneDisplayNameInput = document.getElementById("phoneDisplayName");
let confirmationResult = null;
let recaptchaVerifier = null;

const switchToEmail = () => {
  emailForm.classList.remove("hidden");
  phoneForm.classList.add("hidden");
  phoneStatus.textContent = "";
  toggleEmailBtn.classList.replace("bg-gray-700", "bg-blue-600");
  toggleEmailBtn.classList.replace("hover:bg-gray-600", "hover:bg-blue-700");
  togglePhoneBtn.classList.replace("bg-blue-600", "bg-gray-700");
  togglePhoneBtn.classList.replace("hover:bg-blue-700", "hover:bg-gray-600");
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
    document.getElementById("recaptcha-container").innerHTML = "";
  }
  confirmationResult = null;
};

const switchToPhone = () => {
  emailForm.classList.add("hidden");
  phoneForm.classList.remove("hidden");
  phoneStatus.textContent = "";
  togglePhoneBtn.classList.replace("bg-gray-700", "bg-blue-600");
  togglePhoneBtn.classList.replace("hover:bg-gray-600", "hover:bg-blue-700");
  toggleEmailBtn.classList.replace("bg-blue-600", "bg-gray-700");
  toggleEmailBtn.classList.replace("hover:bg-blue-700", "hover:bg-gray-600");
};

toggleEmailBtn.addEventListener("click", (event) => {
  event.preventDefault();
  switchToEmail();
});

togglePhoneBtn.addEventListener("click", (event) => {
  event.preventDefault();
  switchToPhone();
});

switchToEmail();

emailForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!motDePasseValide(password)) {
    alert(
      "Le mot de passe doit contenir au moins 8 caractères, avec lettres, chiffres et symboles.",
    );
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Inscription réussie !");
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl =
      urlParams.get("redirect") || sessionStorage.getItem("postLoginRedirect");
    sessionStorage.removeItem("postLoginRedirect");
    window.location.href = fromUrl || "index.html";
  } catch (error) {
    alert("Erreur : " + error.message);
  }
});

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider("apple.com");
const microsoftProvider = new OAuthProvider("microsoft.com");

const redirectAfterLogin = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fromUrl =
    urlParams.get("redirect") || sessionStorage.getItem("postLoginRedirect");
  sessionStorage.removeItem("postLoginRedirect");
  window.location.href = fromUrl || "index.html";
};

const attachPopupHandler = (elementId, provider) => {
  const button = document.getElementById(elementId);
  if (!button) return;

  button.addEventListener("click", () =>
    signInWithPopup(auth, provider)
      .then(redirectAfterLogin)
      .catch((e) => alert("Erreur : " + e.message)),
  );
};

attachPopupHandler("googleSignUp", googleProvider);
attachPopupHandler("facebookSignUp", facebookProvider);
attachPopupHandler("appleSignUp", appleProvider);
attachPopupHandler("microsoftSignUp", microsoftProvider);

const initRecaptcha = () => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "normal",
    callback: () => {
      phoneStatus.textContent =
        "reCAPTCHA validé. Vous pouvez envoyer le code.";
      phoneStatus.className = "text-center text-sm mt-4 text-green-400";
    },
    "expired-callback": () => {
      phoneStatus.textContent = "reCAPTCHA expiré. Veuillez valider à nouveau.";
      phoneStatus.className = "text-center text-sm mt-4 text-yellow-300";
    },
  });
};

const formatPhoneNumber = (value) => {
  const trimmed = value.trim();
  if (!trimmed.startsWith("+")) {
    return "+" + trimmed.replace(/^0+/, "");
  }
  return trimmed;
};

document.getElementById("sendCode").addEventListener("click", async (event) => {
  event.preventDefault();
  const rawPhone = document.getElementById("phoneNumber").value;
  const phoneNumber = formatPhoneNumber(rawPhone);
  if (phoneNumber.length < 8) {
    phoneStatus.textContent =
      "Entrez un numéro de téléphone valide avec l'indicatif pays.";
    phoneStatus.className = "text-center text-sm mt-4 text-red-400";
    return;
  }

  try {
    if (!recaptchaVerifier) {
      initRecaptcha();
    }
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier,
    );
    phoneStatus.textContent = `Code envoyé au ${phoneNumber}. Consultez vos SMS.`;
    phoneStatus.className = "text-center text-sm mt-4 text-green-400";
  } catch (error) {
    phoneStatus.textContent =
      "Erreur lors de l'envoi du code : " + error.message;
    phoneStatus.className = "text-center text-sm mt-4 text-red-400";
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
  }
});

phoneForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!confirmationResult) {
    phoneStatus.textContent = "Veuillez d'abord demander un code SMS.";
    phoneStatus.className = "text-center text-sm mt-4 text-red-400";
    return;
  }

  const code = document.getElementById("verificationCode").value.trim();
  if (!code) {
    phoneStatus.textContent = "Entrez le code de vérification reçu par SMS.";
    phoneStatus.className = "text-center text-sm mt-4 text-red-400";
    return;
  }

  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    const displayName =
      phoneDisplayNameInput.value.trim() ||
      document.getElementById("nom").value.trim();
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    phoneStatus.textContent = "Connexion réussie !";
    phoneStatus.className = "text-center text-sm mt-4 text-green-400";
    redirectAfterLogin();
  } catch (error) {
    phoneStatus.textContent =
      "Erreur lors de la vérification du code : " + error.message;
    phoneStatus.className = "text-center text-sm mt-4 text-red-400";
  }
});
