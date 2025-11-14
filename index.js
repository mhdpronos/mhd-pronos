// ==== IMPORTS FIREBASE (module) ====
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ==== CONFIG FIREBASE (unique, réutilisée) ====
const firebaseConfig = {
  apiKey: "AIzaSyCoR8lWMJbB0Pgr-F86v3hwWlX4XT3TQ1k",
  authDomain: "mhd-pronos.firebaseapp.com",
  projectId: "mhd-pronos",
  storageBucket: "mhd-pronos.firebasestorage.app",
  messagingSenderId: "366441954219",
  appId: "1:366441954219:web:a8be6641c5c922c59cf0ee"
};

// Évite l’erreur "App already exists"
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==== HEADER : boutons simples ====
const aboutBtn = document.getElementById('aboutBtn');
aboutBtn?.addEventListener('click', () => {
  window.location.href = 'about.html';
});

const notifBtn = document.getElementById('notificationsBtn');
const notifBadge = document.getElementById('notifBadge');

notifBtn?.addEventListener('click', () => {
  window.location.href = 'notifications.html';
});

// ==== BADGE NOTIFICATIONS FIRESTORE ====
async function refreshNotificationBadge() {
  if (!notifBadge) return;
  try {
    const q = query(collection(db, 'notifications'), where('lu', '==', false));
    const snapshot = await getDocs(q);
    const unread = snapshot.size;
    if (unread > 0) {
      notifBadge.textContent = unread > 99 ? '99+' : String(unread);
      notifBadge.classList.remove('hidden');
    } else {
      notifBadge.classList.add('hidden');
    }
  } catch (err) {
    console.error('Erreur de chargement des notifications :', err);
    notifBadge.classList.add('hidden');
  }
}

const infofootBadge = document.getElementById('infofoot-badge');

async function refreshInfofootBadge() {
  if (!infofootBadge) return;
  try {
    const snapshot = await getDocs(collection(db, 'infofoot'));
    const totalNews = snapshot.size;
    let lastRead = Number(localStorage.getItem('infofoot_read_count') || 0);

    if (window.location.pathname.includes('infofoot.html')) {
      localStorage.setItem('infofoot_read_count', String(totalNews));
      lastRead = totalNews;
    }

    if (totalNews > lastRead) {
      const diff = totalNews - lastRead;
      infofootBadge.textContent = diff > 9 ? '9+' : String(diff);
      infofootBadge.classList.remove('hidden');
    } else {
      infofootBadge.classList.add('hidden');
    }
  } catch (err) {
    console.error('Erreur de chargement des actualités :', err);
    infofootBadge.classList.add('hidden');
  }
}

refreshNotificationBadge();
refreshInfofootBadge();

setInterval(() => {
  refreshNotificationBadge();
  refreshInfofootBadge();
}, 60000);

// ==== MODALE D’AUTHENTIFICATION (GUARD requires-auth) ====
const modal = document.getElementById('authModal');
const btnClose = document.getElementById('authClose');
const btnLogin = document.getElementById('goLogin');
const btnSignup = document.getElementById('goSignup');

let pendingTarget = null;

function openModal() {
  if (modal) modal.classList.add('open');
}
function closeModal() {
  if (modal) modal.classList.remove('open');
  pendingTarget = null;
}
btnClose?.addEventListener('click', closeModal);

function updateAuthLinks(targetHref) {
  if (!btnLogin || !btnSignup) return;
  const enc = encodeURIComponent(targetHref);
  btnLogin.href  = `connexion.html?redirect=${enc}`;
  btnSignup.href = `inscription.html?redirect=${enc}`;
}

function wireAuthGuards(user) {
  document.querySelectorAll('a.requires-auth').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '#';
      if (user) {
        return; // connecté → laisse passer
      }
      e.preventDefault();
      pendingTarget = href;
      updateAuthLinks(href);
      sessionStorage.setItem('postLoginRedirect', href);
      openModal();
    }, { capture: true });
  });
}

// ==== SUIVI DE L'ÉTAT AUTH GLOBALE ====
onAuthStateChanged(auth, (user) => {
  const authenticated = !!user;
  window.__mhdIsAuthenticated = authenticated;
  window.dispatchEvent(new CustomEvent('mhd:auth-state', { detail: { authenticated } }));

  if (user) {
    console.log("Utilisateur connecté :", user.email);
  } else {
    console.log("Utilisateur non connecté");
  }

  wireAuthGuards(user);
});

// ==== COUPONS DU JOUR (floutage / défloutage) ====
(function () {
  const card = document.getElementById('dailyCouponsCard');
  if (!card) return;

  const tableWrapper = card.querySelector('[data-coupons-table]');
  const overlay = card.querySelector('[data-coupons-overlay]');

  const toggleAccess = (authenticated) => {
    if (!tableWrapper || !overlay) return;
    if (authenticated) {
      tableWrapper.classList.remove('coupon-blurred');
      overlay.classList.add('hidden');
      localStorage.setItem('loggedIn', 'true');
    } else {
      tableWrapper.classList.add('coupon-blurred');
      overlay.classList.remove('hidden');
      localStorage.removeItem('loggedIn');
    }
  };

  // État initial
  toggleAccess(window.__mhdIsAuthenticated === true);

  // Réagit aux changements d'état auth
  window.addEventListener('mhd:auth-state', (event) => {
    toggleAccess(Boolean(event.detail && event.detail.authenticated));
  });
})();

