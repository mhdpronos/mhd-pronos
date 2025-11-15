const STORAGE_KEY = 'mhdBot.conversations.v1';
const SETTINGS_KEY = 'mhdBot.preferences.v2';

const DEFAULT_SETTINGS = {
  persona: 'Analyste discipliné',
  tone: 'analyse-structurée',
  focus: 'football-europeen',
  creativity: 0.35
};

const SUGGESTIONS = [
  {
    label: 'Analyse match du jour',
    prompt: 'Peux-tu analyser le match entre le Real Madrid et Barcelone avec les cotes probables, les joueurs clés et la meilleure stratégie de mise ?'
  },
  {
    label: 'Construire un combiné',
    prompt: 'Propose-moi un combiné sécurisé pour ce week-end avec explication des risques et gestion de bankroll.'
  },
  {
    label: 'Stratégie bankroll',
    prompt: 'Quelle stratégie de bankroll recommandes-tu pour un capital de 50 000 F CFA et des mises quotidiennes ?'
  },
  {
    label: 'Pronostic score exact',
    prompt: "Aide-moi à déterminer le score exact le plus probable pour le prochain match de Chelsea en championnat."
  },
  {
    label: 'Dernières tendances',
    prompt: 'Quelles sont les tendances statistiques des deux équipes avant le match de Ligue des champions de ce soir ?'
  }
];

const TEAM_PROFILES = {
  'real madrid': {
    name: 'Real Madrid',
    rating: 88,
    attack: 89,
    defense: 85,
    tempo: 'possession patiente et transitions rapides',
    lastFive: ['V', 'V', 'N', 'V', 'V'],
    keyPlayers: ['Jude Bellingham', 'Vinícius Júnior', 'Rodrygo'],
    injuries: ['Courtois (longue durée)', 'Militao (surveillance)'],
    strengths: ['Maîtrise des temps forts', 'Efficacité offensive'],
    weaknesses: ['Peut laisser des espaces sur les côtés en fin de match'],
    coachNote: 'Ancelotti gère très bien les rendez-vous à haute pression.'
  },
  'barcelone': {
    name: 'Barcelone',
    rating: 85,
    attack: 86,
    defense: 82,
    tempo: 'jeu de position avec pressing haut',
    lastFive: ['V', 'N', 'V', 'V', 'D'],
    keyPlayers: ['Robert Lewandowski', 'Pedri', 'Raphinha'],
    injuries: ['De Jong (souvent préservé)', 'Araujo (gestion physique)'],
    strengths: ['Capacité à monopoliser le ballon', 'Transitions rapides sur les ailes'],
    weaknesses: ['Manque parfois de solidité sur coups de pied arrêtés'],
    coachNote: 'Xavi cherche l’équilibre entre possession et verticalité.'
  },
  'chelsea': {
    name: 'Chelsea',
    rating: 81,
    attack: 79,
    defense: 80,
    tempo: 'transitions rapides et pressing haut',
    lastFive: ['V', 'V', 'D', 'N', 'V'],
    keyPlayers: ['Cole Palmer', 'Raheem Sterling', 'Enzo Fernández'],
    injuries: ['Reece James (fragile)', 'Nkunku (retour progressif)'],
    strengths: ['Qualité en transition offensive', 'Jeunesse dynamique'],
    weaknesses: ['Manque de régularité', 'Quelques erreurs défensives individuelles'],
    coachNote: 'Le projet reste en construction mais le potentiel offensif est réel.'
  },
  'psg': {
    name: 'Paris Saint-Germain',
    rating: 87,
    attack: 90,
    defense: 83,
    tempo: 'attaque placée, recherche de déséquilibre rapide',
    lastFive: ['V', 'V', 'N', 'V', 'V'],
    keyPlayers: ['Kylian Mbappé', 'Ousmane Dembélé', 'Vitinha'],
    injuries: ['Kimpembe (longue durée)'],
    strengths: ['Explosivité offensive', 'Qualité individuelle'],
    weaknesses: ['Gestion des transitions défensives'],
    coachNote: 'Luis Enrique veut maintenir un pressing haut exigeant.'
  },
  'manchester city': {
    name: 'Manchester City',
    rating: 90,
    attack: 91,
    defense: 88,
    tempo: 'contrôle du ballon, pressing structurel',
    lastFive: ['V', 'V', 'V', 'N', 'V'],
    keyPlayers: ['Erling Haaland', 'Kevin De Bruyne', 'Phil Foden'],
    injuries: ['De Bruyne (retours à gérer)', 'Stones (fragile)'],
    strengths: ['Maîtrise collective', 'Variantes offensives'],
    weaknesses: ['Peut concéder sur transitions rapides'],
    coachNote: 'Guardiola ajuste souvent ses plans selon l’adversaire.'
  },
  'liverpool': {
    name: 'Liverpool',
    rating: 86,
    attack: 87,
    defense: 83,
    tempo: 'pressing haut et transitions rapides',
    lastFive: ['V', 'N', 'V', 'V', 'D'],
    keyPlayers: ['Mohamed Salah', 'Dominik Szoboszlai', 'Virgil van Dijk'],
    injuries: ['Robertson (rotation)', 'Thiago (en reprise)'],
    strengths: ['Intensité, puissance offensive'],
    weaknesses: ['Laisse des espaces derrière les latéraux'],
    coachNote: 'Klopp mise sur la verticalité et la profondeur.'
  },
  'bayern munich': {
    name: 'Bayern Munich',
    rating: 88,
    attack: 90,
    defense: 84,
    tempo: 'pression constante et projection rapide',
    lastFive: ['V', 'V', 'V', 'D', 'V'],
    keyPlayers: ['Harry Kane', 'Jamal Musiala', 'Leroy Sané'],
    injuries: ['Mazraoui (gestion)', 'De Ligt (parfois incertain)'],
    strengths: ['Puissance offensive', 'Largeur de banc'],
    weaknesses: ['Transitions défensives parfois vulnérables'],
    coachNote: 'Tuchel jongle avec plusieurs schémas selon l’adversaire.'
  },
  'juventus': {
    name: 'Juventus',
    rating: 82,
    attack: 78,
    defense: 84,
    tempo: 'bloc compact et transitions rapides',
    lastFive: ['V', 'N', 'V', 'D', 'V'],
    keyPlayers: ['Dušan Vlahović', 'Federico Chiesa', 'Adrien Rabiot'],
    injuries: ['Pogba (indisponible)', 'Danilo (surveillance)'],
    strengths: ['Solidité défensive', 'Efficacité dans les matchs fermés'],
    weaknesses: ['Manque de créativité en attaque placée'],
    coachNote: 'Allegri privilégie la gestion des temps faibles.'
  },
  'olympique de marseille': {
    name: 'Olympique de Marseille',
    rating: 79,
    attack: 80,
    defense: 78,
    tempo: 'pressing agressif au Vélodrome',
    lastFive: ['V', 'N', 'D', 'V', 'N'],
    keyPlayers: ['Pierre-Emerick Aubameyang', 'Jordan Veretout', 'Chancel Mbemba'],
    injuries: ['Gigot (souvent ménagé)'],
    strengths: ['Ambiance domicile forte', 'Transitions offensives'],
    weaknesses: ['Difficultés hors de la maison'],
    coachNote: 'Le coach insiste sur l’intensité et l’engagement.'
  },
  'olympique lyonnais': {
    name: 'Olympique Lyonnais',
    rating: 77,
    attack: 76,
    defense: 75,
    tempo: 'jeu de transition, dépendance aux individualités',
    lastFive: ['N', 'V', 'D', 'V', 'N'],
    keyPlayers: ['Alexandre Lacazette', 'Rayan Cherki', 'Maxence Caqueret'],
    injuries: ['Lovren (gestion)', 'Jeffinho (retour progressif)'],
    strengths: ['Qualité technique individuelle'],
    weaknesses: ['Inconstance défensive'],
    coachNote: 'L’OL doit gérer ses temps faibles et rester discipliné.'
  }
};

