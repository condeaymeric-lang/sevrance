/**
 * Extensions du type `Request` d'Express.
 *
 * Déclarées ici plutôt qu'avec des transtypages disséminés dans le code : le
 * middleware qui pose la propriété et les consommateurs qui la lisent partagent
 * ainsi une définition unique, vérifiée par le compilateur.
 */
declare global {
  namespace Express {
    interface Request {
      /** Identifiant de corrélation posé par `RequestIdMiddleware`. */
      requestId?: string;
    }
  }
}

export {};