// ==== POPUP PUBLICITÉ AVEC COMPTE À REBOURS ====
(function () {
  const overlay = document.getElementById('promoOverlay');
  if (!overlay) return;
  const closeButtons = overlay.querySelectorAll('[data-action="promo-close"]');
  const backdrop = overlay.querySelector('.promo-backdrop');
  const body = document.body;
  const countdownContainer = overlay.querySelector('#promoCountdown');
  const countdownValue = countdownContainer?.querySelector('[data-countdown-value]');
  const countdownDuration = 15;
  let countdownInterval;

  const resetCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = undefined;
    }
    if (countdownValue) {
      countdownValue.textContent = String(countdownDuration);
    }
  };

  const hidePromo = () => {
    overlay.classList.remove('active');
    body.classList.remove('promo-open');
    resetCountdown();
  };

  const startCountdown = () => {
    if (!countdownValue) return;
    let remaining = countdownDuration;
    countdownValue.textContent = String(remaining);
    countdownInterval = setInterval(() => {
      remaining -= 1;
      countdownValue.textContent = String(Math.max(remaining, 0));
      if (remaining <= 0) {
        hidePromo();
      }
    }, 1000);
  };

  const showPromo = () => {
    overlay.classList.add('active');
    body.classList.add('promo-open');
    startCountdown();
  };

  // Affiche après 5 secondes
  setTimeout(showPromo, 5000);

  closeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      hidePromo();
    });
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target === backdrop) {
      hidePromo();
    }
  });
})();

