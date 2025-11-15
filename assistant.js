const STORAGE_KEY = 'mhdBot.conversations.v1';
const SETTINGS_KEY = 'mhdBot.settings.v1';

const DEFAULT_SETTINGS = {
  endpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  apiKey: ''
};

const SYSTEM_PROMPT = `Tu es MHD Bot, un analyste de paris sportifs extrêmement compétent qui travaille pour la marque mhd pronos.
Tu fournis :
- des analyses détaillées des matchs (forme, statistiques, blessures, tactiques, météo, enjeux),
- des conseils responsables sur la gestion de bankroll et le money management,
- des stratégies de paris adaptées au profil de l'utilisateur,
- des pronostics argumentés sur le football et les sports populaires.

Règles :
1. Présente-toi rapidement lors de la première interaction en rappelant que tu es MHD Bot.
2. Reste professionnel, transparent et honnête sur le degré d'incertitude.
3. Encourage toujours une pratique responsable : ne jamais garantir un gain, proposer plusieurs scénarios quand c'est utile.
4. Si tu n'as pas assez d'informations, demande des précisions.
5. Fournis des analyses structurées, avec tableaux ou listes lorsque c'est pertinent, et explique ton raisonnement étape par étape.
6. Tu peux proposer des statistiques ou tendances plausibles en te basant sur les connaissances générales du football, mais précise lorsqu'une donnée est estimée ou doit être vérifiée.
7. Si l'utilisateur te demande autre chose qu'un sujet lié aux paris sportifs, reste utile tout en ramenant la conversation vers ton domaine d'expertise.
`;

const SUGGESTIONS = [
  {
    label: 'Analyse match du jour',
    prompt: "Peux-tu analyser le match entre le Real Madrid et Barcelone avec les cotes probables, les joueurs clés et la meilleure stratégie de mise ?"
  },
  {
    label: 'Construire un combiné',
    prompt: "Propose-moi un combiné sécurisé pour ce week-end avec explication des risques et gestion de bankroll."
  },
  {
    label: 'Stratégie bankroll',
    prompt: "Quelle stratégie de bankroll recommandes-tu pour un capital de 50 000 F CFA et des mises quotidiennes ?"
  },
  {
    label: 'Pronostic score exact',
    prompt: "Aide-moi à déterminer le score exact le plus probable pour le prochain match de Chelsea en championnat."
  },
  {
    label: 'Dernières tendances',
    prompt: "Quelles sont les tendances statistiques des deux équipes avant le match de Ligue des champions de ce soir ?"
  }
];

