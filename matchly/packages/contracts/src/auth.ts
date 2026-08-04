import { z } from 'zod';

import {
  displayNameSchema,
  emailSchema,
  idSchema,
  isoDateTimeSchema,
  slugSchema,
} from './primitives';

/**
 * Contrats d'authentification, partagés entre le formulaire et l'API.
 *
 * C'est ici que le partage des schémas prend tout son sens : la règle de
 * longueur d'un mot de passe est écrite une fois. Le formulaire refuse ce que
 * l'API refusera, avec le même message — et surtout, personne ne peut assouplir
 * la règle côté navigateur en croyant que le serveur reste strict.
 */

// -----------------------------------------------------------------------------
// Politique de mot de passe
// -----------------------------------------------------------------------------

/**
 * Longueur minimale d'un mot de passe.
 *
 * Douze caractères, et aucune règle de composition — pas de « une majuscule,
 * un chiffre, un caractère spécial ». C'est la recommandation du NIST
 * (SP 800-63B) depuis 2017, et elle va à l'encontre de l'intuition : les règles
 * de composition poussent les utilisateurs vers des variations prévisibles
 * (`Password1!`) que les outils de cassage énumèrent en priorité, tout en
 * décourageant les phrases de passe longues, qui sont pourtant bien plus
 * résistantes. La longueur est le seul facteur qui compte vraiment.
 */
export const PASSWORD_MIN_LENGTH = 12;

/**
 * Longueur maximale.
 *
 * Une borne haute est nécessaire, mais pas pour des raisons de sécurité :
 * Argon2 hache une entrée arbitrairement longue sans faiblir. Elle protège du
 * déni de service par mot de passe géant, dont le hachage consommerait
 * plusieurs secondes de CPU par requête.
 */
export const PASSWORD_MAX_LENGTH = 128;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Le mot de passe fait au moins ${PASSWORD_MIN_LENGTH} caractères.`)
  .max(PASSWORD_MAX_LENGTH, `Le mot de passe fait au plus ${PASSWORD_MAX_LENGTH} caractères.`);

/**
 * Vérifie qu'un mot de passe ne reprend pas les identités de son propriétaire.
 *
 * Un mot de passe contenant le nom ou la partie locale de l'adresse email est
 * la première chose qu'un attaquant essaie sur une cible nommée. Le contrôle
 * est bon marché et attrape un cas fréquent que la seule longueur laisse passer.
 *
 * @param password Mot de passe proposé.
 * @param identifiers Valeurs à ne pas retrouver dedans (email, nom affiché).
 * @returns `true` si le mot de passe est acceptable.
 *
 * @example
 * isPasswordFreeOfIdentifiers('amelie.dubois2026', ['amelie@club.fr']) // false
 */
export function isPasswordFreeOfIdentifiers(
  password: string,
  identifiers: readonly string[],
): boolean {
  const haystack = password.toLowerCase();

  return identifiers.every((identifier) => {
    // Seule la partie locale de l'email compte : interdire « gmail » n'aurait
    // aucun sens.
    const needle = (identifier.split('@')[0] ?? '').trim().toLowerCase();

    // En deçà de quatre caractères, la sous-chaîne se retrouve partout par
    // hasard et le contrôle rejetterait des mots de passe légitimes.
    if (needle.length < 4) return true;

    return !haystack.includes(needle);
  });
}

// -----------------------------------------------------------------------------
// Inscription et connexion
// -----------------------------------------------------------------------------

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    displayName: displayNameSchema,
    /** Acceptation explicite des conditions. Doit valoir `true`. */
    acceptTerms: z.literal(true, {
      error: 'Vous devez accepter les conditions générales.',
    }),
  })
  .refine((data) => isPasswordFreeOfIdentifiers(data.password, [data.email, data.displayName]), {
    message: 'Le mot de passe ne doit pas contenir votre nom ni votre adresse email.',
    path: ['password'],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  /**
   * Pas de contrainte de longueur à la connexion, volontairement.
   *
   * Appliquer la politique ici renseignerait un attaquant sur la validité d'un
   * compte : un mot de passe court refusé par le formulaire pour non-conformité
   * se distingue d'un mot de passe court refusé par le serveur pour invalidité.
   * Le champ n'est que non vide.
   */
  password: z.string().min(1, 'Saisissez votre mot de passe.'),
  /** Prolonge la session au-delà de la durée par défaut. */
  rememberMe: z.boolean().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

// -----------------------------------------------------------------------------
// Session
// -----------------------------------------------------------------------------

/** Utilisateur tel qu'exposé au client. Ne contient jamais de secret. */
export const sessionUserSchema = z.object({
  id: idSchema,
  email: emailSchema,
  slug: slugSchema,
  displayName: displayNameSchema,
  avatarUrl: z.url().nullable(),
  /** `null` tant que l'adresse n'a pas été confirmée. */
  emailVerifiedAt: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

/** Réponse des points d'entrée qui authentifient. */
export const authResponseSchema = z.object({
  user: sessionUserSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

/**
 * Réponse de `GET /auth/me`.
 *
 * `user: null` plutôt qu'un 401 pour la lecture de session : demander « qui
 * suis-je ? » sans être connecté est une question légitime, pas une erreur. Un
 * 401 obligerait le client à traiter en échec le cas le plus banal du web —
 * un visiteur anonyme — et polluerait les journaux d'erreurs.
 */
export const currentUserResponseSchema = z.object({
  user: sessionUserSchema.nullable(),
});
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;

/** Session active, telle que listée dans les paramètres de sécurité. */
export const activeSessionSchema = z.object({
  id: idSchema,
  /** Description dérivée du User-Agent : « Chrome sur macOS ». */
  device: z.string(),
  ipAddress: z.string().nullable(),
  createdAt: isoDateTimeSchema,
  lastSeenAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema,
  /** Vrai pour la session depuis laquelle la requête est faite. */
  isCurrent: z.boolean(),
});
export type ActiveSession = z.infer<typeof activeSessionSchema>;

// -----------------------------------------------------------------------------
// OAuth
// -----------------------------------------------------------------------------

/** Fournisseurs d'identité tiers pris en charge. */
export const OAUTH_PROVIDERS = ['google', 'apple'] as const;
export const oauthProviderSchema = z.enum(OAUTH_PROVIDERS);
export type OAuthProvider = z.infer<typeof oauthProviderSchema>;

/** Libellé affiché de chaque fournisseur. */
export const OAUTH_PROVIDER_LABELS: Readonly<Record<OAuthProvider, string>> = {
  google: 'Google',
  apple: 'Apple',
};

/**
 * Paramètres reçus sur l'URL de retour du fournisseur.
 *
 * `state` est obligatoire : c'est lui qui lie le retour à la demande initiale
 * et empêche un tiers de forcer une connexion sur un compte qu'il contrôle
 * (CSRF de connexion). Une réponse sans `state` valide est rejetée.
 */
export const oauthCallbackSchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});
export type OAuthCallback = z.infer<typeof oauthCallbackSchema>;

/** Identité normalisée renvoyée par un fournisseur, quel qu'il soit. */
export interface OAuthIdentity {
  /** Identifiant stable de l'utilisateur chez le fournisseur. */
  providerAccountId: string;
  email: string;
  /** Le fournisseur atteste-t-il que l'adresse est vérifiée ? */
  emailVerified: boolean;
  displayName: string | null;
  avatarUrl: string | null;
}
