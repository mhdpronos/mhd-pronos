# Notifications e-mail pour chaque visite

Ce dépôt contient tout le nécessaire pour recevoir un e-mail à chaque
chargement d'une page du site public.

## Fonctionnement général

1. Un script commun (`tracking.js`) est inclus dans toutes les pages HTML.
   Dès que la page est chargée (hors environnement local), le script envoie
   une requête `POST` vers la fonction Cloud `notifyVisit`.
2. La fonction (`fonctions/index.js`) accepte l'appel cross-origin, enrichit
   les métadonnées (URL, référent, agent utilisateur, IP) et déclenche
   l'envoi d'un e-mail via Gmail/Nodemailer vers `mo64166946@gmail.com`.
3. Une garde anti-double envoi (`window.__MHD_VISIT_RECORDED__`) évite de
   notifier plusieurs fois la même visite, et le script ignore les hôtes
   `localhost`/`127.0.0.1` pour ne pas spammer pendant le développement.

## À faire avant déploiement

1. Ouvrir un terminal dans `fonctions/` puis installer les dépendances :

   ```bash
   cd fonctions
   npm install
   ```

2. Vérifier que le mot de passe d'application Gmail renseigné dans
   `transporter` est valide. Si besoin, régénérer un mot de passe
   d'application depuis le compte `mo64166946@gmail.com` (sécurité > mot de
   passe d'application) et mettre à jour `fonctions/index.js`.

3. Déployer la fonction :

   ```bash
   firebase deploy --only functions:notifyVisit
   ```

   > Bonus : `firebase deploy --only functions` publiera aussi les autres
   > fonctions (`envoyerEmail`, `proxy`) si vous souhaitez les garder à jour.

4. Déployer l'hébergement pour pousser `tracking.js` et les pages HTML
   modifiées :

   ```bash
   firebase deploy --only hosting
   ```

## Tests rapides

1. Ouvrir le site hébergé depuis une fenêtre de navigation privée.
2. Attendre quelques secondes que la page se charge complètement.
3. Vérifier la boîte de réception `mo64166946@gmail.com`. Un message
   "Nouvelle visite sur MHD Pronos" doit apparaître. En cas d'échec,
   consulter les logs :

   ```bash
   firebase functions:log --only notifyVisit
   ```

4. Répéter sur différentes pages pour confirmer que le suivi s'applique à
   tout le site.

## Personnalisation

- Pour modifier l'adresse de destination, ajuster `to:` dans
  `notifyVisit`.
- Pour ignorer certains chemins (ex. `/connexion.html`), ajouter une
  condition dans `tracking.js` avant `sendVisitNotification()`.
- Pour compléter les données (géolocalisation, etc.), enrichir le payload
  dans le script ou la fonction Cloud avant l'envoi du mail.