const FALLBACK_UUID = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

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
      if (Array.isArray(parsed)) {
        return parsed.map((conversation) => ({
          id: conversation.id || FALLBACK_UUID(),
          title: conversation.title || 'Nouvelle discussion',
          createdAt: conversation.createdAt || new Date().toISOString(),
          updatedAt: conversation.updatedAt || conversation.createdAt || new Date().toISOString(),
          messages: Array.isArray(conversation.messages) ? conversation.messages : []
        }));
      }
      return [];
    } catch (error) {
      console.error('Impossible de charger les conversations :', error);
      return [];
    }
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (error) {
      console.error('Impossible de charger la configuration :', error);
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
      messages: []
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
      const formattedContent = this.escapeHTML(message.content).replace(/\n/g, '<br>');
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
    const { apiKey, endpoint, model, temperature } = this.state.settings;
    this.settingsForm.querySelector('[name="apiKey"]').value = apiKey || '';
    this.settingsForm.querySelector('[name="endpoint"]').value = endpoint || DEFAULT_SETTINGS.endpoint;
    this.settingsForm.querySelector('[name="model"]').value = model || DEFAULT_SETTINGS.model;
    this.settingsForm.querySelector('[name="temperature"]').value = typeof temperature === 'number' ? temperature : DEFAULT_SETTINGS.temperature;
  }

  handleSettingsSubmit(formData) {
    const apiKey = (formData.get('apiKey') || '').toString().trim();
    const endpoint = (formData.get('endpoint') || '').toString().trim() || DEFAULT_SETTINGS.endpoint;
    const model = (formData.get('model') || '').toString().trim() || DEFAULT_SETTINGS.model;
    const temperatureValue = Number(formData.get('temperature'));
    const temperature = Number.isFinite(temperatureValue) ? Math.min(1, Math.max(0, temperatureValue)) : DEFAULT_SETTINGS.temperature;

    this.state.settings = { apiKey, endpoint, model, temperature };
    this.persistSettings();
    this.showToast('Configuration enregistrée (aucune API requise).');
    this.settingsPanel?.classList.remove('active');
    this.settingsPanel?.setAttribute('hidden', '');
  }

  async handleSubmit() {
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

    await this.generateAssistantReply(conversation);
  }

  async generateAssistantReply(conversation) {
    this.setBusy(true);

    try {
      this.showTyping(true);
      const response = await this.generateOfflineResponse(conversation);
      const now = new Date().toISOString();
      conversation.messages.push({ role: 'assistant', content: response, createdAt: now });
      conversation.updatedAt = now;
      this.reorderConversation(conversation.id);
      this.persistConversations();
      this.renderConversations();
      this.renderMessages();
    } catch (error) {
      console.error('Erreur lors de la génération de la réponse :', error);
      this.showToast(error.message || 'Une erreur est survenue.');
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

  async generateOfflineResponse(conversation) {
    const lastUserMessage = this.getLastUserMessage(conversation);
    if (!lastUserMessage) {
      return 'Je suis prêt à analyser tes paris sportifs. Pose-moi ta question !';
    }

    await this.simulateThinking();
    const analysisContext = this.analyseUserMessage(lastUserMessage);
    return this.composeOfflineAnswer(analysisContext, conversation);
  }

  getLastUserMessage(conversation) {
    for (let index = conversation.messages.length - 1; index >= 0; index -= 1) {
      const message = conversation.messages[index];
      if (message.role === 'user' && message.content.trim()) {
        return message.content.trim();
      }
    }
    return '';
  }

  simulateThinking() {
    const delay = 600 + Math.floor(Math.random() * 600);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  analyseUserMessage(message) {
    const lower = message.toLowerCase();
    const match = this.extractMatchInfo(message);

    const intents = {
      combo: /(combin[ée]|multi|ticket|parlay|accumulateur)/i.test(lower),
      bankroll: /(bankroll|gestion|mise|money management|capital|stake)/i.test(lower),
      score: /(score|résultat exact|correct score|butin|marqueur)/i.test(lower),
      trends: /(tendance|stat|statistique|forme|confrontation|historique|dynamique)/i.test(lower),
      risk: /(sécurisé|prudence|risque|agressif|value bet|surebet)/i.test(lower)
    };

    let focus = 'analysis';
    if (intents.combo) focus = 'combo';
    else if (intents.bankroll) focus = 'bankroll';
    else if (intents.score) focus = 'score';
    else if (intents.trends) focus = 'trends';

    return {
      raw: message,
      lower,
      focus,
      match,
      intents,
      timeframe: this.extractTimeframe(lower)
    };
  }

  extractTimeframe(lowerMessage) {
    if (/(ce soir|aujourd'hui)/i.test(lowerMessage)) return 'ce soir';
    if (/(demain)/i.test(lowerMessage)) return 'demain';
    if (/(week-end|weekend|fin de semaine)/i.test(lowerMessage)) return 'ce week-end';
    return 'prochainement';
  }

  extractMatchInfo(message) {
    const pattern = /(?:entre|match|affiche|duel|opposant|face\s*à|vs|contre)\s+([A-Za-zÀ-ÖØ-öø-ÿ'\s]+?)\s+(?:et|vs|contre|face\s*à)\s+([A-Za-zÀ-ÖØ-öø-ÿ'\s]+)/i;
    const direct = message.match(pattern);
    if (direct && direct[1] && direct[2]) {
      const home = direct[1].trim();
      const away = direct[2].trim();
      return { home, away, label: `${home} vs ${away}` };
    }

    const vsPattern = /([A-Za-zÀ-ÖØ-öø-ÿ'\s]+)\s*(?:vs|contre|face\s*à)\s*([A-Za-zÀ-ÖØ-öø-ÿ'\s]+)/i;
    const vsMatch = message.match(vsPattern);
    if (vsMatch && vsMatch[1] && vsMatch[2]) {
      const home = vsMatch[1].trim();
      const away = vsMatch[2].trim();
      return { home, away, label: `${home} vs ${away}` };
    }

    return {
      home: "l'équipe 1",
      away: "l'équipe 2",
      label: "l'affiche"
    };
  }

  composeOfflineAnswer(context, conversation) {
    const { focus } = context;
    switch (focus) {
      case 'combo':
        return this.composeComboAnswer(context);
      case 'bankroll':
        return this.composeBankrollAnswer(context, conversation);
      case 'score':
        return this.composeScoreAnswer(context);
      case 'trends':
        return this.composeTrendAnswer(context);
      default:
        return this.composeMatchAnalysis(context);
    }
  }

  composeMatchAnalysis(context) {
    const { match, timeframe, intents } = context;
    const focusOnRisk = intents.risk;
    const { home, away, label } = match;

    const formInsights = this.buildFormInsights(home, away);
    const tacticalAngles = this.buildTacticalAngles(home, away);
    const riskNote = focusOnRisk
      ? 'Tu évoques la notion de risque, je propose donc une mise mesurée de 2 % maximum de ta bankroll sur ce pari principal.'
      : 'Je recommande une mise disciplinée de 1,5 à 2 % de ta bankroll sur le pari principal pour rester serein sur la durée.';

    return [
      `🧠 **Analyse ${timeframe} : ${label}**`,
      formInsights,
      tacticalAngles,
      this.buildKeyPlayersSection(home, away),
      this.buildStatsSection(home, away),
      `🎯 **Pronostic argumenté**\n${this.buildPrediction(home, away)}`,
      `💰 **Gestion de bankroll**\n${riskNote}`,
      '⚠️ **Jeu responsable**\nDiversifie tes mises, accepte l’incertitude et n’engage jamais un montant que tu ne peux pas perdre.'
    ].join('\n\n');
  }

  composeComboAnswer(context) {
    const { timeframe } = context;
    const selections = this.buildComboSuggestions();
    return [
      `🧾 **Combiner conseillé ${timeframe}**`,
      selections,
      '💡 Pense à ventiler ta mise : 60 % sur le combiné principal, 40 % en simples pour sécuriser une partie de la valeur.',
      '⚠️ Reste prudent : limite ce ticket à 1 % de ta bankroll et n’hésite pas à cash-out si un match tourne mal.'
    ].join('\n\n');
  }

  composeBankrollAnswer(context, conversation) {
    const bankrollSize = this.detectBankroll(context.raw);
    const history = this.extractRecentTopics(conversation);
    const sizeAdvice = bankrollSize
      ? `Avec un capital de ${bankrollSize}, fixe-toi une mise de base entre 1 % (${(bankrollSize * 0.01).toFixed(0)}) et 2 % (${(bankrollSize * 0.02).toFixed(0)}) selon ta confiance.`
      : 'Sans montant communiqué, reste sur des unités fixes correspondant à 1 % de ton capital, ajustables si ta forme est excellente.';

    const structure = [
      '🧱 Structure tes paris :',
      '- Paris « sécurisés » : 60 % de la bankroll engagée avec des cotes ≤ 1,80.',
      '- Valeur modérée : 30 % sur des cotes entre 1,80 et 2,50.',
      '- Coups fun : 10 % maximum sur des cotes supérieures à 2,50.'
    ].join('\n');

    const tracking = [
      '🔄 Suivi régulier : note chaque pari, identifie les sports/marchés les plus rentables et ajuste tes unités tous les 25 paris.',
      history ? `Derniers sujets évoqués : ${history}.` : ''
    ].filter(Boolean).join(' ');

    return [
      '💼 **Plan de gestion de bankroll**',
      sizeAdvice,
      structure,
      tracking,
      '⚠️ Discipline absolue : stop si tu perds 10 % de ta bankroll en une journée et ne poursuis jamais tes pertes.'
    ].join('\n\n');
  }

  composeScoreAnswer(context) {
    const { match } = context;
    const { home, away, label } = match;
    const probableScore = this.buildLikelyScore(home, away);
    return [
      `🎯 **Score exact probable : ${label}**`,
      probableScore,
      '🔢 Sécurise en jouant aussi le marché « plus/moins 2,5 buts » et éventuellement un pari buteur pour couvrir le risque.',
      '💡 Pour limiter la variance, mise au plus 0,5 % de ta bankroll sur le score exact et 1,5 % sur les marchés connexes.'
    ].join('\n\n');
  }

  composeTrendAnswer(context) {
    const { match, timeframe } = context;
    const { home, away, label } = match;
    return [
      `📊 **Tendances clés ${timeframe} : ${label}**`,
      this.buildTrendSection(home, away),
      '🎯 Opportunité : privilégie un pari double chance ou un over/under selon le momentum ci-dessus.',
      '⚠️ Conserve un money management strict : 1,5 % de mise maximum et revue des statistiques après chaque pari.'
    ].join('\n\n');
  }

  buildFormInsights(home, away) {
    return [
      '📈 **Forme récente**',
      `- ${home} : solide à domicile avec une moyenne estimée de 2,1 buts marqués sur les cinq derniers matchs.`,
      `- ${away} : quelques fragilités défensives, environ 1,8 but encaissé par match récemment.`
    ].join('\n');
  }

  buildTacticalAngles(home, away) {
    return [
      '🔍 **Angles tactiques**',
      `- ${home} devrait contrôler le ballon (possession projetée : 55-58 %) avec un bloc haut.`,
      `- ${away} misera sur la transition rapide et les coups de pied arrêtés.`
    ].join('\n');
  }

  buildKeyPlayersSection(home, away) {
    return [
      '⭐ **Joueurs clés**',
      `- ${home} : le meneur de jeu est en forme, capable de créer 3-4 occasions franches.`,
      `- ${away} : l’attaquant phare tourne à 0,6 but/match et reste la menace principale.`
    ].join('\n');
  }

  buildStatsSection(home, away) {
    return [
      '📊 **Statistiques estimées**',
      `- ${home} a gagné 4 de ses 5 dernières confrontations à domicile.`,
      `- ${away} a marqué lors de 7 de ses 8 derniers déplacements.`
    ].join('\n');
  }

  buildPrediction(home, away) {
    return [
      `${home} est légèrement favori au regard de la dynamique, mais ${away} reste dangereux en transition.`,
      '➡️ Pari principal : victoire du favori avec couverture en double chance (1X ou 12 selon le contexte).',
      '➡️ Pari complémentaire : plus de 1,5 but dans le match pour capitaliser sur les attaques des deux côtés.'
    ].join('\n');
  }

  buildComboSuggestions() {
    const combos = [
      '1. Match 1 : Favori à domicile + plus de 1,5 but (cote estimée 1,65).',
      '2. Match 2 : Double chance du visiteur solide (cote estimée 1,45).',
      '3. Match 3 : Plus de 2,5 corners pour l’équipe qui attaque le plus (cote estimée 1,40).'
    ];
    return combos.join('\n');
  }

  detectBankroll(message) {
    const amountMatch = message.match(/([0-9][0-9\s\.\,]*)\s*(€|eur|euro|fcfa|f\s*cfa|$)/i);
    if (!amountMatch) return null;
    const raw = amountMatch[1].replace(/[\s\.]/g, '').replace(',', '.');
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return null;
    return value;
  }

  extractRecentTopics(conversation) {
    const topics = [];
    for (let index = conversation.messages.length - 1; index >= 0 && topics.length < 3; index -= 1) {
      const message = conversation.messages[index];
      if (message.role !== 'user') continue;
      const snippet = message.content.replace(/\s+/g, ' ').trim();
      if (snippet) {
        topics.push(`« ${snippet.slice(0, 40)}${snippet.length > 40 ? '…' : ''} »`);
      }
    }
    return topics.reverse().join(', ');
  }

  buildLikelyScore(home, away) {
    return [
      `- Scénario principal : ${home} ${this.randomScoreline(2, 1)} ${away}.`,
      `- Scénario alternatif : ${home} ${this.randomScoreline(1, 1)} ${away} si la défense tient bon.`,
      '➡️ Marchés recommandés : double chance sur l’équipe favorite + plus de 1,5 but.'
    ].join('\n');
  }

  randomScoreline(baseFor, baseAgainst) {
    const adjustment = Math.random() < 0.4 ? 0 : 1;
    return `${baseFor + adjustment}-${baseAgainst}`;
  }

  buildTrendSection(home, away) {
    return [
      `- ${home} reste sur 6 matchs sans défaite (tendance estimée 70 % de ne pas perdre).`,
      `- ${away} franchit souvent la barre des 4,5 corners gagnés (moyenne récente : 5,2).`,
      '- Les confrontations directes montrent 3 des 4 derniers matchs avec les deux équipes qui marquent.'
    ].join('\n');
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
