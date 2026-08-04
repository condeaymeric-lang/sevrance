import { describe, expect, it } from 'vitest';

import { emailSchema, slugify, slugSchema } from './primitives';

describe('slugify', () => {
  it('met en minuscules et remplace les séparateurs par des tirets', () => {
    expect(slugify('FC Saint-Denis  Olympique !')).toBe('fc-saint-denis-olympique');
  });

  it('retire les accents plutôt que de les remplacer par des tirets', () => {
    expect(slugify('Béziers Rugby')).toBe('beziers-rugby');
    expect(slugify('Cœur de Ville')).toBe('c-ur-de-ville');
  });

  it('supprime les tirets de tête et de queue', () => {
    expect(slugify('  --Handball 92--  ')).toBe('handball-92');
  });

  it('renvoie une chaîne vide quand rien n’est exploitable', () => {
    expect(slugify('!!!')).toBe('');
    expect(slugify('')).toBe('');
  });

  it('tronque à 80 caractères sans laisser de tiret final', () => {
    const result = slugify('a'.repeat(60) + ' ' + 'b'.repeat(40));

    expect(result.length).toBeLessThanOrEqual(80);
    expect(result.endsWith('-')).toBe(false);
  });

  it('produit toujours un slug accepté par slugSchema', () => {
    const inputs = ['FC Saint-Denis', 'Béziers Rugby', 'US   Créteil 94', 'AS-Monaco'];

    for (const input of inputs) {
      expect(slugSchema.safeParse(slugify(input)).success).toBe(true);
    }
  });
});

describe('slugSchema', () => {
  it('refuse les majuscules, les espaces et les tirets doublés', () => {
    for (const invalid of ['FC-Paris', 'fc paris', 'fc--paris', '-fc', 'fc-', 'a']) {
      expect(slugSchema.safeParse(invalid).success).toBe(false);
    }
  });
});

describe('emailSchema', () => {
  it('normalise la casse pour rendre l’unicité fiable', () => {
    expect(emailSchema.parse('Coach@Matchly.APP')).toBe('coach@matchly.app');
  });

  it('refuse une adresse malformée', () => {
    expect(emailSchema.safeParse('coach@').success).toBe(false);
  });
});
