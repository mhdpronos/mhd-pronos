(function () {
  const toggleButton = document.querySelector('.assistant-toggle');
  const panel = document.querySelector('.assistant-panel');
  const closeButton = document.querySelector('.assistant-close');
  const form = document.querySelector('.assistant-form');
  const input = document.getElementById('assistant-input');
  const messagesContainer = document.querySelector('.assistant-messages');
  const typingIndicator = document.querySelector('.assistant-typing');

  const conversation = [];

  /**
   * Formate une date pour affichage dans les bulles.
   * @returns {string}
   */
  function formatTime() {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  }

  /**
   * Génère une réponse courte et professionnelle en fonction du message.
   * @param {string} message
   * @returns {string}
   */
  function generateBotResponse(message) {
    const normalized = message.trim().toLowerCase();

    if (!normalized) {
      return "Je suis prêt à vous aider. N'hésitez pas à formuler votre question.";
    }

    if (/(bonjour|salut|hello|bonsoir)/.test(normalized)) {
      return 'Bonjour ! Comment puis-je vous assister aujourd\'hui ?';
    }

    if (normalized.includes('prix') || normalized.includes('tarif') || normalized.includes('abonnement')) {
      return 'Nos offres démarrent avec une formule découverte. Choisissez le plan adapté depuis la page Tarifs pour tous les détails.';
    }

    if (normalized.includes('contact')) {
      return 'Vous pouvez nous écrire via le formulaire de contact ou par email. Nous répondons en moins de 24 heures.';
    }

    if (normalized.includes('problème') || normalized.includes('bug') || normalized.includes('erreur')) {
      return 'Merci pour le signalement. Donnez-moi les détails clés et je vous guiderai étape par étape.';
    }

    if (normalized.includes('paiement')) {
      return 'Les paiements sont sécurisés. Vérifiez que votre carte est valide et réessayez ; sinon contactez le support.';
    }

    if (normalized.includes('essai') || normalized.includes('demo')) {
      return 'Une démo personnalisée est disponible sur demande. Partagez vos disponibilités et nous organiserons cela.';
    }

    if (normalized.includes('merci')) {
      return 'Avec plaisir ! Je reste disponible si besoin.';
    }

    return 'Je vous réponds de manière concise : pourriez-vous préciser votre objectif pour que je vous guide efficacement ?';
  }

  /**
   * Crée et ajoute une bulle de message.
   * @param {Object} options
   * @param {string} options.sender - "user" ou "bot"
   * @param {string} options.text
   */
  function addMessage({ sender, text }) {
    const wrapper = document.createElement('article');
    wrapper.className = `message ${sender}`;

    const bubble = document.createElement('p');
    bubble.textContent = text;

    const timestamp = document.createElement('time');
    timestamp.dateTime = new Date().toISOString();
    timestamp.textContent = formatTime();

    wrapper.appendChild(bubble);
    wrapper.appendChild(timestamp);
    messagesContainer.appendChild(wrapper);

    conversation.push({ sender, text, createdAt: timestamp.dateTime });

    requestAnimationFrame(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  /**
   * Ouvre ou ferme le panneau de chat.
   * @param {boolean} shouldOpen
   */
  function setPanelState(shouldOpen) {
    panel.classList.toggle('is-open', shouldOpen);
    panel.setAttribute('aria-hidden', String(!shouldOpen));
    toggleButton.setAttribute('aria-expanded', String(shouldOpen));

    if (shouldOpen) {
      requestAnimationFrame(() => input.focus());
      if (!conversation.length) {
        addMessage({
          sender: 'bot',
          text: 'Bonjour, je suis votre assistant. Posez-moi vos questions et je vous répondrai clairement.'
        });
      }
    }
  }

  function showTypingIndicator(isVisible) {
    typingIndicator.classList.toggle('is-visible', isVisible);
    typingIndicator.setAttribute('aria-hidden', String(!isVisible));
  }

  function handleUserMessage(text) {
    addMessage({ sender: 'user', text });
    showTypingIndicator(true);

    const typingDelay = Math.min(1200 + text.length * 20, 2200);

    setTimeout(() => {
      const botReply = generateBotResponse(text);
      showTypingIndicator(false);
      addMessage({ sender: 'bot', text: botReply });
    }, typingDelay);
  }

  toggleButton.addEventListener('click', () => {
    const isOpen = panel.classList.contains('is-open');
    setPanelState(!isOpen);
  });

  closeButton.addEventListener('click', () => {
    setPanelState(false);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const message = input.value.trim();

    if (!message) {
      return;
    }

    input.value = '';
    handleUserMessage(message);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) {
      setPanelState(false);
    }
  });
})();
