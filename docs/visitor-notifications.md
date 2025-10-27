# Notifier chaque visite sur le site

Obtenir une notification à chaque visite nécessite de suivre les requêtes entrantes
et de propager cette information vers un canal (e-mail, webhook, push…).
Voici trois scénarios possibles, classés du plus simple au plus robuste.

## 1. Utiliser un service d'analyse avec alertes

1. Créez un compte sur une plateforme telle que Google Analytics, Plausible ou
   Umami, puis intégrez leur script de suivi dans toutes vos pages HTML.
2. Configurez une alerte qui se déclenche sur chaque nouvelle session ou lorsque le
   nombre d'utilisateurs actifs dépasse `0`. Certaines solutions proposent des
   notifications par e-mail, Slack ou webhook.
3. Les solutions hébergées restent simples à configurer, mais dépendent d'un
   service tiers et ne garantissent pas l'envoi immédiat d'une notification
   (délai de collecte, filtrage des robots).

## 2. Journaliser les visites via un backend léger

1. Déployez un point de terminaison (par exemple sur Firebase Functions,
   Cloudflare Workers ou un serveur Express) qui reçoit les requêtes de suivi
   (`POST /track-visit`).
2. Depuis chaque page, ajoutez un script qui envoie une requête fetch à ce
   endpoint lorsqu'elle se charge.
3. Dans le backend, enregistrez l'heure, l'adresse IP et l'agent utilisateur dans
   une base de données (Firestore, Supabase, MongoDB…).
4. Configurez le backend pour déclencher une notification en temps réel :
   * envoi d'un e-mail via un service SMTP ou SendGrid;
   * message webhook vers Discord/Slack;
   * notification push via Firebase Cloud Messaging.
5. Implémentez un filtrage de base (par exemple, ignorer les bots connus ou vos
   propres visites) pour éviter le bruit.

## 3. Déployer un pixel de suivi auto-hébergé

1. Hébergez un micro-service qui renvoie une image transparente ("tracking
   pixel").
2. Incluez cette image (`<img src="https://votre-domaine/pixel.gif" />`) dans
   chaque page : à chaque chargement, le navigateur demandera le pixel.
3. Le service enregistre la requête et peut immédiatement déclencher un webhook ou
   un e-mail.
4. Cette approche fonctionne même si JavaScript est désactivé, mais nécessite de
   bloquer le cache (en ajoutant un paramètre unique) pour s'assurer que chaque
   visite génère bien une requête.

## Points de vigilance

- Respectez les réglementations (RGPD) : affichez une bannière de consentement et
  mettez à jour votre politique de confidentialité si vous collectez des données
  personnelles.
- Limitez les notifications en regroupant les visites (batch) ou en définissant
  des seuils, faute de quoi vous serez submergé par les alertes.
- Pour valider le fonctionnement, testez avec un navigateur privé et vérifiez que
  l'événement déclenche bien l'envoi (log serveur, e-mail reçu, etc.).

En résumé, oui c'est possible, mais cela requiert un composant serveur ou un
service tiers capable de capter chaque visite et de vous alerter en temps réel.
Choisissez la solution en fonction de vos contraintes d'hébergement et de
respect de la vie privée.
