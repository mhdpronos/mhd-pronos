import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updateEmail,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

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
const db = getFirestore(app);
const storage = getStorage(app);

// UI refs
const avatar = document.getElementById("avatar");
const displayName = document.getElementById("displayName");
const emailEl = document.getElementById("email");
const vipBadge = document.getElementById("vipBadge");
const createdAtEl = document.getElementById("createdAt");
const lastLoginEl = document.getElementById("lastLogin");
const photoInput = document.getElementById("photoInput");
const savePhotoBtn = document.getElementById("savePhoto");

const nameField = document.getElementById("nameField");
const emailField = document.getElementById("emailField");
const saveProfileBtn = document.getElementById("saveProfile");
const verifyEmailBtn = document.getElementById("verifyEmail");
const changePasswordBtn = document.getElementById("changePassword");

const prefNotif = document.getElementById("prefNotif");
const prefTips = document.getElementById("prefTips");
const prefDark = document.getElementById("prefDark");
const savePrefsBtn = document.getElementById("savePrefs");

const logoutBtn = document.getElementById("logoutBtn");
const logoutBtn2 = document.getElementById("logoutBtn2");
const deleteAccountBtn = document.getElementById("deleteAccount");
const statusBox = document.getElementById("status");
document.getElementById("year").textContent = new Date().getFullYear();

const defaultAvatarUrl =
  "https://api.dicebear.com/7.x/initials/svg?seed=Visiteur&backgroundType=gradientLinear&fontFamily=Arial";
const interactiveElements = [
  photoInput,
  savePhotoBtn,
  nameField,
  emailField,
  saveProfileBtn,
  verifyEmailBtn,
  changePasswordBtn,
  prefNotif,
  prefTips,
  prefDark,
  savePrefsBtn,
  logoutBtn,
  logoutBtn2,
  deleteAccountBtn,
];

function setFormEnabled(enabled) {
  interactiveElements.forEach((el) => {
    if (!el) return;
    if (typeof el.disabled === "boolean") {
      el.disabled = !enabled;
    }
    el.classList.toggle("opacity-60", !enabled);
    el.classList.toggle("cursor-not-allowed", !enabled);
  });
}

function resetProfileView() {
  avatar.src = defaultAvatarUrl;
  displayName.textContent = "Visiteur";
  emailEl.textContent = "Non connecté";
  nameField.value = "";
  emailField.value = "";
  vipBadge.textContent = "VIP : —";
  prefNotif.checked = false;
  prefTips.checked = false;
  prefDark.checked = true;
  createdAtEl.textContent = "—";
  lastLoginEl.textContent = "—";
}

function setStatus(msg, type = "info") {
  statusBox.textContent = msg || "";
  statusBox.className =
    "mt-6 text-sm " + (type === "error" ? "text-red-400" : "text-white/80");
}

function requireAuth() {
  const user = auth.currentUser;
  if (!user) {
    setStatus("Connectez-vous pour utiliser cette fonctionnalité.", "error");
    return null;
  }
  return user;
}

setFormEnabled(false);
resetProfileView();
setStatus("Chargement du profil…");

// Auth guard + chargement profil
onAuthStateChanged(auth, async (user) => {
  const authenticated = !!user;
  window.__mhdIsAuthenticated = authenticated;
  window.dispatchEvent(
    new CustomEvent("mhd:auth-state", { detail: { authenticated } }),
  );
  if (!user) {
    resetProfileView();
    setFormEnabled(false);
    setStatus(
      "Connectez-vous pour modifier votre profil. Vous pouvez consulter cette page librement.",
    );
    return;
  }

  setFormEnabled(true);

  try {
    setStatus("");
    // Base Auth data
    displayName.textContent = user.displayName || "Utilisateur";
    emailEl.textContent = user.email || "—";
    nameField.value = user.displayName || "";
    emailField.value = user.email || "";

    avatar.src = user.photoURL || defaultAvatarUrl;

    const created = user.metadata?.creationTime
      ? new Date(user.metadata.creationTime)
      : null;
    const lastLogin = user.metadata?.lastSignInTime
      ? new Date(user.metadata.lastSignInTime)
      : null;
    createdAtEl.textContent = created ? created.toLocaleDateString() : "—";
    lastLoginEl.textContent = lastLogin ? lastLogin.toLocaleDateString() : "—";

    // Firestore user doc
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        vip: false,
        preferences: { notif: false, tipsByEmail: false, dark: true },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      vipBadge.textContent = "VIP : non";
      prefNotif.checked = false;
      prefTips.checked = false;
      prefDark.checked = true;
    } else {
      const data = snap.data();
      vipBadge.textContent = "VIP : " + (data.vip ? "oui" : "non");
      prefNotif.checked = !!data.preferences?.notif;
      prefTips.checked = !!data.preferences?.tipsByEmail;
      prefDark.checked = data.preferences?.dark !== false;
    }
  } catch (e) {
    setStatus("Erreur de chargement du profil : " + e.message, "error");
  }
});

