import type { z } from 'zod';

import { env } from '@/lib/env';

import { MatchlyApiError, toApiError } from './api-error';

/** Délai au-delà duquel une requête est abandonnée, en millisecondes. */
const DEFAULT_TIMEOUT_MS = 15_000;

export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  /** Corps sérialisé en JSON. Ne pas utiliser conjointement à `body`. */
  json?: unknown;
  /** Paramètres de query string. Les valeurs `undefined` sont ignorées. */
  searchParams?: Record<string, string | number | boolean | undefined>;
  /** Délai maximal, en millisecondes. */
  timeoutMs?: number;
}

/**
 * Assemble l'URL absolue d'un point d'API.
 *
 * @param path Chemin relatif à la racine de l'API, avec ou sans `/` initial.
 * @param searchParams Paramètres à sérialiser.
 */
function buildUrl(path: string, searchParams?: RequestOptions['searchParams']): string {
  const base = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  const url = new URL(`${base}/${path.replace(/^\/+/, '')}`);

  if (searchParams !== undefined) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Exécute une requête vers l'API Matchly et valide la réponse.
 *
 * Le schéma Zod n'est pas une précaution superflue : il fait de la frontière
 * réseau le seul endroit où des données non fiables entrent dans
 * l'application. Passé ce point, le typage TypeScript correspond vraiment à ce
 * qui circule — au lieu d'être une promesse qu'un déploiement d'API désynchronisé
 * peut trahir silencieusement.
 *
 * @param method Verbe HTTP.
 * @param path Chemin relatif à `NEXT_PUBLIC_API_URL`.
 * @param schema Schéma de validation de la réponse.
 * @param options Corps, paramètres, en-têtes, délai.
 *
 * @throws {MatchlyApiError} Pour toute erreur — HTTP, réseau ou validation.
 *
 * @example
 * const clubs = await apiRequest('GET', '/clubs', clubPageSchema, {
 *   searchParams: { limit: 20 },
 * });
 */
export async function apiRequest<TSchema extends z.ZodTypeAny>(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  schema: TSchema,
  options: RequestOptions = {},
): Promise<z.infer<TSchema>> {
  const { json, searchParams, timeoutMs = DEFAULT_TIMEOUT_MS, headers, ...rest } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  let response: Response;

  try {
    response = await fetch(buildUrl(path, searchParams), {
      ...rest,
      method,
      signal: controller.signal,
      // Les sessions Matchly reposent sur un cookie httpOnly : sans cette
      // option, `fetch` ne l'envoie pas sur une origine différente.
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
    });
  } catch (cause) {
    throw MatchlyApiError.fromNetworkFailure(cause);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  // 204 No Content : rien à désérialiser, on valide `undefined`.
  const payload: unknown = response.status === 204 ? undefined : await response.json();
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new MatchlyApiError({
      code: 'INTERNAL_ERROR',
      message: 'La réponse du serveur ne correspond pas au format attendu.',
      status: response.status,
      fields: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  return parsed.data;
}

export { MatchlyApiError };
