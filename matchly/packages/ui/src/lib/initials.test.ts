import { describe, expect, it } from 'vitest';

import { initials } from './initials';

describe('initials', () => {
  it('prend la première lettre des deux premiers mots', () => {
    expect(initials('Amélie Dubois')).toBe('AD');
    expect(initials('FC Saint-Denis')).toBe('FS');
  });

  it('gère un nom d’un seul mot', () => {
    expect(initials('Ronaldinho')).toBe('R');
  });

  it('ignore les espaces multiples et les bords', () => {
    expect(initials('  Jean   Pierre  ')).toBe('JP');
  });

  it('respecte la limite demandée', () => {
    expect(initials('Jean Pierre Marie', 3)).toBe('JPM');
    expect(initials('Jean Pierre Marie', 1)).toBe('J');
  });

  it('renvoie une chaîne vide pour une entrée vide', () => {
    expect(initials('')).toBe('');
    expect(initials('   ')).toBe('');
  });

  it('met les initiales en majuscules', () => {
    expect(initials('jean dupont')).toBe('JD');
  });
});
