import { type ApiError, type ErrorCode, isApiError } from '@matchly/contracts';

/**
 * Erreur normalisée remontée par la couche réseau.
 *
 * Toute erreur — enveloppe applicative, panne réseau, réponse illisible —
 * arrive à l'interface sous cette forme unique. Les composants n'ont donc
 * jamais à distinguer « l'API a répondu 403 » de « le Wi-Fi a coupé » avant de
 * savoir quoi afficher : `code` répond toujours à la question.
 */
export class MatchlyApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fields: ReadonlyArray<{ path: string; message: string }>;
  readonly requestId: string | undefined;

  constructor(params: {
    code: ErrorCode;
    message: string;
    status: number;
    fields?: ReadonlyArray<{ path: string; message: string }>;
    requestId?: string;
  }) {
    super(params.message);
    this.name = 'MatchlyApiError';
    this.code = params.code;
    this.status = params.status;
    this.fields = params.fields ?? [];
    this.requestId = params.requestId;
  }

  /** Construit l'erreur à partir d'une enveloppe renvoyée par l'API. */
  static fromEnvelope(envelope: ApiError, status: number): MatchlyApiError {
    return new MatchlyApiError({
      code: envelope.error.code,
      message: envelope.error.message,
      status,
      fields: envelope.error.fields ?? [],
      ...(envelope.error.requestId !== undefined ? { requestId: envelope.error.requestId } : {}),
    });
  }

  /**
   * Construit l'erreur pour une réponse que l'on n'a pas su interpréter.
   *
   * Se produit quand un intermédiaire — passerelle, proxy, page d'erreur de
   * l'hébergeur — répond à la place de l'API, avec du HTML au lieu de JSON.
   */
  static fromUnparsableResponse(status: number): MatchlyApiError {
    return new MatchlyApiError({
      code: status >= 500 ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR',
      message: 'Réponse inattendue du serveur.',
      status,
    });
  }

  /** Construit l'erreur pour un échec réseau — hors ligne, DNS, délai dépassé. */
  static fromNetworkFailure(cause: unknown): MatchlyApiError {
    const isTimeout = cause instanceof DOMException && cause.name === 'AbortError';

    return new MatchlyApiError({
      code: isTimeout ? 'UPSTREAM_TIMEOUT' : 'SERVICE_UNAVAILABLE',
      message: isTimeout
        ? 'Le serveur met trop de temps à répondre.'
        : 'Connexion au serveur impossible.',
      status: 0,
    });
  }
}

/**
 * Convertit une réponse HTTP en échec, sans jamais lever d'erreur non typée.
 *
 * @param response Réponse dont le statut n'est pas dans la plage 2xx.
 */
export async function toApiError(response: Response): Promise<MatchlyApiError> {
  try {
    const body: unknown = await response.json();

    if (isApiError(body)) {
      return MatchlyApiError.fromEnvelope(body, response.status);
    }
  } catch {
    // Corps absent ou non-JSON : on retombe sur l'erreur générique ci-dessous.
  }

  return MatchlyApiError.fromUnparsableResponse(response.status);
}
