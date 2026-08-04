import { randomUUID } from 'node:crypto';

import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/** Nom de l'en-tête portant l'identifiant de corrélation. */
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Attache un identifiant de corrélation à chaque requête.
 *
 * Un identifiant présent dans l'en-tête entrant est conservé : c'est ce qui
 * permet de suivre un appel de bout en bout quand il traverse Cloudflare, puis
 * le frontend, puis l'API. Sinon, un identifiant est généré.
 *
 * Cet identifiant est renvoyé au client dans la réponse et inséré dans
 * l'enveloppe d'erreur. Un utilisateur qui signale un incident cite une chaîne
 * unique, et l'on retrouve la trace exacte au lieu de fouiller les logs à
 * l'horodatage.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const incoming = request.headers[REQUEST_ID_HEADER];
    const requestId = typeof incoming === 'string' && incoming.length > 0 ? incoming : randomUUID();

    request.requestId = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
