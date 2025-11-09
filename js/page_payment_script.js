// Extracted from page payment.html - script block 1
// ---- Helpers
    const fmtCurrency = (n) => new Intl.NumberFormat('fr-FR', { style:'currency', currency:'XOF' }).format(n);
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    // ---- Chargement du plan sélectionné (depuis plan abonnement.html)
    const plan = JSON.parse(localStorage.getItem('selectedPlan') || 'null');
    const planLabelEl = $('#planLabel');
    const planPriceEl = $('#planPrice');
    const planDaysEl  = $('#planDays');
    const methodLabelEl = $('#methodLabel');
    const recapWarningEl = $('#recapWarning');
    const alreadyActiveEl = $('#alreadyActive');
    const feedbackEl = $('#feedback');

    function renderPlan() {
      if (!plan) {
        recapWarningEl.classList.remove('hidden');
        return;
      }
      planLabelEl.textContent = plan.label;
      planPriceEl.textContent = fmtCurrency(plan.price);
      planDaysEl.textContent  = plan.days + ' jours';
    }

    // ---- Abonnement existant ?
    function getSubscription() {
      try { return JSON.parse(localStorage.getItem('subscription') || 'null'); }
      catch { return null; }
    }
    function isSubscriptionActive(sub) {
      if (!sub) return false;
      return new Date(sub.expiresISO).getTime() > Date.now();
    }

    // Si déjà actif → proposer d’aller sur VIP
    const currentSub = getSubscription();
    if (isSubscriptionActive(currentSub)) {
      alreadyActiveEl.classList.remove('hidden');
    }

    // ---- Sélection d’un moyen de paiement (simulation)
    let chosenMethod = localStorage.getItem('chosenPaymentMethod') || '';
    if (chosenMethod) methodLabelEl.textContent = chosenMethod;

    function selectMethod(method, cardEl) {
      chosenMethod = method;
      localStorage.setItem('chosenPaymentMethod', method);
      methodLabelEl.textContent = method;

      $$('.payment-card').forEach(c => c.classList.remove('selected'));
      if (cardEl) cardEl.classList.add('selected');
      showMsg('Moyen sélectionné : ' + method, 'info');
    }

    $$('.payment-card').forEach(card => {
      const method = card.getAttribute('data-method');
      const btn = card.querySelector('.select-btn');
      btn.addEventListener('click', () => selectMethod(method, card));
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('select-btn')) selectMethod(method, card);
      });
      // remettre l'état si déjà choisi
      if (chosenMethod && chosenMethod === method) card.classList.add('selected');
    });

    // ---- Validation (simulation + expiration selon plan)
    $('#validateBtn').addEventListener('click', () => {
      if (!plan) {
        showMsg('Aucun plan détecté. Merci de choisir une formule.', 'warn',
          '<a href="plan abonnement.html" class="inline-btn btn-primary mt-2">Aller aux plans</a>');
        return;
      }
      if (!chosenMethod) {
        showMsg('Veuillez sélectionner un moyen de paiement avant de valider.', 'warn');
        return;
      }
      // Simulation : réussite → on crée l’abonnement + expiry
      const start = new Date();
      const expires = new Date(start.getTime() + plan.days * 24*60*60*1000);

      const subscription = {
        planId: plan.id, label: plan.label, price: plan.price, days: plan.days,
        method: chosenMethod,
        startISO: start.toISOString(),
        expiresISO: expires.toISOString()
      };
      localStorage.setItem('subscription', JSON.stringify(subscription));

      showMsg('✅ Paiement validé ! Redirection vers l’espace VIP…', 'ok');
      setTimeout(() => { window.location.href = 'vip.html'; }, 900);
    });

    // ---- UI helpers
    function showMsg(text, type='info', extraHTML='') {
      feedbackEl.classList.remove('hidden');
      feedbackEl.innerHTML = text + (extraHTML ? '<div class="mt-2">'+extraHTML+'</div>' : '');
      feedbackEl.className = 'mt-3 p-3 rounded-xl text-sm';
      if (type === 'ok') feedbackEl.classList.add('bg-green-500','bg-opacity-15','border','border-green-400');
      else if (type === 'warn') feedbackEl.classList.add('bg-yellow-500','bg-opacity-15','border','border-yellow-400');
      else feedbackEl.classList.add('glass');
    }

    // ---- Animations reveal
    const io = new IntersectionObserver((entries)=> {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // ---- Menu mobile
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');
    if (btn && menu) btn.addEventListener('click', () => menu.classList.toggle('hidden'));

    // Init
    renderPlan();

