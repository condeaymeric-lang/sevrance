import { z } from 'zod';

/**
 * Enveloppe d'erreur unique de l'API Matchly.
 *
 * Toute erreur sortant de l'API — validation, autorisation, panne — adopte
 * cette forme. Le frontend n'a donc qu'un seul format à savoir lire, et peut
 * router l'affichage sur `code` (stable, machine) plutôt que sur `message`
 * (traduisible, susceptible d'évoluer sans préavis).
 */

/**
 * Catalogue fermé des codes d'erreur.
 *
 * Ajouter un code est un changement de contrat : il doit être ajouté ici, donc
 * visible en revue, avant de pouvoir être émis par l'API.
 */
export const ERROR_CODES = [
  // --- 400 ---------------------------------------------------------------
  'VALIDATION_FAILED',
  'MALFORMED_REQUEST',
  // --- 401 / 403 ---------------------------------------------------------
  'UNAUTHENTICATED',
  'INVALID_CREDENTIALS',
  'SESSION_EXPIRED',
  'FORBIDDEN',
  'INSUFFICIENT_ROLE',
  // --- 404 / 409 ---------------------------------------------------------
  'NOT_FOUND',
  'ALREADY_EXISTS',
  'CONFLICT',
  // --- 429 ---------------------------------------------------------------
  'RATE_LIMITED',
  // --- 5xx ---------------------------------------------------------------
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
  'UPSTREAM_TIMEOUT',
] as const;
export const errorCodeSchema = z.enum(ERROR_CODES);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

/** Détail de validation rattaché à un champ précis du formulaire. */
export const fieldErrorSchema = z.object({
  /** Chemin du champ, en notation pointée : `team.players.0.name`. */
  path: z.string(),
  /** Message lisible, déjà rédigé en français. */
  message: z.string(),
});
export type FieldError = z.infer<typeof fieldErrorSchema>;

/** Corps de réponse renvoyé pour toute erreur. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
    /** Renseigné uniquement pour `VALIDATION_FAILED`. */
    fields: z.array(fieldErrorSchema).optional(),
    /**
     * Identifiant de corrélation propagé dans les logs et les traces.
     * À citer tel quel dans un signalement de bug.
     */
    requestId: z.string().optional(),
    timestamp: z.iso.datetime({ offset: true }),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/** Statut HTTP canonique associé à chaque code d'erreur. */
const HTTP_STATUS_BY_CODE: Readonly<Record<ErrorCode, number>> = {
  VALIDATION_FAILED: 400,
  MALFORMED_REQUEST: 400,
  UNAUTHENTICATED: 401,
  INVALID_CREDENTIALS: 401,
  SESSION_EXPIRED: 401,
  FORBIDDEN: 403,
  INSUFFICIENT_ROLE: 403,
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  UPSTREAM_TIMEOUT: 504,
};

/**
 * Donne le statut HTTP à émettre pour un code d'erreur métier.
 *
 * Centraliser cette table évite la dérive classique où le même code part en 400
 * depuis un contrôleur et en 500 depuis un autre.
 */
export function httpStatusForErrorCode(code: ErrorCode): number {
  return HTTP_STATUS_BY_CODE[code];
}

/**
 * Indique si une erreur mérite une nouvelle tentative côté client.
 *
 * Utilisé par la couche TanStack Query : réessayer un 403 ne fait que gaspiller
 * des requêtes, alors qu'un 503 se résout souvent tout seul.
 */
export function isRetryableErrorCode(code: ErrorCode): boolean {
  return code === 'SERVICE_UNAVAILABLE' || code === 'UPSTREAM_TIMEOUT' || code === 'RATE_LIMITED';
}

/**
 * Construit une enveloppe d'erreur valide.
 *
 * @param code Code métier, seul élément sur lequel le client doit brancher.
 * @param message Message lisible destiné à l'utilisateur final.
 * @param options Détails de validation et identifiant de corrélation.
 */
export function buildApiError(
  code: ErrorCode,
  message: string,
  options: { fields?: FieldError[]; requestId?: string } = {},
): ApiError {
  const { fields, requestId } = options;

  return {
    error: {
      code,
      message,
      ...(fields !== undefined && fields.length > 0 ? { fields } : {}),
      ...(requestId !== undefined ? { requestId } : {}),
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Convertit l'échec d'un parse Zod en liste d'erreurs de champs.
 *
 * Permet à un formulaire React Hook Form de rattacher chaque message au bon
 * champ, que la validation ait échoué côté navigateur ou côté serveur.
 *
 * @param error Erreur produite par `schema.safeParse`.
 */
export function toFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

/** Restreint une valeur inconnue à un {@link ApiError} si elle en a la forme. */
export function isApiError(value: unknown): value is ApiError {
  return apiErrorSchema.safeParse(value).success;
}
