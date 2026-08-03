/**
 * Source unique de la copie de la page de vente.
 * Règle de fond : aucun chiffre de vente, aucun taux de réussite, aucun
 * témoignage non vérifié. Rien ici ne doit être invérifiable.
 */

export const PRICE_EUR = 49;

export const PRICE_LABEL = "49 €";

export const PRODUCT = {
  name: "Sevrance",
  tagline: "Le protocole en 6 étapes pour démonter votre dépendance à la cigarette",
  pages: 50,
  format: "PDF",
  guaranteeDays: 14,
} as const;

export const HERO = {
  eyebrow: "Ebook · 50 pages · Protocole en 6 étapes",
  title: "Vous ne manquez pas de volonté. Vous utilisez la mauvaise méthode.",
  subtitle:
    "Sevrance : le protocole en 6 étapes pour comprendre — et démonter — votre dépendance à la cigarette. 50 pages, aucun blabla.",
  cta: `Je commande mon exemplaire — ${PRICE_LABEL}`,
  reassurance: "Paiement sécurisé · Accès immédiat · PDF haute qualité",
} as const;

export const PROBLEM = {
  eyebrow: "Pourquoi les méthodes classiques échouent",
  title: "Le problème n'a jamais été votre discipline.",
  columns: [
    {
      title: "Vous n'avez pas trois mois à y consacrer",
      body: "Séances hebdomadaires, groupes de parole, suivi à rallonge : les programmes classiques réclament un agenda que vous n'avez pas. Le vôtre est déjà plein à six semaines.",
    },
    {
      title: "On vous a déjà tout expliqué",
      body: "Vous connaissez les risques mieux que la plupart des gens qui vous les rappellent. Le discours moralisateur n'a jamais fait tomber une seule cigarette — il ajoute juste de la culpabilité au manque.",
    },
    {
      title: "Vous voulez comprendre, pas obéir",
      body: "Arrêter sans comprendre le mécanisme, c'est tenir trois semaines puis rallumer au premier imprévu. Tant que la dépendance reste une boîte noire, elle garde l'avantage.",
    },
  ],
} as const;

export const MECHANISM = {
  eyebrow: "Le protocole",
  title: "Six étapes. Chacune retire un appui à la dépendance.",
  intro:
    "Sevrance ne vous demande pas de « tenir bon ». Le protocole démonte la dépendance pièce par pièce, dans un ordre précis : chaque étape rend la suivante praticable.",
  steps: [
    {
      name: "Cartographie",
      benefit:
        "Vous relevez chaque cigarette pendant une semaine et identifiez les quatre ou cinq qui tiennent réellement l'ensemble.",
    },
    {
      name: "Décodage",
      benefit:
        "Vous séparez ce qui relève de la nicotine de ce qui relève du geste, du rituel et du contexte social — ce ne sont pas les mêmes leviers.",
    },
    {
      name: "Désamorçage",
      benefit:
        "Vous neutralisez les déclencheurs un par un, au lieu de leur résister tous en même temps le même matin.",
    },
    {
      name: "Substitution",
      benefit:
        "Vous remplacez la fonction de la cigarette — la pause, la transition, la décompression — avant de retirer la cigarette elle-même.",
    },
    {
      name: "Rupture",
      benefit:
        "Vous fixez une date, avec un protocole précis pour les 72 premières heures puis pour les trois semaines qui suivent.",
    },
    {
      name: "Consolidation",
      benefit:
        "Vous installez les garde-fous qui séparent un arrêt de trois mois d'un arrêt qui tient : le retour du stress, l'alcool, le premier dîner avec des fumeurs.",
    },
  ],
} as const;

export const OFFER = {
  eyebrow: "L'offre",
  title: "Ce que vous recevez, exactement.",
  includes: [
    `${PRODUCT.pages} pages au format ${PRODUCT.format}, mises en page pour être lues à l'écran comme imprimées.`,
    "Le protocole complet en 6 étapes, avec la marche à suivre pour chacune.",
    "Un tracker imprimable de 30 jours, pour suivre la phase de rupture sans application ni compte à créer.",
    "Accès immédiat après paiement, plus le lien de téléchargement envoyé par email.",
  ],
  guarantee: {
    title: `Garantie ${PRODUCT.guaranteeDays} jours`,
    body: `Si le livre ne vous apporte rien, vous écrivez à notre adresse de contact dans les ${PRODUCT.guaranteeDays} jours et vous êtes remboursé intégralement. Sans justification à fournir, sans discussion.`,
  },
  price: {
    amount: PRICE_LABEL,
    note: "Paiement unique. Pas d'abonnement, pas de compte à créer.",
  },
} as const;

export const FAQ = {
  eyebrow: "Questions",
  title: "Avant de commander.",
  items: [
    {
      q: "Est-ce encore un livre de plus qui ne servira à rien ?",
      a: "C'est la bonne question à poser. Sevrance n'est pas un livre de motivation : il ne contient ni témoignage inspirant, ni rappel des méfaits du tabac. C'est un protocole en six étapes, avec ce que vous faites concrètement à chacune. Si vous cherchez un texte qui vous remotive, ce n'est pas celui-ci.",
    },
    {
      q: "Combien de temps pour le lire ?",
      a: "Environ une heure et demie pour les 50 pages, en une fois. Le protocole, lui, se déroule sur plusieurs semaines : vous lisez d'abord, vous appliquez ensuite, étape par étape.",
    },
    {
      q: "Et si ça ne marche pas pour moi ?",
      a: `Aucune méthode d'arrêt du tabac ne fonctionne pour tout le monde, et personne d'honnête ne vous promettra le contraire. C'est précisément pourquoi la garantie de ${PRODUCT.guaranteeDays} jours existe : vous demandez le remboursement et l'affaire est close. Si votre dépendance est lourde, ce livre s'articule très bien avec un accompagnement médical — il ne le remplace pas.`,
    },
    {
      q: "Comment je le reçois ?",
      a: "Immédiatement après le paiement, vous arrivez sur une page contenant le lien de téléchargement. Le même lien vous est envoyé par email dans la foulée. Aucun compte à créer, aucun mot de passe à retenir.",
    },
  ],
} as const;

export const FINAL_CTA = {
  title: "Vous connaissez déjà le coût de continuer.",
  body: "La seule chose qui change aujourd'hui, c'est la méthode.",
} as const;

export const LEGAL_DISCLAIMER =
  "Ce document est un outil d'accompagnement personnel et ne remplace pas un avis médical.";

/** Renseignez ces valeurs avant toute mise en ligne réelle. */
export const CONTACT = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@sevrance.fr",
} as const;
