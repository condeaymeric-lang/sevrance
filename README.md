# Sevrance — page de vente

Page de vente courte pour l'ebook **Sevrance** (50 pages, 49 €), avec
paiement Stripe, livraison du PDF par lien signé et envoi automatique de
l'email de confirmation.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Stripe Checkout — paiement unique, pas d'abonnement
- Resend — email transactionnel
- Aucune base de données, aucun compte utilisateur

## Structure

| Route | Rôle |
| --- | --- |
| `/` | Page de vente, un seul scroll. Statique. |
| `/merci` | Page post-paiement : lien de téléchargement + teaser de l'accompagnement. |
| `/api/checkout` | Crée la session Stripe Checkout. |
| `/api/webhook` | Reçoit `checkout.session.completed`, envoie l'email. |
| `/api/download` | Sert le PDF contre un jeton signé et un paiement vérifié. |
| `/cgv`, `/mentions-legales`, `/remboursement`, `/confidentialite` | Textes légaux. |

La copie de la page de vente est centralisée dans `src/lib/content.ts` :
c'est le seul fichier à modifier pour retoucher les textes.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner les valeurs
npm run dev
```

Générer le secret de signature des liens :

```bash
openssl rand -base64 48
```

Déposer le PDF vendu dans `private/sevrance.pdf` (voir `private/README.md`
pour la limite de taille en serverless).

## Scripts

```bash
npm run dev        # développement
npm run build      # build de production
npm start          # serveur de production
npm test           # tests unitaires (jetons de téléchargement)
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

## Livraison du PDF

Le fichier n'est jamais exposé publiquement. Il est servi par
`/api/download`, qui applique deux contrôles successifs :

1. **Jeton signé** (HMAC-SHA256, `src/lib/download-token.ts`) — contient
   l'identifiant de session Stripe et une date d'expiration. Comparaison à
   temps constant. Deux durées de vie : 2 h pour le lien affiché sur `/merci`,
   7 jours pour celui envoyé par email.
2. **Vérification Stripe** — la session est relue à chaque téléchargement et
   doit être `paid`. Ce second contrôle tient même si le secret de signature
   venait à fuiter.

Ces jetons sont couverts par `npm test`.

## Webhook Stripe en local

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Reporter le `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`. En production,
déclarer l'endpoint `https://<domaine>/api/webhook` dans le dashboard Stripe
sur l'événement `checkout.session.completed`.

## Recette avant mise en ligne

Automatisé (`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`) :

- [x] Logique des jetons signés : signature, expiration, falsification.
- [x] Rendu des pages et codes de retour des routes API.
- [x] Absence de débordement horizontal sur mobile.

À faire manuellement, avec des clés Stripe de test :

- [ ] Tunnel complet : clic → carte `4242 4242 4242 4242` → redirection vers
      `/merci` → lien de téléchargement fonctionnel.
- [ ] Email reçu via Resend, lien du mail fonctionnel.
- [ ] Lien expiré : message d'erreur explicite (page `410`).
- [ ] Paiement refusé (`4000 0000 0000 0002`) : retour sur `/#offre`.
- [ ] Remboursement Stripe, puis vérification du parcours de support.

## Points à traiter avant production

- Renseigner les mentions légales et CGV, puis **les faire valider par un
  juriste**. Les textes livrés sont des trames, signalées comme telles sur
  chaque page.
- Vérifier le domaine d'envoi dans Resend (SPF/DKIM), sans quoi les emails
  partiront en spam.
- Créer un Price Stripe et renseigner `STRIPE_PRICE_ID` (TVA, comptabilité).
- Configurer la collecte de TVA Stripe Tax si applicable.
- Remplacer `NEXT_PUBLIC_CONTACT_EMAIL` par l'adresse réelle.

## Règle de contenu

Aucun chiffre de vente, aucun taux de réussite, aucun témoignage n'est
affiché : rien d'invérifiable ne doit apparaître sur la page. La garantie de
14 jours est le seul argument de réassurance, et elle est tenable.
