import { toFieldErrors } from '@matchly/contracts';
import { type ArgumentMetadata, HttpStatus, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

import { DomainException } from './all-exceptions.filter';

/**
 * Valide une charge utile entrante avec un schéma Zod.
 *
 * Matchly valide avec Zod plutôt qu'avec `class-validator`, choix par défaut de
 * NestJS, pour une raison structurante : les schémas Zod vivent dans
 * `@matchly/contracts` et sont partagés avec le frontend. Le formulaire React
 * applique donc exactement les règles que l'API appliquera — au lieu de deux
 * jeux de règles qui divergent au premier oubli. `class-validator` reposant sur
 * des décorateurs de classe, il ne peut pas franchir la frontière réseau.
 *
 * Les erreurs sortent en `VALIDATION_FAILED` avec le détail par champ, ce que
 * React Hook Form rattache directement au bon champ du formulaire.
 *
 * @example
 * ⁣@Post()
 * create(@Body(new ZodValidationPipe(createClubSchema)) body: CreateClubInput) {}
 */
export class ZodValidationPipe<TSchema extends z.ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): z.infer<TSchema> {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new DomainException(
        'VALIDATION_FAILED',
        'Les données envoyées sont invalides.',
        HttpStatus.BAD_REQUEST,
        toFieldErrors(result.error),
      );
    }

    return result.data;
  }
}
