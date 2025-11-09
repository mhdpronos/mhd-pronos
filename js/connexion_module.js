// Extracted from connexion.html - script block 1
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

    const firebaseConfig = { apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k", authDomain: "mhd-pronos.firebaseapp.com", projectId: "mhd-pronos", storageBucket: "mhd-pronos.firebasestorage.app", messagingSenderId: "366441954219", appId: "1:366441954219:web:a8be6641c5c922c59cf0ee" };
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const noticeEl = document.getElementById('notice');
    const emailForm = document.getElementById('emailForm');
    const phoneForm = document.getElementById('phoneLoginForm');
    const toggleEmailBtn = document.getElementById('toggleEmail');
    const togglePhoneBtn = document.getElementById('togglePhone');
    const phoneStatus = document.getElementById('phoneStatus');
    let loginConfirmation = null;
    let loginRecaptcha = null;
    function showNotice(msg, type = 'info') {
      noticeEl.textContent = msg;
      noticeEl.className = 'mb-4 text-center text-sm ' + (type === 'error' ? 'text-red-400' : 'text-green-400');
    }

    const switchToEmail = () => {
      emailForm.classList.remove('hidden');
      phoneForm.classList.add('hidden');
      phoneStatus.textContent = '';
      toggleEmailBtn.classList.replace('bg-gray-700', 'bg-blue-600');
      toggleEmailBtn.classList.replace('hover:bg-gray-600', 'hover:bg-blue-700');
      togglePhoneBtn.classList.replace('bg-blue-600', 'bg-gray-700');
      togglePhoneBtn.classList.replace('hover:bg-blue-700', 'hover:bg-gray-600');
      if (loginRecaptcha) {
        loginRecaptcha.clear();
        loginRecaptcha = null;
        document.getElementById('recaptcha-container-login').innerHTML = '';
      }
      loginConfirmation = null;
    };

    const switchToPhone = () => {
      emailForm.classList.add('hidden');
      phoneForm.classList.remove('hidden');
      phoneStatus.textContent = '';
      togglePhoneBtn.classList.replace('bg-gray-700', 'bg-blue-600');
      togglePhoneBtn.classList.replace('hover:bg-gray-600', 'hover:bg-blue-700');
      toggleEmailBtn.classList.replace('bg-blue-600', 'bg-gray-700');
      toggleEmailBtn.classList.replace('hover:bg-blue-700', 'hover:bg-gray-600');
    };

    toggleEmailBtn.addEventListener('click', (event) => {
      event.preventDefault();
      switchToEmail();
    });

    togglePhoneBtn.addEventListener('click', (event) => {
      event.preventDefault();
      switchToPhone();
    });

    switchToEmail();

    function handlePostLoginRedirect() {
      const urlParams = new URLSearchParams(window.location.search);
      const fromUrl = urlParams.get('redirect') || sessionStorage.getItem('postLoginRedirect');
      sessionStorage.removeItem('postLoginRedirect');
      window.location.href = fromUrl || 'index.html';
    }

    onAuthStateChanged(auth, (user) => {
      const authenticated = !!user;
      window.__mhdIsAuthenticated = authenticated;
      window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));
      if (user) {
        localStorage.setItem('loggedIn', 'true');
        handlePostLoginRedirect();
      }
    });

    function isPasswordStrong(password) {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.#^_-])[A-Za-z\d@$!%*?&.#^_-]{8,}$/;
      return regex.test(password);
    }

    emailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!isPasswordStrong(password)) {
        showNotice("Le mot de passe est trop faible.", "error");
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, email, password);
        handlePostLoginRedirect();
      } catch (err) {
        showNotice("Erreur : " + err.message, "error");
      }
    });

    document.getElementById("forgotPassword").addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim();
      if (!email) return showNotice("Entrez votre e-mail d'abord", "error");
      try {
        await sendPasswordResetEmail(auth, email);
        showNotice("Lien envoyé à " + email);
      } catch (err) { showNotice("Erreur : " + err.message, "error"); }
    });

    const initRecaptcha = () => {
      if (loginRecaptcha) {
        loginRecaptcha.clear();
      }
      loginRecaptcha = new RecaptchaVerifier(auth, 'recaptcha-container-login', {
        size: 'normal',
        callback: () => {
          phoneStatus.textContent = "reCAPTCHA validé. Vous pouvez envoyer le code.";
          phoneStatus.className = 'text-center text-sm mt-4 text-green-400';
        },
        'expired-callback': () => {
          phoneStatus.textContent = "reCAPTCHA expiré. Veuillez recommencer.";
          phoneStatus.className = 'text-center text-sm mt-4 text-yellow-300';
        }
      });
    };

    const formatPhoneNumber = (value) => {
      const trimmed = value.trim();
      if (!trimmed.startsWith('+')) {
        return '+' + trimmed.replace(/^0+/, '');
      }
      return trimmed;
    };

    document.getElementById('sendLoginCode').addEventListener('click', async (event) => {
      event.preventDefault();
      const rawPhone = document.getElementById('phoneNumber').value;
      const phoneNumber = formatPhoneNumber(rawPhone);
      if (phoneNumber.length < 8) {
        phoneStatus.textContent = "Entrez un numéro de téléphone valide avec l'indicatif pays.";
        phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
        return;
      }

      try {
        if (!loginRecaptcha) {
          initRecaptcha();
        }
        loginConfirmation = await signInWithPhoneNumber(auth, phoneNumber, loginRecaptcha);
        phoneStatus.textContent = `Code envoyé au ${phoneNumber}. Consultez vos SMS.`;
        phoneStatus.className = 'text-center text-sm mt-4 text-green-400';
      } catch (error) {
        phoneStatus.textContent = "Erreur lors de l'envoi du code : " + error.message;
        phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
        if (loginRecaptcha) {
          loginRecaptcha.clear();
          loginRecaptcha = null;
        }
      }
    });

    phoneForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!loginConfirmation) {
        phoneStatus.textContent = "Demandez d'abord un code SMS.";
        phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
        return;
      }

      const code = document.getElementById('verificationCode').value.trim();
      if (!code) {
        phoneStatus.textContent = "Entrez le code de vérification reçu par SMS.";
        phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
        return;
      }

      try {
        await loginConfirmation.confirm(code);
        phoneStatus.textContent = "Connexion réussie !";
        phoneStatus.className = 'text-center text-sm mt-4 text-green-400';
        handlePostLoginRedirect();
      } catch (error) {
        phoneStatus.textContent = "Erreur lors de la vérification du code : " + error.message;
        phoneStatus.className = 'text-center text-sm mt-4 text-red-400';
      }
    });

    function setupSocialLogin(buttonId, providerFactory, providerLabel) {
      const button = document.getElementById(buttonId);
      if (!button) return;
      button.addEventListener("click", async () => {
        try {
          await signInWithPopup(auth, providerFactory());
          handlePostLoginRedirect();
        } catch (err) {
          showNotice(`Erreur ${providerLabel} : ${err.message}`, "error");
        }
      });
    }

    setupSocialLogin("googleBtn", () => new GoogleAuthProvider(), "Google");
    setupSocialLogin("facebookBtn", () => new FacebookAuthProvider(), "Facebook");
    setupSocialLogin("appleBtn", () => new OAuthProvider("apple.com"), "Apple");
    setupSocialLogin("microsoftBtn", () => new OAuthProvider("microsoft.com"), "Microsoft");

