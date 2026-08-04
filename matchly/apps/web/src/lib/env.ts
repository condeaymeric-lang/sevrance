import { z } from 'zod';

/**
 * Variables d'environnement publiques, validées au chargement du module.
 *
 * Deux contraintes dictent la forme de ce fichier.
 *
 * 1. Next ne remplace `process.env.NEXT_PUBLIC_X` par sa valeur que lorsque
 *    l'expression est écrite littéralement dans le code. Un accès dynamique
 *    (`process.env[name]`) donne `undefined` dans le bundle navigateur. Chaque
 *    variable est donc citée en toutes lettres ci-dessous.
 *
 * 2. Une variable manquante doit se voir au démarrage, pas au premier appel
 *    réseau. Le `safeParse` s'exécute à l'import, donc au build.
 *
 * Les valeurs de repli sont volontairement permissives au Sprint 0 : aucune
 * fonctionnalité n'appelle encore l'API, et casser le premier déploiement
 * Vercel pour une variable qui ne sert pas encore serait absurde. Le Sprint 2,
 * qui introduit l'authentification, rendra `NEXT_PUBLIC_API_URL` obligatoire.
 */
const publicEnvSchema = z.object({
  /** Origine canonique du site. Sert aux URLs absolues du SEO et du sitemap. */
  NEXT_PUBLIC_SITE_URL: z.url(),
  /** Racine de l'API REST, version comprise. */
  NEXT_PUBLIC_API_URL: z.url(),
  /** Origine du serveur temps réel Socket.IO. */
  NEXT_PUBLIC_WS_URL: z.url(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

/**
 * Déduit l'origine du site quand elle n'est pas fournie explicitement.
 *
 * Sur Vercel, `VERCEL_URL` porte le domaine de l'aperçu courant — c'est la
 * seule valeur correcte pour un déploiement de prévisualisation, dont l'URL
 * change à chaque commit.
 */
function inferSiteUrl(): string {
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl !== undefined && vercelUrl.length > 0) {
    return `https://${vercelUrl}`;
  }
  return 'http://localhost:3000';
}

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? inferSiteUrl(),
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000',
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  throw new Error(
    `Variables d'environnement publiques invalides :\n${details}\n` +
      'Consultez matchly/.env.example.',
  );
}

/** Environnement public validé. */
export const env: PublicEnv = parsed.data;

/** Vrai en production. Sert à conditionner l'outillage de développement. */
export const isProduction = process.env.NODE_ENV === 'production';
