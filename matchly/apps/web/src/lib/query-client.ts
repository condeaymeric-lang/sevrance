import { isRetryableErrorCode } from '@matchly/contracts';
import { QueryClient } from '@tanstack/react-query';

import { MatchlyApiError } from './api-error';

/** Nombre maximum de tentatives supplémentaires pour une erreur transitoire. */
const MAX_RETRIES = 2;

/**
 * Décide s'il faut réessayer une requête échouée.
 *
 * La règle par défaut de TanStack Query réessaie trois fois n'importe quelle
 * erreur. Sur un 403 ou un 404, ces tentatives sont certaines d'échouer : elles
 * ne font que retarder l'affichage du message et multiplier la charge. On ne
 * réessaie donc que ce qui a une chance de se résoudre seul.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (error instanceof MatchlyApiError) return isRetryableErrorCode(error.code);
  // Erreur inconnue : probablement réseau, une nouvelle tentative se justifie.
  return true;
}

/**
 * Crée un `QueryClient` configuré pour Matchly.
 *
 * Une nouvelle instance est créée par requête serveur et une seule pour toute
 * la session navigateur. Partager un client entre deux requêtes serveur ferait
 * fuiter le cache d'un utilisateur vers un autre — la faille de confidentialité
 * classique du rendu serveur avec cache.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * 60 s de fraîcheur. Assez pour absorber les allers-retours de
         * navigation sans refetch, assez court pour qu'un score de match ne
         * reste jamais périmé longtemps — le direct passe de toute façon par
         * Socket.IO, pas par ce cache.
         */
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 10_000),
        // Le rechargement au retour d'onglet gêne plus qu'il n'aide sur une
        // page de match, où l'utilisateur revient constamment.
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        // Une mutation rejouée peut créer un doublon : jamais de reprise
        // automatique, c'est à l'utilisateur de relancer.
        retry: false,
      },
    },
  });
}
