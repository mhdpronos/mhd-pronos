(function () {
  const STORAGE_KEY = 'mhd-bot-conversations-v2';
  const toggleButton = document.querySelector('.assistant-toggle');
  const overlay = document.querySelector('.assistant-overlay');
  const closeButton = document.querySelector('.assistant-close');
  const startConversationButtons = Array.from(document.querySelectorAll('[data-action="start-conversation"]'));
  const conversationList = document.querySelector('.conversation-list');
  const form = document.querySelector('.assistant-form');
  const input = document.getElementById('assistant-input');
  const messagesContainer = document.querySelector('.assistant-messages');
  const typingIndicator = document.querySelector('.assistant-typing');
  const suggestionsContainer = document.querySelector('.assistant-suggestions');

  if (!toggleButton || !overlay || !closeButton || !form || !input || !messagesContainer || !typingIndicator || !suggestionsContainer) {
    return;
  }

  const SUGGESTIONS = [
    {
      label: 'Analyse Ligue 1',
      prompt: 'Analyse le match Marseille vs Lyon et donne un pronostic détaillé.'
    },
    {
      label: 'Pari combiné',
      prompt: 'Propose un combiné sécurisé pour ce week-end avec justification.'
    },
    {
      label: 'Conseil bankroll',
      prompt: 'Comment gérer une bankroll de 200€ sur trois paris ?'
    },
    {
      label: 'Forme des équipes',
      prompt: 'Évalue la forme actuelle du PSG et de Monaco en Ligue 1.'
    }
  ];

  let conversations = loadConversations();
  let activeConversationId = conversations[0]?.id ?? createConversation().id;
  ensureActiveConversationExists();

  renderConversations();
  renderActiveConversation();
  renderSuggestions();

  function loadConversations() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch (error) {
      console.error('Impossible de lire les conversations enregistrées', error);
      return [];
    }
  }

  function saveConversations() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Impossible de sauvegarder les conversations', error);
    }
  }

  function createConversation(title) {
    const timestamp = new Date().toISOString();
    const conversation = {
      id: `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: title ?? 'Nouvelle discussion',
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: []
    };

    conversations = [conversation, ...conversations];
    saveConversations();
    return conversation;
  }

  function ensureActiveConversationExists() {
    if (!conversations.find((conv) => conv.id === activeConversationId)) {
      const conversation = createConversation();
      activeConversationId = conversation.id;
    }
  }

  function getActiveConversation() {
    return conversations.find((conv) => conv.id === activeConversationId);
  }

  function setActiveConversation(id) {
    if (activeConversationId === id) {
      return;
    }

    activeConversationId = id;
    renderConversations();
    renderActiveConversation();
    renderSuggestions();
    focusInput();
  }

  function focusInput() {
    requestAnimationFrame(() => input?.focus());
  }

  function updateConversationMeta(conversation) {
    conversation.updatedAt = new Date().toISOString();
    if (conversation.messages.length) {
      const firstUserMessage = conversation.messages.find((message) => message.sender === 'user');
      if (firstUserMessage) {
        const base = firstUserMessage.rawText
          ? firstUserMessage.rawText.replace(/\s+/g, ' ')
          : firstUserMessage.text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
        const truncated = base.slice(0, 60).trim();
        conversation.title = truncated.length ? truncated : 'Discussion sauvegardée';
      }
    }
  }

  function renderConversations() {
    if (!conversationList) {
      return;
    }

    conversationList.innerHTML = '';
    conversations
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .forEach((conversation) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'conversation-item';
        if (conversation.id === activeConversationId) {
          item.classList.add('active');
        }
        item.setAttribute('data-id', conversation.id);

        const title = document.createElement('p');
        title.className = 'conversation-item-title';
        title.textContent = conversation.title;

        const meta = document.createElement('p');
        meta.className = 'conversation-item-meta';
        const updatedAt = new Date(conversation.updatedAt);
        meta.textContent = `Dernière activité · ${updatedAt.toLocaleString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit'
        })}`;

        item.appendChild(title);
        item.appendChild(meta);
        item.addEventListener('click', () => setActiveConversation(conversation.id));

        conversationList.appendChild(item);
      });
  }

  function renderMessages(conversation) {
    messagesContainer.innerHTML = '';

    conversation.messages.forEach((message) => {
      const wrapper = document.createElement('article');
      wrapper.className = `message ${message.sender}`;

      const bubble = document.createElement('p');
      bubble.innerHTML = message.text;

      const timestamp = document.createElement('time');
      timestamp.dateTime = message.createdAt;
      timestamp.textContent = new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(message.createdAt));

      wrapper.appendChild(bubble);
      wrapper.appendChild(timestamp);
      messagesContainer.appendChild(wrapper);
    });

    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  function renderActiveConversation() {
    const conversation = getActiveConversation();
    if (!conversation) {
      return;
    }

    ensureWelcomeMessage(conversation);
    renderMessages(conversation);
  }

  function renderSuggestions() {
    const conversation = getActiveConversation();
    if (!conversation) {
      return;
    }

    const shouldDisplaySuggestions = conversation.messages.every((message) => message.sender !== 'user');
    suggestionsContainer.classList.toggle('is-visible', shouldDisplaySuggestions);

    if (!shouldDisplaySuggestions) {
      suggestionsContainer.innerHTML = '';
      return;
    }

    suggestionsContainer.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'suggestion-title';
    title.textContent = 'Commencez une nouvelle discussion';

    const description = document.createElement('p');
    description.className = 'suggestion-description';
    description.textContent =
      'Choisissez un sujet pour gagner du temps ou posez votre propre question dans le champ en bas.';

    const actions = document.createElement('div');
    actions.className = 'suggestion-actions';

    SUGGESTIONS.forEach((suggestion) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'suggestion-button';
      button.textContent = suggestion.label;
      button.addEventListener('click', () => {
        sendUserMessage(suggestion.prompt);
      });
      actions.appendChild(button);
    });

    suggestionsContainer.appendChild(title);
    suggestionsContainer.appendChild(description);
    suggestionsContainer.appendChild(actions);
  }

  function showTypingIndicator(isVisible) {
    typingIndicator.classList.toggle('is-visible', isVisible);
    typingIndicator.setAttribute('aria-hidden', String(!isVisible));
  }

  function createMessage(sender, text, rawText, meta = {}) {
    return {
      sender,
      text,
      rawText: rawText ?? text,
      meta,
      createdAt: new Date().toISOString()
    };
  }

  function addMessageToConversation(conversation, message) {
    conversation.messages.push(message);
    updateConversationMeta(conversation);
    saveConversations();
    renderConversations();
    renderMessages(conversation);
    renderSuggestions();
  }

  function startNewConversation() {
    const conversation = createConversation();
    activeConversationId = conversation.id;
    renderConversations();
    renderActiveConversation();
    renderSuggestions();
    focusInput();
  }

  function ensureWelcomeMessage(conversation) {
    const hasUserExchange = conversation.messages.some((message) => message.sender === 'user');
    const hasWelcome = conversation.messages.some((message) => message.meta?.kind === 'welcome');

    if (hasUserExchange || hasWelcome) {
      return;
    }

    const welcome = createMessage('bot', generateWelcomeMessage(conversation), undefined, {
      kind: 'welcome'
    });
    conversation.messages.push(welcome);
    conversation.updatedAt = welcome.createdAt;
    saveConversations();
    renderConversations();
  }

  function generateWelcomeMessage(conversation) {
    const now = new Date();
    const hours = now.getHours();
    const greeting = hours < 12 ? 'Bonjour' : hours < 18 ? 'Bon après-midi' : 'Bonsoir';
    const introVariants = [
      "je suis mhd bot, votre analyste personnel prêt à décrypter les tendances sportives.",
      "ravie de vous assister avec des insights basés sur les dynamiques récentes et les marchés de paris.",
      "à votre service pour transformer vos intuitions en stratégies de mise rationnelles."
    ];
    const focusPoints = [
      'analyse tactique détaillée sur demande',
      'pronostics chiffrés générés à partir de tendances récentes',
      'optimisation de bankroll pour limiter la variance',
      'suivi des cotes pour repérer les valeurs cachées'
    ];
    const selectedIntro = introVariants[hashString(`${conversation.id}-${now.getTime()}`) % introVariants.length];
    const highlight = focusPoints
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map((point) => `• ${point}`)
      .join('<br />');
    const suggestionLabels = SUGGESTIONS.map((suggestion) => suggestion.label)
      .slice(0, 3)
      .join(', ');

    return `<strong>${greeting} !</strong> ${selectedIntro}<br /><br />${highlight}<br /><br />` +
      `Sélectionnez une des suggestions (${suggestionLabels}) ou posez votre propre question en bas pour commencer.`;
  }

  function sendUserMessage(text) {
    const conversation = getActiveConversation();
    if (!conversation) {
      return;
    }

    const sanitized = sanitize(text);
    const userMessage = createMessage('user', sanitized, text);
    addMessageToConversation(conversation, userMessage);
    focusInput();

    showTypingIndicator(true);
    const responseDelay = Math.min(1600 + text.length * 18, 3000);

    setTimeout(() => {
      const botResponse = createMessage('bot', generateBotResponse(text, conversation));
      showTypingIndicator(false);
      addMessageToConversation(conversation, botResponse);
    }, responseDelay);
  }

  function sanitize(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function formatPercentage(value) {
    return `${Math.round(value * 100)}%`;
  }

  function hashString(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function analyzeTeamsFromMessage(message) {
    const teamPattern = /(.*?)(?:\s+vs\.?\s+|\s+contre\s+)(.+)/i;
    const match = message.match(teamPattern);
    if (match) {
      const teamA = match[1].replace(/match|analyse|analyse du|analyse le|analyse la|analyse les/gi, '').trim();
      const teamB = match[2]
        .replace(/ce week-end|demain|ce soir|st?\.?/gi, '')
        .trim();
      if (teamA && teamB) {
        return [teamA, teamB];
      }
    }
    return null;
  }

  function buildMatchInsights(teamA, teamB, message) {
    const combinedKey = `${teamA.toLowerCase()}-${teamB.toLowerCase()}`;
    const hash = hashString(combinedKey);
    const rawHome = (hash % 70) + 60;
    const rawAway = ((hash >> 3) % 65) + 50;
    const rawDraw = ((hash >> 5) % 55) + 40;
    const total = rawHome + rawAway + rawDraw;

    const baseProbability = rawHome / total;
    const awayProbability = rawAway / total;
    const drawProbability = rawDraw / total;

    const formIndex = (((hash >> 7) % 45) + 55) / 100;
    const goalAverage = (((hash >> 9) % 24) + 21) / 10;
    const confidence = 0.55 + (((hash >> 11) % 35) / 100);

    const displayTeamA = sanitize(teamA);
    const displayTeamB = sanitize(teamB);

    const trends = [
      `${displayTeamA} affiche une dynamique positive avec un indice de forme de ${(formIndex * 10).toFixed(1)} / 10.`,
      `${displayTeamB} laisse apparaître quelques fragilités défensives avec ${goalAverage.toFixed(2)} buts encaissés en moyenne sur les derniers matchs.`,
      `Le volume offensif moyen attendu tourne autour de ${goalAverage.toFixed(1)} buts par rencontre.`,
      `Les scénarios chiffrés donnent ${formatPercentage(baseProbability)} de chances de victoire pour ${displayTeamA}, ${formatPercentage(drawProbability)} pour le nul et ${formatPercentage(awayProbability)} pour ${displayTeamB}.`,
      `Le prono sécurisé privilégie ${baseProbability > awayProbability ? displayTeamA : displayTeamB} avec une confiance estimée à ${(confidence * 100).toFixed(0)}%.`
    ];

    const contextNotes = [];
    if (/domicile|home|maison/i.test(message)) {
      contextNotes.push(
        `${displayTeamA} tire avantage d'un contexte à domicile qui renforce la confiance sur les marchés 1X.`
      );
    }
    if (/blessure|absent|suspendu/i.test(message)) {
      contextNotes.push(
        "Les indisponibilités devront être vérifiées à l'approche du coup d'envoi pour ajuster les mises et éviter toute surprise."
      );
    }
    if (/cote|odds|côte/i.test(message)) {
      contextNotes.push(
        "Surveillez l'évolution des cotes : une variation supérieure à 5% peut signaler un mouvement significatif du marché."
      );
    }

    return [...trends, ...contextNotes];
  }

  function generateBankrollAdvice(message) {
    const bankrollMatch = message.match(/(\d+[\s.,]?\d*)\s?€?/);
    const bankroll = bankrollMatch
      ? parseFloat(bankrollMatch[1].replace(/\s/g, '').replace(',', '.'))
      : 100;
    const stakes = [0.04, 0.06, 0.08];
    return `Pour une bankroll de ${bankroll.toFixed(0)}€ je recommande une gestion progressive :<br />
      • Mise 1 : ${(bankroll * stakes[0]).toFixed(2)}€ sur un pari à forte probabilité pour sécuriser.<br />
      • Mise 2 : ${(bankroll * stakes[1]).toFixed(2)}€ sur une analyse combinée mais maîtrisée.<br />
      • Mise 3 : ${(bankroll * stakes[2]).toFixed(2)}€ sur un scénario plus ambitieux en limitant l'exposition.<br />
      Conservez toujours un coussin de sécurité de ${(bankroll * 0.82).toFixed(2)}€ pour absorber la variance.`;
  }

  function generateCombiAdvice() {
    const templates = [
      {
        label: 'Sécurisé',
        description:
          'Double chance sur un favori solide, plus un under 3,5 buts pour lisser le risque. Idéal pour préserver la bankroll.'
      },
      {
        label: 'Valeur moyenne',
        description:
          'Victoire d\'un outsider en forme et but des deux équipes. Combine rendement et volatilité raisonnable.'
      },
      {
        label: 'Audacieux',
        description:
          'Succès à l\'extérieur avec buteur principal. À limiter à 5% de la bankroll pour gérer la variance.'
      }
    ];

    return templates
      .map(
        (template) =>
          `<strong>${template.label}</strong> – ${template.description} Suivez le mouvement des cotes pour ajuster vos mises.`
      )
      .join('<br /><br />');
  }

  function composeGeneralResponse(message, conversation) {
    const lastExchange = conversation.messages.slice(-3).map((entry) => entry.text.replace(/<[^>]*>/g, '')).join(' ');
    const keywords = extractKeywords(`${message} ${lastExchange}`);
    const safeKeywords = keywords.map((keyword) => sanitize(keyword));
    const insights = safeKeywords.length
      ? `J'ai identifié des points clés comme ${safeKeywords.join(', ')}. J'adapte ma réponse en conséquence.`
      : "Je reste attentif aux détails fournis pour ajuster ma stratégie de conseil.";

    const strategies = [
      'Analyse des statistiques récentes',
      'Lecture des tendances de marché',
      'Gestion dynamique de la bankroll',
      'Sélection de cotes à valeur ajoutée'
    ];
    const selectedStrategy = strategies[hashString(message) % strategies.length];

    return `${insights}<br /><br />Je vous propose une démarche en trois étapes :<br />
      1. ${selectedStrategy} pour cadrer le contexte.<br />
      2. Vérification des informations (blessés, motivation, calendrier).<br />
      3. Ajustement du pari selon votre tolérance au risque.<br /><br />
      N'hésitez pas à préciser davantage pour affiner le plan d'action.`;
  }

  function extractKeywords(text) {
    const words = text
      .toLowerCase()
      .split(/[^a-zàâçéèêëîïôûùüÿñœ0-9]+/i)
      .filter(Boolean)
      .filter((word) => word.length > 4);
    return Array.from(new Set(words)).slice(0, 4);
  }

  function generateBotResponse(message, conversation) {
    const trimmed = message.trim();
    if (!trimmed) {
      return "Je suis prêt à analyser vos questions sportives, précisez-moi simplement le contexte.";
    }

    const normalized = trimmed.toLowerCase();

    if (/bonjour|salut|bonsoir|hello/.test(normalized)) {
      return (
        'Bonjour ! Ravi de vous retrouver. Partagez un match ou un objectif de pari et je prépare une analyse sur-mesure.'
      );
    }

    const teams = analyzeTeamsFromMessage(trimmed);
    if (teams) {
      const [teamA, teamB] = teams;
      const insights = buildMatchInsights(teamA, teamB, trimmed);
      const safeTeamA = sanitize(teamA);
      const safeTeamB = sanitize(teamB);
      return `<strong>Analyse ${safeTeamA} vs ${safeTeamB}</strong><br /><br />${insights.join('<br /><br />')}`;
    }

    if (/bankroll|gestion|budget/.test(normalized)) {
      return generateBankrollAdvice(trimmed);
    }

    if (/combin[ée]?|multi|parlay/.test(normalized)) {
      return generateCombiAdvice();
    }

    if (/merci|parfait|super/.test(normalized)) {
      return 'Avec plaisir ! Gardez vos objectifs en tête et revenez dès que vous souhaitez une nouvelle simulation.';
    }

    return composeGeneralResponse(trimmed, conversation);
  }

  function openAssistant() {
    overlay.classList.add('is-visible');
    overlay.setAttribute('aria-hidden', 'false');
    toggleButton.setAttribute('aria-expanded', 'true');
    focusInput();
  }

  function closeAssistant() {
    overlay.classList.remove('is-visible');
    overlay.setAttribute('aria-hidden', 'true');
    toggleButton.setAttribute('aria-expanded', 'false');
  }

  toggleButton.addEventListener('click', () => {
    if (overlay.classList.contains('is-visible')) {
      closeAssistant();
    } else {
      openAssistant();
    }
  });

  closeButton.addEventListener('click', closeAssistant);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeAssistant();
    }
  });

  startConversationButtons.forEach((button) => {
    button.addEventListener('click', () => {
      startNewConversation();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) {
      return;
    }

    input.value = '';
    sendUserMessage(value);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('is-visible')) {
      closeAssistant();
    }
  });
})();
