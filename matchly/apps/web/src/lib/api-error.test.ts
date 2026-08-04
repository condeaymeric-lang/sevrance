import { buildApiError } from '@matchly/contracts';
import { describe, expect, it } from 'vitest';

import { MatchlyApiError, toApiError } from './api-error';

/** Fabrique une Response porteuse d'un corps JSON, comme le ferait `fetch`. */
function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('toApiError', () => {
  it('reprend le code et le message de l’enveloppe applicative', async () => {
    const envelope = buildApiError('NOT_FOUND', 'Club introuvable.', { requestId: 'req_7' });

    const error = await toApiError(jsonResponse(envelope, 404));

    expect(error.code).toBe('NOT_FOUND');
    expect(error.message).toBe('Club introuvable.');
    expect(error.status).toBe(404);
    expect(error.requestId).toBe('req_7');
  });

  it('conserve les erreurs de champs pour les rattacher au formulaire', async () => {
    const envelope = buildApiError('VALIDATION_FAILED', 'Formulaire invalide.', {
      fields: [{ path: 'name', message: 'Trop court.' }],
    });

    const error = await toApiError(jsonResponse(envelope, 400));

    expect(error.fields).toEqual([{ path: 'name', message: 'Trop court.' }]);
  });

  it('retombe sur une erreur générique quand le corps n’est pas du JSON', async () => {
    // Cas réel : une passerelle ou une page d'erreur de l'hébergeur répond du HTML.
    const response = new Response('<html>502 Bad Gateway</html>', { status: 502 });

    const error = await toApiError(response);

    expect(error.code).toBe('SERVICE_UNAVAILABLE');
    expect(error.status).toBe(502);
  });

  it('classe une réponse 4xx illisible en erreur interne', async () => {
    const error = await toApiError(new Response('nope', { status: 418 }));

    expect(error.code).toBe('INTERNAL_ERROR');
  });

  it('rejette une enveloppe JSON qui n’a pas la forme attendue', async () => {
    const error = await toApiError(jsonResponse({ message: 'boom' }, 500));

    expect(error.code).toBe('SERVICE_UNAVAILABLE');
  });
});

describe('MatchlyApiError.fromNetworkFailure', () => {
  it('distingue un délai dépassé d’une coupure réseau', () => {
    const abort = new DOMException('The operation was aborted.', 'AbortError');

    expect(MatchlyApiError.fromNetworkFailure(abort).code).toBe('UPSTREAM_TIMEOUT');
    expect(MatchlyApiError.fromNetworkFailure(new TypeError('failed')).code).toBe(
      'SERVICE_UNAVAILABLE',
    );
  });

  it('utilise le statut 0, qui signale l’absence de réponse HTTP', () => {
    expect(MatchlyApiError.fromNetworkFailure(new TypeError('failed')).status).toBe(0);
  });
});

describe('MatchlyApiError', () => {
  it('reste une Error, donc capturable par un catch standard', () => {
    const error = new MatchlyApiError({ code: 'FORBIDDEN', message: 'Non.', status: 403 });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('MatchlyApiError');
  });

  it('expose une liste de champs vide par défaut', () => {
    const error = new MatchlyApiError({ code: 'CONFLICT', message: 'Conflit.', status: 409 });

    expect(error.fields).toEqual([]);
  });
});
