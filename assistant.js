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
    this.showToast('Configuration enregistrée.');
    this.settingsPanel?.classList.remove('active');
    this.settingsPanel?.setAttribute('hidden', '');
  }

  async handleSubmit() {
    if (this.state.busy) return;
    const text = this.input.value.trim();
    if (!text) return;

    if (!this.state.settings.apiKey) {
      this.showToast('Ajoute une clé API dans la configuration de mhd bot.');
      if (this.settingsPanel) {
        this.settingsPanel.classList.add('active');
        this.settingsPanel.removeAttribute('hidden');
      }
      return;
    }

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      this.showTyping(true);
      const response = await this.fetchAssistantResponse(conversation, controller.signal);
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
      clearTimeout(timeout);
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

  async fetchAssistantResponse(conversation, signal) {
    const { apiKey, endpoint, model, temperature } = this.state.settings;
    if (!apiKey) {
      throw new Error('Ajoute une clé API dans la configuration de mhd bot.');
    }

    const payload = {
      model,
      temperature,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversation.messages.map(({ role, content }) => ({ role, content }))
      ]
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const message = errorPayload?.error?.message || response.statusText || 'Impossible de contacter le modèle.';
      throw new Error(message);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Réponse vide du modèle.');
    }
    return content.trim();
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
