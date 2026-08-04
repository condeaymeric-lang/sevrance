import { describe, expect, it } from 'vitest';

import { mainNav } from '@/config/site';

import { isNavItemActive } from './main-nav';

describe('isNavItemActive', () => {
  it('marque l’entrée correspondant exactement au chemin', () => {
    expect(isNavItemActive('/clubs', '/clubs')).toBe(true);
  });

  it('garde l’entrée active en profondeur', () => {
    // Le repère de navigation doit survivre à la descente dans l'arborescence.
    expect(isNavItemActive('/clubs/fc-saint-denis', '/clubs')).toBe(true);
    expect(isNavItemActive('/clubs/fc-saint-denis/effectif', '/clubs')).toBe(true);
  });

  it('n’active pas une entrée sur une route seulement préfixée', () => {
    // `/clubsomething` ne fait pas partie de la section `/clubs`.
    expect(isNavItemActive('/clubsomething', '/clubs')).toBe(false);
  });

  it('traite la racine à part pour qu’elle ne soit pas toujours active', () => {
    expect(isNavItemActive('/', '/')).toBe(true);
    expect(isNavItemActive('/clubs', '/')).toBe(false);
  });

  it('n’active jamais deux entrées principales à la fois', () => {
    for (const path of ['/', '/live', '/clubs', '/competitions', '/replays', '/clubs/fc-paris']) {
      const activeCount = mainNav.filter((item) => isNavItemActive(path, item.href)).length;

      expect(activeCount).toBeLessThanOrEqual(1);
    }
  });
});

describe('mainNav', () => {
  it('reste limitée à quatre entrées', () => {
    // Au-delà, la barre déborde sur les écrans intermédiaires.
    expect(mainNav.length).toBeLessThanOrEqual(4);
  });

  it('n’expose que des chemins internes absolus', () => {
    for (const item of mainNav) {
      expect(item.href.startsWith('/')).toBe(true);
    }
  });

  it('ne contient pas de chemin en double', () => {
    const paths = mainNav.map((item) => item.href);

    expect(new Set(paths).size).toBe(paths.length);
  });
});
