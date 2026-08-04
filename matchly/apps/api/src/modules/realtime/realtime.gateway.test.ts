import { describe, expect, it, vi } from 'vitest';

import { matchRoom, RealtimeGateway } from './realtime.gateway';

describe('matchRoom', () => {
  it('préfixe l’identifiant pour isoler l’espace de noms des salons', () => {
    expect(matchRoom('42')).toBe('match:42');
  });

  it('produit un nom distinct par match', () => {
    expect(matchRoom('a')).not.toBe(matchRoom('b'));
  });
});

describe('RealtimeGateway', () => {
  it('inscrit le client dans le salon du match et accuse réception', async () => {
    const gateway = new RealtimeGateway();
    const client = { id: 'sock-1', join: vi.fn(), leave: vi.fn() };

    const ack = await gateway.handleMatchSubscribe(
      client as unknown as Parameters<typeof gateway.handleMatchSubscribe>[0],
      { matchId: '42' },
    );

    expect(client.join).toHaveBeenCalledWith('match:42');
    // L'accusé permet au Match Center de distinguer un abonnement effectif
    // d'un silence radio.
    expect(ack).toEqual({ subscribed: true, room: 'match:42' });
  });

  it('retire le client du salon au désabonnement', async () => {
    const gateway = new RealtimeGateway();
    const client = { id: 'sock-1', join: vi.fn(), leave: vi.fn() };

    const ack = await gateway.handleMatchUnsubscribe(
      client as unknown as Parameters<typeof gateway.handleMatchUnsubscribe>[0],
      { matchId: '42' },
    );

    expect(client.leave).toHaveBeenCalledWith('match:42');
    expect(ack).toEqual({ subscribed: false, room: 'match:42' });
  });

  it('ne diffuse qu’au salon concerné', () => {
    const gateway = new RealtimeGateway();
    const emit = vi.fn();
    const to = vi.fn().mockReturnValue({ emit });
    Reflect.set(gateway, 'server', { to });

    gateway.emitToMatch('42', 'score:updated', { home: 1, away: 0 });

    // Diffuser à tous les sockets et laisser le client filtrer s'effondrerait
    // à grande échelle : chaque message serait poussé sur chaque connexion.
    expect(to).toHaveBeenCalledWith('match:42');
    expect(emit).toHaveBeenCalledWith('score:updated', { home: 1, away: 0 });
  });

  it('compte les spectateurs d’un match', async () => {
    const gateway = new RealtimeGateway();
    const fetchSockets = vi.fn().mockResolvedValue([{}, {}, {}]);
    Reflect.set(gateway, 'server', { in: vi.fn().mockReturnValue({ fetchSockets }) });

    expect(await gateway.countMatchViewers('42')).toBe(3);
  });
});