// Save photo
savePhotoBtn.addEventListener("click", async () => {
  const user = requireAuth();
  if (!user) return;
  const file = photoInput.files?.[0];
  if (!file)
    return setStatus("Choisissez une image avant d’enregistrer.", "error");

  try {
    setStatus("Envoi de la photo…");
    const fileRef = ref(
      storage,
      `avatars/${user.uid}/${Date.now()}_${file.name}`,
    );
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    await updateProfile(user, { photoURL: url });
    avatar.src = url;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { photoURL: url, updatedAt: serverTimestamp() });

    setStatus("Photo de profil mise à jour ✅");
  } catch (e) {
    setStatus("Erreur lors de l’upload : " + e.message, "error");
  }
});

// Save name + email
saveProfileBtn.addEventListener("click", async () => {
  const user = requireAuth();
  if (!user) return;
  const newName = nameField.value.trim();
  const newEmail = emailField.value.trim();

  try {
    setStatus("Mise à jour du profil…");
    if (newName && newName !== (user.displayName || "")) {
      await updateProfile(user, { displayName: newName });
      displayName.textContent = newName;
    }
    if (newEmail && newEmail !== user.email) {
      // Update email (peut nécessiter une réauth)
      await updateEmail(user, newEmail);
      emailEl.textContent = newEmail;
    }
    await updateDoc(doc(db, "users", user.uid), {
      displayName: newName,
      email: newEmail,
      updatedAt: serverTimestamp(),
    });
    setStatus("Profil mis à jour ✅");
  } catch (e) {
    if (e.code === "auth/requires-recent-login") {
      setStatus(
        "Action sensible : veuillez vous réauthentifier (popup Google) puis réessayer.",
        "error",
      );
      try {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
        setStatus(
          "Réauthentification réussie, cliquez de nouveau sur Enregistrer.",
        );
      } catch (reauthErr) {
        setStatus("Réauthentification annulée : " + reauthErr.message, "error");
      }
    } else {
      setStatus("Erreur : " + e.message, "error");
    }
  }
});

// Verify email
verifyEmailBtn.addEventListener("click", async () => {
  const user = requireAuth();
  if (!user) return;
  try {
    await sendEmailVerification(user);
    setStatus("E-mail de vérification envoyé ✅");
  } catch (e) {
    setStatus("Erreur : " + e.message, "error");
  }
});

// Change password (envoie un lien de reset)
changePasswordBtn.addEventListener("click", async () => {
  const user = requireAuth();
  if (!user) return;
  if (!user.email) {
    setStatus("Aucun e-mail trouvé sur ce compte.", "error");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, user.email);
    setStatus(
      "Lien de réinitialisation de mot de passe envoyé à " + user.email + " ✅",
    );
  } catch (e) {
    setStatus("Erreur : " + e.message, "error");
  }
});

// Save preferences
savePrefsBtn.addEventListener("click", async () => {
  const user = requireAuth();
  if (!user) return;
  try {
    await updateDoc(doc(db, "users", user.uid), {
      preferences: {
        notif: prefNotif.checked,
        tipsByEmail: prefTips.checked,
        dark: prefDark.checked,
      },
      updatedAt: serverTimestamp(),
    });
    setStatus("Préférences enregistrées ✅");
  } catch (e) {
    setStatus("Erreur : " + e.message, "error");
  }
});

// Logout
const doLogout = async () => {
  const user = requireAuth();
  if (!user) return;
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (e) {
    setStatus("Erreur : " + e.message, "error");
  }
};
logoutBtn?.addEventListener("click", doLogout);
logoutBtn2?.addEventListener("click", doLogout);

// Delete account
deleteAccountBtn.addEventListener("click", async () => {
  const user = requireAuth();
  if (!user) return;
  if (
    !confirm("Êtes-vous sûr de vouloir supprimer définitivement votre compte ?")
  )
    return;
  try {
    await deleteUser(user);
    alert("Compte supprimé.");
    window.location.href = "index.html";
  } catch (e) {
    if (e.code === "auth/requires-recent-login") {
      setStatus(
        "Veuillez vous réauthentifier (popup Google), puis relancez la suppression.",
        "error",
      );
      try {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
        await deleteUser(user);
        alert("Compte supprimé.");
        window.location.href = "index.html";
      } catch (reauthErr) {
        setStatus("Erreur suppression : " + reauthErr.message, "error");
      }
    } else {
      setStatus("Erreur suppression : " + e.message, "error");
    }
  }
});