// ==== ANIMATION AU SCROLL POUR .reveal ====
const io = new IntersectionObserver((entries)=> {
  entries.forEach(e => { 
    if (e.isIntersecting) e.target.classList.add('show'); 
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ==== MENU MOBILE ====
{
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('mobileMenu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }
}

// ==== BADGE "CONSEIL DU JOUR" (localStorage) ====
(function(){
  const badge = document.getElementById('badge-conseil');
  if(!badge) return;

  function refreshBadge(){
    const count = Number(localStorage.getItem('conseil_unread_count') || '0');
    if(count > 0){
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // initial
  refreshBadge();

  // si info mise à jour depuis une autre page/onglet
  window.addEventListener('storage', (e)=>{
    if(e.key === 'conseil_unread_count') refreshBadge();
  });

  // petit rafraîchissement périodique
  setInterval(refreshBadge, 5000);
})();

// ==== MHD BOT (assistant paris sportifs) ====
(function () {
  const panel = document.getElementById('mhdChatPanel');
  const toggle = document.getElementById('mhdBotToggle');
  const closeBtn = document.getElementById('mhdChatClose');
  const messagesContainer = document.getElementById('mhdChatMessages');
  const form = document.getElementById('mhdChatForm');
  const input = document.getElementById('mhdChatInput');

  if (!panel || !toggle || !closeBtn || !messagesContainer || !form || !input) {
    return;
  }

  const normalize = (text) => text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const bettingVocabulary = [
    'pari', 'parier', 'paris', 'sportif', 'sportifs', 'pronostic', 'pronostique', 'pronostics', 'cote', 'cotes',
    'bankroll', 'mise', 'mises', 'match', 'matchs', 'football', 'foot', 'ligue', 'stake', 'value', 'bet', 'bets',
    'handicap', 'over', 'under', 'vip', 'ticket', 'bookmaker', 'bookmakers'
  ];

  const knowledgeBase = [
    {
      keywords: ['bonjour', 'bonsoir', 'salut', 'hello', 'coucou'],
      responses: [
        "Salut ! Je suis mhd bot, ton assistant dédié aux paris sportifs. Comment puis-je t'aider aujourd'hui ?",
        "Hey ! Ici mhd bot. Pose-moi ta question sur les paris sportifs et je te répondrai avec précision."
      ]
    },
    {
      keywords: ['qui es tu', 'qui es-tu', 'present', 'présente', 'presentation'],
      responses: [
        "Je suis mhd bot, une IA spécialisée dans les paris sportifs pour t'aider à analyser, rester discipliné et parier intelligemment.",
        "Moi c'est mhd bot ! Je t'accompagne avec des conseils responsables, des astuces bankroll et des analyses pour tes paris."
      ]
    },
    {
      keywords: ['bankroll', 'gestion', 'budget', 'money management'],
      responses: [
        "Gère ta bankroll en misant 1 à 3% de ton capital par pari. Ainsi tu limites les pertes et maximises ton endurance sur la saison.",
        "Fixe un capital de départ et respecte un plan de mise fixe. L'objectif est d'éviter les all-in et de garder du recul sur les séries de matchs."
      ]
    },
    {
      keywords: ['cote', 'cotes', 'value', 'value bet'],
      responses: [
        "Cherche les value bets : lorsque ta probabilité estimée est supérieure à celle des bookmakers. C'est là que se trouve le vrai profit à long terme.",
        "Compare toujours plusieurs bookmakers. Une différence de 0,10 sur une cote peut changer ton ROI sur l'année."
      ]
    },
    {
      keywords: ['combi', 'combiné', 'combine', 'multi'],
      responses: [
        "Limite les combinés à 2 ou 3 sélections de qualité. Plus tu ajoutes de matchs, plus ton risque global augmente fortement.",
        "Utilise le combiné pour booster une mise modeste mais reste sélectif : privilégie des matchs que tu as vraiment étudiés."
      ]
    },
    {
      keywords: ['analyse', 'stat', 'statistique', 'forme', 'analyse match'],
      responses: [
        "Analyse la forme récente, les confrontations directes et les absences clés avant de te décider. Les statistiques sont tes alliées.",
        "Combine données statistiques et contexte : météo, enjeu du match, fatigue. Un bon pari repose sur plusieurs indicateurs convergents."
      ]
    },
    {
      keywords: ['responsable', 'addiction', 'risque', 'perte'],
      responses: [
        "Parie toujours de manière responsable. Si tu sens que le jeu te dépasse, fais une pause et demande de l'aide à un proche ou à un professionnel.",
        "Planifie tes mises à l'avance et n'essaie pas de te refaire après une perte. Discipline et contrôle émotionnel sont indispensables."
      ]
    },
    {
      keywords: ['vip', 'abonnement', 'premium'],
      responses: [
        "Les formules VIP de mhd pronos incluent des analyses poussées et un suivi personnalisé. Assure-toi que ça correspond à ta stratégie avant de t'abonner.",
        "Un abonnement est utile si tu suis les conseils sérieusement. N'investis que si ta bankroll le permet et reste rigoureux."
      ]
    },
    {
      keywords: ['merci', 'thanks'],
      responses: [
        "Avec plaisir ! Pose-moi d'autres questions sur les paris sportifs quand tu veux.",
        "Merci à toi ! Je suis là dès que tu as besoin d'un conseil sur les paris."
      ]
    }
  ];

  const fallbackBettingResponses = [
    "Je n'ai pas encore la réponse exacte, mais focalise-toi sur la gestion de ta bankroll, l'analyse des statistiques et les cotes de value.",
    "Je te conseille de vérifier les compositions probables, la dynamique des deux équipes et de miser seulement si la cote offre un avantage réel.",
    "Reste discipliné : note tes paris, analyse ce qui fonctionne et ajuste ta stratégie progressivement."
  ];

  const outOfScopeResponses = [
    "Je suis là uniquement pour parler de paris sportifs. Reformule ta question dans ce domaine et je t'aiderai avec plaisir !",
    "Je ne peux répondre qu'aux questions liées aux paris sportifs. Pose-moi une question sur les cotes, la bankroll ou l'analyse de match."
  ];

  const appendMessage = (type, text) => {
    const bubble = document.createElement('div');
    bubble.className = `mhd-chat-bubble ${type}`;
    bubble.textContent = text;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
  };

  const isBettingQuestion = (text) => bettingVocabulary.some((keyword) => text.includes(keyword));

  const pickResponse = (message) => {
    const normalizedMessage = normalize(message);
    if (!isBettingQuestion(normalizedMessage)) {
      return outOfScopeResponses[Math.floor(Math.random() * outOfScopeResponses.length)];
    }

    for (const entry of knowledgeBase) {
      if (entry.keywords.some((keyword) => normalizedMessage.includes(keyword))) {
        return entry.responses[Math.floor(Math.random() * entry.responses.length)];
      }
    }

    return fallbackBettingResponses[Math.floor(Math.random() * fallbackBettingResponses.length)];
  };

  let introShown = false;

  const showIntro = () => {
    if (introShown) return;
    introShown = true;
    appendMessage('bot', "Bonjour, je suis mhd bot. Pose-moi tes questions sur les paris sportifs et je te répondrai avec des conseils responsables.");
  };

  const openChat = () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    showIntro();
    panel.focus();
    setTimeout(() => input.focus(), 100);
  };

  const closeChat = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.focus();
  };

  toggle.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn.addEventListener('click', () => {
    closeChat();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      return;
    }

    appendMessage('user', value);
    input.value = '';

    const typing = document.createElement('div');
    typing.className = 'mhd-chat-typing';
    typing.textContent = 'mhd bot réfléchit...';
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });

    setTimeout(() => {
      typing.remove();
      const response = pickResponse(value);
      appendMessage('bot', response);
    }, 600 + Math.random() * 700);
  });

  // Accessibilité: fermer avec Echap
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeChat();
    }
  });
})();
