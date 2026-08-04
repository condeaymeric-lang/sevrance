import { HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { DomainException } from './all-exceptions.filter';
import { ZodValidationPipe } from './zod-validation.pipe';

const schema = z.object({
  name: z.string().min(2, 'Ce nom fait au moins 2 caractères.'),
  sport: z.enum(['football', 'rugby']),
});

const metadata = { type: 'body' } as const;

describe('ZodValidationPipe', () => {
  it('laisse passer une charge utile valide', () => {
    const pipe = new ZodValidationPipe(schema);

    expect(pipe.transform({ name: 'FC Paris', sport: 'football' }, metadata)).toEqual({
      name: 'FC Paris',
      sport: 'football',
    });
  });

  it('rejette une charge utile invalide en VALIDATION_FAILED', () => {
    const pipe = new ZodValidationPipe(schema);

    try {
      pipe.transform({ name: 'a', sport: 'football' }, metadata);
      expect.unreachable('la validation aurait dû échouer');
    } catch (error) {
      expect(error).toBeInstanceOf(DomainException);
      const domain = error as DomainException;

      expect(domain.code).toBe('VALIDATION_FAILED');
      expect(domain.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    }
  });

  it('rattache chaque message au chemin du champ fautif', () => {
    const pipe = new ZodValidationPipe(schema);

    try {
      pipe.transform({ name: 'a', sport: 'curling' }, metadata);
      expect.unreachable('la validation aurait dû échouer');
    } catch (error) {
      const paths = (error as DomainException).fields.map((field) => field.path);

      expect(paths).toContain('name');
      expect(paths).toContain('sport');
    }
  });

  it('applique les transformations du schéma', () => {
    // La normalisation faite par le schéma partagé doit atteindre le service.
    const pipe = new ZodValidationPipe(z.object({ email: z.email().toLowerCase() }));

    expect(pipe.transform({ email: 'Coach@Matchly.APP' }, metadata)).toEqual({
      email: 'coach@matchly.app',
    });
  });

  it('rejette une valeur nulle sans lever d’erreur non typée', () => {
    const pipe = new ZodValidationPipe(schema);

    expect(() => pipe.transform(null, metadata)).toThrowError(DomainException);
  });
});
