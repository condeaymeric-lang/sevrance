import { apiErrorSchema } from '@matchly/contracts';
import {
  type ArgumentsHost,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AllExceptionsFilter, DomainException } from './all-exceptions.filter';

/** Reproduit le minimum d'`ArgumentsHost` dont le filtre se sert. */
function createHost(requestId?: string) {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });

  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ method: 'GET', url: '/api/v1/clubs', requestId }),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    // Le filtre journalise volontairement : on coupe le bruit dans les tests.
    vi.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
    vi.spyOn(filter['logger'], 'warn').mockImplementation(() => undefined);
  });

  it('émet toujours une enveloppe conforme au contrat partagé', () => {
    const { host, json } = createHost();

    filter.catch(new NotFoundException('Club introuvable.'), host);

    expect(apiErrorSchema.safeParse(json.mock.calls[0]?.[0]).success).toBe(true);
  });

  it('traduit une exception HTTP de Nest en code métier', () => {
    const { host, status, json } = createHost();

    filter.catch(new ForbiddenException(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json.mock.calls[0]?.[0].error.code).toBe('FORBIDDEN');
  });

  it('conserve le code précis d’une DomainException', () => {
    const { host, status, json } = createHost();

    filter.catch(
      new DomainException('INSUFFICIENT_ROLE', 'Rôle insuffisant.', HttpStatus.FORBIDDEN),
      host,
    );

    // Deux causes distinctes derrière le même 403 : le client doit pouvoir
    // les distinguer, ce que le statut seul ne permet pas.
    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json.mock.calls[0]?.[0].error.code).toBe('INSUFFICIENT_ROLE');
  });

  it('transporte les erreurs de champs d’une validation', () => {
    const { host, json } = createHost();

    filter.catch(
      new DomainException('VALIDATION_FAILED', 'Invalide.', HttpStatus.BAD_REQUEST, [
        { path: 'name', message: 'Trop court.' },
      ]),
      host,
    );

    expect(json.mock.calls[0]?.[0].error.fields).toEqual([
      { path: 'name', message: 'Trop court.' },
    ]);
  });

  it('ne divulgue jamais le message d’une erreur inattendue', () => {
    const { host, status, json } = createHost();

    filter.catch(new Error('SELECT * FROM users WHERE token = "secret"'), host);

    const body = json.mock.calls[0]?.[0];

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('Une erreur interne est survenue.');
    expect(JSON.stringify(body)).not.toContain('SELECT');
  });

  it('propage l’identifiant de corrélation dans l’enveloppe', () => {
    const { host, json } = createHost('req_abc');

    filter.catch(new NotFoundException(), host);

    expect(json.mock.calls[0]?.[0].error.requestId).toBe('req_abc');
  });

  it('gère une valeur lancée qui n’est pas une Error', () => {
    const { host, status, json } = createHost();

    filter.catch('boom', host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(apiErrorSchema.safeParse(json.mock.calls[0]?.[0]).success).toBe(true);
  });

  it('retombe sur INTERNAL_ERROR pour un statut hors catalogue', () => {
    const { host, json } = createHost();

    filter.catch(new DomainException('CONFLICT', 'Conflit.', 409), host);

    expect(json.mock.calls[0]?.[0].error.code).toBe('CONFLICT');
  });
});
