import { Logger } from '@nestjs/common';
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

/**
 * Nom du salon Socket.IO associé à un match.
 *
 * Centralisé pour que l'émetteur et l'abonné ne puissent pas diverger : un
 * message publié dans `match:42` et attendu dans `match-42` ne produit aucune
 * erreur, seulement un silence — le pire des bugs temps réel à diagnostiquer.
 */
export function matchRoom(matchId: string): string {
  return `match:${matchId}`;
}

/**
 * Passerelle temps réel.
 *
 * Squelette du Sprint 0 : la connexion, les salons et le cycle de vie sont en
 * place, mais aucun événement métier n'est encore diffusé. Le Sprint 5 y
 * branchera le score, le chronomètre et le chat.
 *
 * Le découpage en salons par match est la décision structurante. Diffuser à
 * tous les sockets connectés et laisser le client filtrer fonctionnerait à
 * cent spectateurs et s'effondrerait à cent mille : chaque message serait
 * sérialisé et poussé sur chaque connexion. Avec des salons, Socket.IO ne
 * touche que les sockets concernés.
 *
 * À plusieurs instances, il faudra brancher l'adaptateur Redis — sans lui, un
 * message émis par une instance n'atteint pas les sockets des autres. Le
 * `RedisService` est prêt ; le branchement se fera au Sprint 5, avec les
 * connexions dédiées qu'exige le mode abonnement.
 */
@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
  // WebSocket d'abord ; le repli en long-polling reste disponible pour les
  // réseaux d'entreprise qui bloquent l'upgrade HTTP.
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private readonly server!: Server;

  handleConnection(client: Socket): void {
    this.logger.debug(`Socket connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Socket déconnecté : ${client.id}`);
  }

  /**
   * Abonne un client au flux temps réel d'un match.
   *
   * L'accusé de réception renvoyé permet au client de distinguer un abonnement
   * effectif d'un silence radio — indispensable pour afficher un état de
   * connexion honnête dans le Match Center.
   */
  @SubscribeMessage('match:subscribe')
  async handleMatchSubscribe(
    client: Socket,
    payload: { matchId: string },
  ): Promise<{ subscribed: true; room: string }> {
    const room = matchRoom(payload.matchId);
    await client.join(room);

    return { subscribed: true, room };
  }

  @SubscribeMessage('match:unsubscribe')
  async handleMatchUnsubscribe(
    client: Socket,
    payload: { matchId: string },
  ): Promise<{ subscribed: false; room: string }> {
    const room = matchRoom(payload.matchId);
    await client.leave(room);

    return { subscribed: false, room };
  }

  /**
   * Diffuse un événement aux spectateurs d'un match.
   *
   * Point d'entrée unique des services métier vers le temps réel : aucun
   * service ne manipule directement le serveur Socket.IO.
   *
   * @param matchId Identifiant du match concerné.
   * @param event Nom de l'événement, par exemple `score:updated`.
   * @param payload Charge utile sérialisable.
   */
  emitToMatch(matchId: string, event: string, payload: unknown): void {
    this.server.to(matchRoom(matchId)).emit(event, payload);
  }

  /** Nombre de sockets actuellement abonnés à un match. */
  async countMatchViewers(matchId: string): Promise<number> {
    const sockets = await this.server.in(matchRoom(matchId)).fetchSockets();

    return sockets.length;
  }
}
