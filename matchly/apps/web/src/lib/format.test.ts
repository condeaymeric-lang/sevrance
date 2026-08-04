import { describe, expect, it } from 'vitest';

import { formatCompact, formatDay, formatTime } from './format';

describe('formatTime', () => {
  it('formate en heure de Paris, pas en UTC', () => {
    // 13:00 UTC en août = 15:00 à Paris (UTC+2). Si ce test passait à 13:00,
    // le fuseau ne serait pas figé et le rendu serveur divergerait du client.
    expect(formatTime('2026-08-04T13:00:00.000Z')).toBe('15:00');
  });

  it('gère le passage à l’heure d’hiver', () => {
    // 13:00 UTC en janvier = 14:00 à Paris (UTC+1).
    expect(formatTime('2026-01-15T13:00:00.000Z')).toBe('14:00');
  });

  it('produit un résultat stable d’un appel à l’autre', () => {
    const iso = '2026-08-04T17:30:00.000Z';

    expect(formatTime(iso)).toBe(formatTime(iso));
  });
});

describe('formatDay', () => {
  it('formate le jour en français', () => {
    const result = formatDay('2026-08-04T13:00:00.000Z');

    expect(result).toContain('août');
    expect(result).toContain('4');
  });

  it('utilise le fuseau de Paris pour choisir le jour', () => {
    // 23:30 UTC le 4 août = 01:30 le 5 août à Paris : le jour affiché doit
    // être le 5, pas le 4.
    expect(formatDay('2026-08-04T23:30:00.000Z')).toContain('5');
  });
});

describe('formatCompact', () => {
  it('affiche les petits nombres tels quels', () => {
    expect(formatCompact(0)).toBe('0');
    expect(formatCompact(999)).toBe('999');
  });

  it('abrège les milliers avec une décimale sous 10 000', () => {
    expect(formatCompact(1_240)).toBe('1,2 k');
  });

  it('abandonne la décimale au-delà de 10 000', () => {
    expect(formatCompact(12_400)).toBe('12 k');
  });

  it('abrège les millions', () => {
    expect(formatCompact(1_500_000)).toBe('1,5 M');
  });

  it('utilise la virgule décimale française', () => {
    expect(formatCompact(1_240)).not.toContain('.');
    expect(formatCompact(1_500_000)).not.toContain('.');
  });
});