const GLOBAL_TRENDS = {
  bankroll: [
    'Fractionne ton capital en unités (1 % à 2 % du capital par pari).',
    'Ne mise jamais plus de 5 % sur un seul pari, même très sûr.',
    'Analyse toujours la valeur de la cote plutôt que le simple favori.',
    'Tiens un journal de paris pour suivre tes performances et ajuster ta stratégie.'
  ],
  discipline: [
    'Privilégie des cotes entre 1.60 et 2.20 pour construire un rendement régulier.',
    'Évite de multiplier les combinés à plus de 3 sélections pour limiter le risque.',
    'Compare les cotes entre plusieurs bookmakers pour capter la meilleure valeur.',
    'Utilise le cash-out uniquement pour sécuriser une belle avance en fin de rencontre.'
  ],
  comboIdeas: [
    {
      label: 'Double chance + Buts',
      description: 'Associer un favori en double chance avec un pari “Plus de 1,5 buts” sur un autre match limite les surprises.'
    },
    {
      label: 'Combiné progressif',
      description: 'Sélectionne deux matchs sûrs (cotes 1.35 - 1.55) et ajoute un pari moyen (1.70 - 1.90) pour booster la cote totale.'
    },
    {
      label: 'Combiné live',
      description: 'Attends 10 minutes pour confirmer le rythme du match avant de placer le pari, cela sécurise le combiné.'
    }
  ]
};

const FALLBACK_UUID = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

function stringHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normaliseName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTeamName(raw) {
  return raw
    .replace(/\b(le|la|les|l'|the|fc|club|team|de|du|des)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function createGenericProfile(name) {
  const cleaned = normaliseName(name);
  const hash = stringHash(cleaned || name);
  const rating = 70 + (hash % 20);
  const attack = 68 + (hash % 18);
  const defense = 66 + ((hash >> 3) % 18);
  const tempoOptions = ['bloc compact et contre', 'jeu direct', 'pressing haut intermittent', 'possession patiente'];
  const tempo = tempoOptions[hash % tempoOptions.length];
  const sequence = [];
  for (let i = 0; i < 5; i += 1) {
    const value = (hash >> (i * 3)) % 3;
    sequence.push(['V', 'N', 'D'][value]);
  }
  const strengths = [
    'Peut surprendre sur coups de pied arrêtés',
    'Solide mentalement quand le score est serré',
    'Effectif homogène',
    'Bonne gestion des fins de match'
  ];
  const weaknesses = [
    'Difficultés sur transitions défensives',
    'Manque de régularité à l’extérieur',
    'Effectif jeune, parfois irrégulier',
    'Prend des risques en ressortant le ballon'
  ];
  const keyPlayers = [
    `${toTitleCase(name.split(' ')[0] || 'Joueur')} clé`,
    'Milieu créatif influent',
    'Gardien décisif'
  ];
  return {
    name: toTitleCase(name),
    rating,
    attack,
    defense,
    tempo,
    lastFive: sequence,
    keyPlayers,
    injuries: ['Aucun forfait majeur signalé'],
    strengths: [strengths[hash % strengths.length], strengths[(hash >> 2) % strengths.length]],
    weaknesses: [weaknesses[(hash >> 1) % weaknesses.length]],
    coachNote: "L’équipe progresse mais doit confirmer face aux gros adversaires."
  };
}

function getTeamProfile(name) {
  const cleaned = normaliseName(name);
  const profile = TEAM_PROFILES[cleaned];
  if (profile) {
    return { ...profile, displayName: profile.name };
  }
  return { ...createGenericProfile(name), displayName: toTitleCase(name) };
}

function computeFormPoints(sequence) {
  return sequence.reduce((total, result) => {
    if (result === 'V') return total + 3;
    if (result === 'N') return total + 1;
    return total;
  }, 0);
}

function formatForm(sequence) {
  return sequence.map((letter) => {
    if (letter === 'V') return 'V';
    if (letter === 'N') return 'N';
    return 'D';
  }).join('-');
}

function detectIntents(question) {
  const lower = question.toLowerCase();
  return {
    greeting: /(bonjour|salut|coucou|bonsoir|hello)/.test(lower),
    presentation: /(présente[-\s]?toi|qui es[-\s]?tu|parle de toi)/.test(lower),
    bankroll: /(bankroll|mise|capital|budget|argent|stake|mise\s+max|min)/.test(lower),
    combo: /(combiné|combo|parlay|multiple)/.test(lower),
    pronostic: /(pronostic|analyse|pari|résultat|gagnant|issue|score)/.test(lower),
    scoreExact: /(score\s+exact|exact\s+score|score\s+précis)/.test(lower),
    risk: /(sécuris|risque|fiable|safe|prudence|agressif)/.test(lower),
    strategy: /(astuce|conseil|technique|stratégie|méthode)/.test(lower),
    continuation: /(continue|reprendre|encore|poursuis|même\s+sujet)/.test(lower)
  };
}

function extractAmount(question) {
  const match = question.replace(/[ \s]+/g, ' ').match(/(\d+[\d\s.,]*)\s*(fcfa|f cfa|cfa|€|eur|euros|$|usd|dollars|francs)?/i);
  if (!match) return null;
  const numeric = match[1].replace(/[^\d.,]/g, '').replace(/,/g, '.').replace(/\.(?=.*\.)/g, '');
  const value = Number(numeric);
  if (!Number.isFinite(value) || value <= 0) return null;
  const currency = match[2] ? match[2].toLowerCase() : 'unité';
  return { value, currency };
}

function detectTimeReference(question) {
  const lower = question.toLowerCase();
  if (/ce\s+soir/.test(lower)) return 'ce soir';
  if (/demain/.test(lower)) return 'demain';
  if (/week[-\s]?end/.test(lower)) return 'ce week-end';
  if (/dans\s+\d+\s+jours?/.test(lower)) return question.match(/dans\s+\d+\s+jours?/i)[0];
  if (/samedi|dimanche|lundi|mardi|mercredi|jeudi|vendredi/.test(lower)) {
    return lower.match(/samedi|dimanche|lundi|mardi|mercredi|jeudi|vendredi/)[0];
  }
  return null;
}

function extractMatch(question, previousMatch) {
  const cleanedQuestion = question.replace(/\n/g, ' ');
  const patterns = [
    /([A-Za-zÀ-ÿ'\-\s]{2,})\s+(?:vs|VS|contre|face\s+à|face\s+au|face\s+aux)\s+([A-Za-zÀ-ÿ'\-\s]{2,})/,
    /entre\s+([A-Za-zÀ-ÿ'\-\s]{2,})\s+et\s+([A-Za-zÀ-ÿ'\-\s]{2,})/,
    /match\s+([A-Za-zÀ-ÿ'\-\s]{2,})\s*(?:-\s*|vs\s+)?([A-Za-zÀ-ÿ'\-\s]{2,})/
  ];

  for (const pattern of patterns) {
    const result = cleanedQuestion.match(pattern);
    if (result) {
      const home = toTitleCase(cleanTeamName(result[1]));
      const away = toTitleCase(cleanTeamName(result[2]));
      if (home && away) {
        return {
          home,
          away,
          display: `${home} vs ${away}`
        };
      }
    }
  }

  if (previousMatch && /(ce\s+match|cette\s+rencontre|le\s+match)/i.test(question)) {
    return previousMatch;
  }

  return null;
}

function computeScoreSuggestion(probabilities) {
  if (!probabilities) return 'Score prudent : 1-1 (scénario équilibré).';
  const { homeWin, awayWin } = probabilities;
  if (homeWin >= 48) return 'Score prudent : 2-1 avec avantage au favori à domicile.';
  if (awayWin >= 45) return 'Score prudent : 1-2 avec un succès du visiteur sur un détail.';
  return 'Score prudent : 1-1, reflet d’un match serré.';
}

function formatBulletList(items) {
  return items
    .filter(Boolean)
    .map((item) => `• ${item}`)
    .join('\n');
}

function deduplicate(items) {
  return [...new Set(items.filter(Boolean))];
}

function buildBankrollAdvice(amount, intents) {
  const lines = [];
  if (amount) {
    const stake1 = (amount.value * 0.015).toFixed(0);
    const stake2 = (amount.value * 0.025).toFixed(0);
    lines.push(`Capital détecté : ~${amount.value.toLocaleString('fr-FR')} ${amount.currency.toUpperCase()}.`);
    lines.push(`Mise unitaire recommandée : ${stake1} à ${stake2} ${amount.currency.toUpperCase()} (1,5 % à 2,5 %).`);
  } else {
    lines.push('Définis une unité de mise comprise entre 1 % et 3 % de ta bankroll.');
  }
  if (intents.combo) {
    lines.push('Sur un combiné, limite-toi à 2 ou 3 sélections pour conserver de la maîtrise.');
  }
  lines.push(GLOBAL_TRENDS.bankroll[0]);
  lines.push('Réévalue ta mise après 25 à 30 paris enregistrés pour ajuster la stratégie.');
  return deduplicate(lines).join('\n');
}

function createComboAdvice(question, creativity) {
  const baseIdeas = GLOBAL_TRENDS.comboIdeas.map((idea) => `${idea.label} : ${idea.description}`);
  const additional = [];
  if (/cote/i.test(question)) {
    additional.push('Vise une cote totale entre 2.20 et 3.00 pour équilibrer risque et rentabilité.');
  }
  if (creativity > 0.45) {
    additional.push('En live, observe les premières minutes : un pressing élevé et plusieurs tirs cadrés justifient un pari “plus de 2,5 buts”.');
  }
  return deduplicate([...baseIdeas, ...additional]);
}

function buildFollowUpQuestions(intents, matchInsights) {
  if (matchInsights) {
    return [
      `Souhaites-tu une analyse des buteurs potentiels pour ${matchInsights.label} ?`,
      'Veux-tu un plan de mise précis pour ce pronostic ?',
      'Besoin d’un combiné ou d’un autre match à comparer ?'
    ];
  }
  if (intents.bankroll) {
    return [
      'Souhaites-tu que l’on fixe ensemble les paliers de mise ?',
      'Veux-tu un exemple de suivi de bankroll sur 4 semaines ?',
      'As-tu besoin d’une idée de pari pour tester la méthode ?'
    ];
  }
  return [
    'Veux-tu analyser un match précis ?',
    'Souhaites-tu des idées de combinés pour aujourd’hui ?',
    'As-tu besoin d’un rappel sur la gestion de bankroll ?'
  ];
}

class MhdBotAssistant {
  constructor(root) {
    this.root = root;
    this.launcher = root.querySelector('[data-mhdbot-launcher]');
    this.overlay = root.querySelector('[data-mhdbot-overlay]');
    this.window = root.querySelector('[data-mhdbot-window]');
    this.messagesContainer = root.querySelector('[data-mhdbot-messages]');
    this.typingIndicator = root.querySelector('[data-mhdbot-typing]');
    this.suggestionsContainer = root.querySelector('[data-mhdbot-suggestions]');
    this.form = root.querySelector('[data-mhdbot-form]');
    this.input = root.querySelector('[data-mhdbot-input]');
    this.sendButton = root.querySelector('[data-mhdbot-send]');
    this.title = root.querySelector('[data-mhdbot-title]');
    this.newConversationBtn = root.querySelector('[data-mhdbot-new]');
    this.conversationList = root.querySelector('[data-mhdbot-conversation-list]');
    this.settingsPanel = root.querySelector('[data-mhdbot-settings]');
    this.openSettingsBtn = root.querySelector('[data-mhdbot-open-settings]');
    this.closeBtn = root.querySelector('[data-mhdbot-close]');
    this.settingsForm = root.querySelector('[data-mhdbot-settings-form]');
    this.toast = document.querySelector('[data-mhdbot-toast]');

    this.state = {
      conversations: this.loadConversations(),
      currentConversationId: null,
      settings: this.loadSettings(),
      busy: false
    };

    if (!this.state.conversations.length) {
      const conversation = this.createConversation();
      this.state.conversations.push(conversation);
      this.state.currentConversationId = conversation.id;
      this.persistConversations();
    } else {
      this.state.currentConversationId = this.state.conversations[0].id;
    }

    this.renderConversations();
    this.renderMessages();
    this.renderSuggestions();
    this.bindEvents();
    this.fillSettingsForm();
  }

  bindEvents() {
    this.launcher?.addEventListener('click', () => this.open());
    this.overlay?.addEventListener('click', () => this.close());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.newConversationBtn?.addEventListener('click', () => this.startNewConversation());
    this.form?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSubmit();
    });
    this.openSettingsBtn?.addEventListener('click', () => {
      this.settingsPanel?.classList.toggle('active');
      if (this.settingsPanel?.classList.contains('active')) {
        this.settingsPanel.removeAttribute('hidden');
      } else {
        this.settingsPanel?.setAttribute('hidden', '');
      }
    });
    this.settingsForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSettingsSubmit(new FormData(this.settingsForm));
    });

    this.conversationList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-conversation-id]');
      if (!button) return;

      if (event.target.matches('[data-action="delete-conversation"]')) {
        event.stopPropagation();
        const id = button.getAttribute('data-conversation-id');
        this.removeConversation(id);
        return;
      }

      const conversationId = button.getAttribute('data-conversation-id');
      this.setCurrentConversation(conversationId);
    });

    this.conversationList?.addEventListener('keydown', (event) => {
      if (!['Enter', ' '].includes(event.key)) return;
      const button = event.target.closest('[data-conversation-id]');
      if (!button) return;
      event.preventDefault();
      if (event.target.matches('[data-action="delete-conversation"]')) {
        const id = button.getAttribute('data-conversation-id');
        this.removeConversation(id);
      } else {
        const conversationId = button.getAttribute('data-conversation-id');
        this.setCurrentConversation(conversationId);
      }
    });

    this.suggestionsContainer?.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-suggestion]');
      if (!button) return;
      const prompt = button.getAttribute('data-suggestion');
      if (prompt) {
        this.input.value = prompt;
        this.handleSubmit();
      }
    });
  }

  loadConversations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((conversation) => ({
        id: conversation.id || FALLBACK_UUID(),
        title: conversation.title || 'Nouvelle discussion',
        createdAt: conversation.createdAt || new Date().toISOString(),
        updatedAt: conversation.updatedAt || conversation.createdAt || new Date().toISOString(),
        messages: Array.isArray(conversation.messages) ? conversation.messages : [],
        context: conversation.context && typeof conversation.context === 'object' ? conversation.context : {}
      }));
    } catch (error) {
      console.error('Impossible de charger les conversations :', error);
      return [];
    }
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const merged = { ...DEFAULT_SETTINGS, ...parsed };
          merged.creativity = clamp(Number(merged.creativity) || DEFAULT_SETTINGS.creativity, 0.1, 0.8);
          return merged;
        }
      }
      const legacy = localStorage.getItem('mhdBot.settings.v1');
      if (legacy) {
        localStorage.removeItem('mhdBot.settings.v1');
      }
      return { ...DEFAULT_SETTINGS };
    } catch (error) {
      console.error('Impossible de charger les préférences :', error);
      return { ...DEFAULT_SETTINGS };
    }
  }

  persistConversations() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.conversations));
  }

  persistSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.state.settings));
  }

  createConversation() {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : FALLBACK_UUID();
    const now = new Date().toISOString();
    return {
      id,
      title: 'Nouvelle discussion',
      createdAt: now,
      updatedAt: now,
      messages: [],
      context: {}
    };
  }

  startNewConversation() {
    const conversation = this.createConversation();
    this.state.conversations.unshift(conversation);
    this.state.currentConversationId = conversation.id;
    this.persistConversations();
    this.renderConversations();
    this.renderMessages();
    this.renderSuggestions();
    this.input?.focus();
  }

  setCurrentConversation(conversationId) {
    if (this.state.currentConversationId === conversationId) return;
    this.state.currentConversationId = conversationId;
    this.renderConversations();
    this.renderMessages();
    this.renderSuggestions();
  }

  removeConversation(conversationId) {
    const index = this.state.conversations.findIndex((conversation) => conversation.id === conversationId);
    if (index === -1) return;
    this.state.conversations.splice(index, 1);

    if (!this.state.conversations.length) {
      const conversation = this.createConversation();
      this.state.conversations.push(conversation);
      this.state.currentConversationId = conversation.id;
    } else if (this.state.currentConversationId === conversationId) {
      this.state.currentConversationId = this.state.conversations[0].id;
    }

    this.persistConversations();
    this.renderConversations();
    this.renderMessages();
    this.renderSuggestions();
  }

  getCurrentConversation() {
    return this.state.conversations.find(({ id }) => id === this.state.currentConversationId) || null;
  }

  renderConversations() {
    if (!this.conversationList) return;
    const items = this.state.conversations.map((conversation) => {
      const date = new Date(conversation.updatedAt || conversation.createdAt);
      const meta = date.toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      });
      const isActive = conversation.id === this.state.currentConversationId;
      return `
        <div class="mhd-bot-conversation${isActive ? ' active' : ''}" data-conversation-id="${conversation.id}" role="button" tabindex="0">
          <div class="mhd-bot-conversation-body" data-action="select-conversation">
            <span class="mhd-bot-conversation-title">${this.escapeHTML(conversation.title || 'Nouvelle discussion')}</span>
            <span class="mhd-bot-conversation-meta">${meta}</span>
          </div>
          <button type="button" class="mhd-bot-conversation-remove" title="Supprimer la discussion"
            data-action="delete-conversation" aria-label="Supprimer la discussion">×</button>
        </div>
      `;
    });
    this.conversationList.innerHTML = items.join('');
  }

  renderMessages() {
    if (!this.messagesContainer) return;
    const conversation = this.getCurrentConversation();
    if (!conversation) return;

    if (this.title) {
      this.title.textContent = conversation.title || 'mhd bot';
    }

    if (!conversation.messages.length) {
      this.messagesContainer.innerHTML = `
        <div class="mhd-bot-empty-state">
          <strong>Bienvenue sur mhd bot</strong>
          <p>Ton analyste paris sportifs te propose des idées de questions pour démarrer ou tu peux en poser une directement.</p>
        </div>
      `;
      return;
    }

    const fragments = conversation.messages.map((message) => {
      const roleClass = message.role === 'assistant' ? 'assistant' : 'user';
      const avatar = message.role === 'assistant' ? 'MB' : 'TU';
      const formattedContent = this.escapeHTML(message.content).replace(/
/g, '<br>');
      return `
        <div class="mhd-bot-message ${roleClass}">
          <span class="mhd-bot-message-avatar">${avatar}</span>
          <div class="mhd-bot-message-content">${formattedContent}</div>
        </div>
      `;
    });

    this.messagesContainer.innerHTML = fragments.join('');
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  renderSuggestions() {
    if (!this.suggestionsContainer) return;
    const conversation = this.getCurrentConversation();
    if (!conversation || conversation.messages.length) {
      this.suggestionsContainer.classList.remove('active');
      this.suggestionsContainer.innerHTML = '';
      return;
    }

    const buttons = SUGGESTIONS.map(({ label, prompt }) => `
      <button type="button" data-suggestion="${this.escapeAttribute(prompt)}">${this.escapeHTML(label)}</button>
    `);
    this.suggestionsContainer.innerHTML = buttons.join('');
    this.suggestionsContainer.classList.add('active');
  }

  fillSettingsForm() {
    if (!this.settingsForm) return;
    const personaField = this.settingsForm.querySelector('[name="apiKey"]');
    const toneField = this.settingsForm.querySelector('[name="endpoint"]');
    const focusField = this.settingsForm.querySelector('[name="model"]');
    const creativityField = this.settingsForm.querySelector('[name="temperature"]');

    if (personaField) {
      personaField.type = 'text';
      personaField.required = false;
      personaField.value = this.state.settings.persona || DEFAULT_SETTINGS.persona;
      personaField.placeholder = 'Ex : Expert prudent, analyste offensif…';
    }
    if (toneField) {
      toneField.type = 'text';
      toneField.required = false;
      toneField.value = this.state.settings.tone || DEFAULT_SETTINGS.tone;
      toneField.placeholder = 'Tonalité préférée (analyse-structurée, conversationnelle…)';
    }
    if (focusField) {
      focusField.required = false;
      focusField.value = this.state.settings.focus || DEFAULT_SETTINGS.focus;
      focusField.placeholder = 'Focus sportif (ex : football-europeen)';
    }
    if (creativityField) {
      creativityField.required = false;
      creativityField.min = 0.1;
      creativityField.max = 0.8;
      creativityField.step = 0.05;
      const value = typeof this.state.settings.creativity === 'number'
        ? this.state.settings.creativity
        : DEFAULT_SETTINGS.creativity;
      creativityField.value = value.toFixed(2);
    }
    const helper = this.settingsForm.querySelector('small');
    if (helper) {
      helper.textContent = 'Mode hors-ligne : ces paramètres personnalisent le ton et la créativité de MHD Bot.';
    }
  }

  handleSettingsSubmit(formData) {
    const persona = (formData.get('apiKey') || '').toString().trim() || DEFAULT_SETTINGS.persona;
    const tone = (formData.get('endpoint') || '').toString().trim() || DEFAULT_SETTINGS.tone;
    const focus = (formData.get('model') || '').toString().trim() || DEFAULT_SETTINGS.focus;
    const creativityRaw = Number(formData.get('temperature'));
    const creativity = Number.isFinite(creativityRaw) ? clamp(creativityRaw, 0.1, 0.8) : DEFAULT_SETTINGS.creativity;

    this.state.settings = { persona, tone, focus, creativity };
    this.persistSettings();
    this.showToast('Préférences hors-ligne mises à jour.');
    this.settingsPanel?.classList.remove('active');
    this.settingsPanel?.setAttribute('hidden', '');
  }

  handleSubmit() {
    if (this.state.busy) return;
    const text = this.input.value.trim();
    if (!text) return;

    const conversation = this.getCurrentConversation();
    if (!conversation) return;

    const now = new Date().toISOString();
    conversation.messages.push({ role: 'user', content: text, createdAt: now });
    if (conversation.title === 'Nouvelle discussion') {
      conversation.title = this.generateTitle(text);
    }
    conversation.updatedAt = now;
    this.persistConversations();
    this.renderConversations();
    this.renderMessages();
    this.renderSuggestions();

    this.input.value = '';
    this.input?.focus();

    this.generateAssistantReply(conversation);
  }

  async generateAssistantReply(conversation) {
    this.setBusy(true);
    this.showTyping(true);

    try {
      const { content, contextUpdates } = await this.buildOfflineResponse(conversation);
      const now = new Date().toISOString();
      conversation.messages.push({ role: 'assistant', content, createdAt: now });
      conversation.updatedAt = now;
      conversation.context = { ...(conversation.context || {}), ...contextUpdates };
      this.reorderConversation(conversation.id);
      this.persistConversations();
      this.renderConversations();
      this.renderMessages();
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse :', error);
      this.showToast(`Je rencontre un souci : ${error.message || 'réessaie dans un instant.'}`);
    } finally {
      this.setBusy(false);
      this.showTyping(false);
    }
  }

  reorderConversation(conversationId) {
    const index = this.state.conversations.findIndex(({ id }) => id === conversationId);
    if (index <= 0) return;
    const [conversation] = this.state.conversations.splice(index, 1);
    this.state.conversations.unshift(conversation);
  }

  buildOfflineResponse(conversation) {
    return new Promise((resolve, reject) => {
      try {
        const analysis = this.composeOfflineAnalysis(conversation);
        const delay = 450 + Math.random() * 850;
        setTimeout(() => resolve(analysis), delay);
      } catch (error) {
        reject(error);
      }
    });
  }

  composeOfflineAnalysis(conversation) {
    const history = conversation.messages.slice();
    const userMessages = history.filter((message) => message.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];
    const question = lastUserMessage?.content?.trim();
    const previousContext = conversation.context || {};

    if (!question) {
      return {
        content: 'Peux-tu préciser ta question sur les paris sportifs ? Je suis prêt à t’aider.',
        contextUpdates: previousContext
      };
    }

    const intents = detectIntents(question);
    const match = extractMatch(question, previousContext.lastMatch);
    const matchInsights = match ? this.buildMatchInsights(match, intents, question, previousContext) : null;
    const amount = extractAmount(question);
    const creativity = typeof this.state.settings.creativity === 'number'
      ? this.state.settings.creativity
      : DEFAULT_SETTINGS.creativity;
    const tone = (this.state.settings.tone || DEFAULT_SETTINGS.tone).toLowerCase();
    const focus = this.state.settings.focus || DEFAULT_SETTINGS.focus;
    const persona = this.state.settings.persona || DEFAULT_SETTINGS.persona;
    const isFirstResponse = !conversation.messages.some((message) => message.role === 'assistant');

    const sections = [];
    if (isFirstResponse || intents.greeting || intents.presentation) {
      const introFocus = focus.replace(/[-_]/g, ' ');
      sections.push(`Bonjour, je suis MHD Bot, ton analyste ${introFocus}. Je suis ${persona.toLowerCase()} et je personnalise mes analyses selon tes besoins.`);
    }

    if (matchInsights) {
      const header = `Analyse du match ${matchInsights.label}${matchInsights.timeReference ? ` (${matchInsights.timeReference})` : ''}`;
      sections.push(`${header} :
${matchInsights.context}`);
      const factors = formatBulletList(matchInsights.factors);
      if (factors) {
        sections.push(`Points clés :
${factors}`);
      }
      const betIdeas = formatBulletList(matchInsights.betIdeas);
      if (betIdeas) {
        sections.push(`Pronostic travaillé :
${betIdeas}`);
      }
      sections.push(`Probabilités estimées : victoire domicile ${matchInsights.probabilities.homeWin} %, nul ${matchInsights.probabilities.draw} %, victoire extérieur ${matchInsights.probabilities.awayWin} %.`);
      sections.push(`Évaluation du risque : ${matchInsights.riskLevel}.`);
      if (intents.scoreExact) {
        sections.push(matchInsights.scoreSuggestion);
      }
    } else if (intents.pronostic) {
      sections.push('Pour que je puisse t’aider, indique-moi les équipes ou la compétition du match que tu veux analyser.');
    }

    if (intents.bankroll || amount) {
      sections.push(`Gestion de bankroll :
${buildBankrollAdvice(amount, intents)}
${GLOBAL_TRENDS.bankroll[1]}`);
    }

    if (intents.combo) {
      const comboAdvice = formatBulletList(createComboAdvice(question, creativity));
      if (comboAdvice) {
        sections.push(`Idées de combiné :
${comboAdvice}`);
      }
    }

    if (intents.strategy || (!matchInsights && !intents.bankroll)) {
      const disciplineTips = GLOBAL_TRENDS.discipline.slice(0, 3 + (creativity > 0.45 ? 1 : 0));
      sections.push(`Astuce stratégique :
${formatBulletList(disciplineTips)}`);
    }

    const followUps = buildFollowUpQuestions(intents, matchInsights);
    const followUpsFormatted = formatBulletList(followUps);
    if (followUpsFormatted) {
      const closingTone = tone.includes('conversation') ? 'On reste connectés' : 'Prochaines étapes';
      sections.push(`${closingTone} :
${followUpsFormatted}`);
    }

    sections.push('Souviens-toi : aucune mise n’est garantie, protège ta bankroll et joue de façon responsable.');

    return {
      content: sections.filter(Boolean).join('

'),
      contextUpdates: {
        lastMatch: matchInsights ? matchInsights.matchSummary : (previousContext.lastMatch || null),
        timeReference: matchInsights?.timeReference || previousContext.timeReference || null,
        lastIntent: intents
      }
    };
  }

  buildMatchInsights(match, intents, question, previousContext) {
    const homeProfile = getTeamProfile(match.home);
    const awayProfile = getTeamProfile(match.away);
    const homePoints = computeFormPoints(homeProfile.lastFive);
    const awayPoints = computeFormPoints(awayProfile.lastFive);
    const ratingDiff = homeProfile.rating - awayProfile.rating;
    const attackDiff = homeProfile.attack - awayProfile.defense;
    const awayAttackDiff = awayProfile.attack - homeProfile.defense;

    let homeBase = 0.38 + ratingDiff * 0.003 + (homePoints - awayPoints) * 0.012 + attackDiff * 0.002;
    let awayBase = 0.30 - ratingDiff * 0.003 + (awayPoints - homePoints) * 0.012 + awayAttackDiff * 0.002;
    let drawBase = 1 - (homeBase + awayBase);

    const adjustments = [homeBase, awayBase, drawBase].map((value, index) => {
      const min = index === 2 ? 0.16 : index === 0 ? 0.18 : 0.15;
      const max = index === 2 ? 0.35 : 0.72;
      return clamp(value, min, max);
    });
    const total = adjustments.reduce((sum, value) => sum + value, 0);
    const probabilitiesArray = adjustments.map((value) => Math.round((value / total) * 100));
    const correction = 100 - probabilitiesArray.reduce((sum, value) => sum + value, 0);
    probabilitiesArray[0] += correction;
    const probabilities = {
      homeWin: probabilitiesArray[0],
      awayWin: probabilitiesArray[1],
      draw: probabilitiesArray[2]
    };

    const highest = Math.max(probabilities.homeWin, probabilities.awayWin, probabilities.draw);
    let riskLevel = 'Modéré, avantage léger au favori.';
    if (highest >= 60) {
      riskLevel = 'Tendance marquée : opportunité intéressante mais garde une mise maîtrisée.';
    } else if (highest <= 45) {
      riskLevel = 'Match très équilibré, variance élevée.';
    }

    const scenarioBase = probabilities.homeWin >= probabilities.awayWin
      ? `${homeProfile.displayName} part avec un léger avantage (${probabilities.homeWin} % contre ${probabilities.awayWin} %).`
      : `${awayProfile.displayName} semble mieux armé (${probabilities.awayWin} % contre ${probabilities.homeWin} %).`;
    const drawFocus = probabilities.draw >= 30
      ? 'Attention : le nul est crédible, value intéressante à surveiller.'
      : 'Le nul reste possible mais légèrement moins probable.';

    const injuriesInfo = deduplicate([
      homeProfile.injuries?.[0],
      awayProfile.injuries?.[0]
    ]).filter(Boolean).join(' ; ');

    const factors = deduplicate([
      `${homeProfile.displayName} : forme ${formatForm(homeProfile.lastFive)} (${homePoints}/15) • Atout : ${homeProfile.strengths[0].toLowerCase()}.`,
      `${awayProfile.displayName} : forme ${formatForm(awayProfile.lastFive)} (${awayPoints}/15) • Atout : ${awayProfile.strengths[0].toLowerCase()}.`,
      `Match-up tactique : ${homeProfile.tempo} vs ${awayProfile.tempo}.`,
      `Joueurs clés : ${homeProfile.keyPlayers[0]} côté ${homeProfile.displayName}, ${awayProfile.keyPlayers[0]} côté ${awayProfile.displayName}.`,
      injuriesInfo ? `Blessures/gestion : ${injuriesInfo}.` : null
    ]);

    const betIdeas = deduplicate([
      `${probabilities.homeWin >= probabilities.awayWin ? `${homeProfile.displayName} ou match nul` : `${awayProfile.displayName} ou match nul`} (double chance) pour sécuriser le ticket.`,
      `${probabilities.homeWin + probabilities.awayWin >= 115 ? 'Plus de 2,5 buts' : 'Plus de 1,5 buts'} à envisager compte tenu des profils offensifs.`,
      probabilities.draw >= 30 ? 'Pari “Les deux équipes marquent” à considérer si le rythme est ouvert.' : null,
      intents.risk ? 'Option prudente : miser 0,5 unité en pré-match et compléter si le scénario attendu se confirme en live.' : null,
      this.state.settings.creativity > 0.55
        ? (probabilities.homeWin > probabilities.awayWin
          ? `${homeProfile.displayName} gagne par exactement 1 but (value bet).`
          : `${awayProfile.displayName} avec handicap +1 pour couvrir un nul serré.`)
        : null
    ]);

    const contextLine = `${scenarioBase} ${drawFocus}`;
    const timeReference = detectTimeReference(question) || previousContext.timeReference || null;

    return {
      label: match.display,
      homeProfile,
      awayProfile,
      context: `${contextLine}
${homeProfile.coachNote} | ${awayProfile.coachNote}`,
      factors,
      betIdeas,
      probabilities,
      riskLevel,
      scoreSuggestion: computeScoreSuggestion(probabilities),
      timeReference,
      matchSummary: {
        home: homeProfile.displayName,
        away: awayProfile.displayName,
        display: match.display
      }
    };
  }

  showTyping(visible) {
    if (!this.typingIndicator) return;
    if (visible) {
      this.typingIndicator.removeAttribute('hidden');
    } else {
      this.typingIndicator.setAttribute('hidden', '');
    }
  }

  setBusy(isBusy) {
    this.state.busy = isBusy;
    if (this.sendButton) {
      this.sendButton.disabled = isBusy;
      this.sendButton.textContent = isBusy ? 'En cours…' : 'Envoyer';
    }
  }

  open() {
    this.window?.classList.add('active');
    this.window?.removeAttribute('hidden');
    this.overlay?.classList.add('active');
    this.overlay?.removeAttribute('hidden');
    this.root.style.pointerEvents = 'auto';
    setTimeout(() => this.input?.focus(), 120);
  }

  close() {
    this.window?.classList.remove('active');
    this.window?.setAttribute('hidden', '');
    this.overlay?.classList.remove('active');
    this.overlay?.setAttribute('hidden', '');
    this.root.style.pointerEvents = 'none';
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add('visible');
    setTimeout(() => {
      this.toast?.classList.remove('visible');
    }, 4000);
  }

  generateTitle(text) {
    const sanitized = text.replace(/\s+/g, ' ').trim();
    if (sanitized.length <= 40) return sanitized;
    return `${sanitized.slice(0, 40)}…`;
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  escapeAttribute(str) {
    return this.escapeHTML(str).replace(/"/g, '&quot;');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-mhdbot]');
  if (!root) return;
  new MhdBotAssistant(root);
});
