import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  apiErrorSchema,
  buildApiError,
  ERROR_CODES,
  httpStatusForErrorCode,
  isApiError,
  isRetryableErrorCode,
  toFieldErrors,
} from './errors';

describe('buildApiError', () => {
  it('produit une enveloppe conforme au schéma', () => {
    const error = buildApiError('NOT_FOUND', 'Club introuvable.');

    expect(apiErrorSchema.safeParse(error).success).toBe(true);
    expect(error.error.code).toBe('NOT_FOUND');
  });

  it('omet `fields` quand la liste est vide', () => {
    expect(buildApiError('INTERNAL_ERROR', 'Oups.', { fields: [] }).error.fields).toBeUndefined();
  });

  it('conserve l’identifiant de corrélation', () => {
    const error = buildApiError('FORBIDDEN', 'Accès refusé.', { requestId: 'req_42' });

    expect(error.error.requestId).toBe('req_42');
  });
});

describe('httpStatusForErrorCode', () => {
  it('associe un statut HTTP à chaque code du catalogue', () => {
    for (const code of ERROR_CODES) {
      const status = httpStatusForErrorCode(code);

      expect(status).toBeGreaterThanOrEqual(400);
      expect(status).toBeLessThan(600);
    }
  });
});

describe('isRetryableErrorCode', () => {
  it('ne réessaie pas les erreurs définitives', () => {
    expect(isRetryableErrorCode('FORBIDDEN')).toBe(false);
    expect(isRetryableErrorCode('VALIDATION_FAILED')).toBe(false);
    expect(isRetryableErrorCode('NOT_FOUND')).toBe(false);
  });

  it('réessaie les erreurs transitoires', () => {
    expect(isRetryableErrorCode('SERVICE_UNAVAILABLE')).toBe(true);
    expect(isRetryableErrorCode('UPSTREAM_TIMEOUT')).toBe(true);
    expect(isRetryableErrorCode('RATE_LIMITED')).toBe(true);
  });
});

describe('toFieldErrors', () => {
  it('aplatit les chemins imbriqués en notation pointée', () => {
    const schema = z.object({ team: z.object({ name: z.string().min(2) }) });
    const result = schema.safeParse({ team: { name: 'x' } });

    expect(result.success).toBe(false);
    if (result.success) return;

    const fields = toFieldErrors(result.error);

    expect(fields[0]?.path).toBe('team.name');
    expect(fields[0]?.message).toBeTypeOf('string');
  });
});

describe('isApiError', () => {
  it('accepte une enveloppe valide et rejette le reste', () => {
    expect(isApiError(buildApiError('CONFLICT', 'Conflit.'))).toBe(true);
    expect(isApiError({ message: 'boom' })).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
