import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

/**
 * Démonte l'arbre React entre deux tests.
 *
 * Sans cela, les composants d'un test précédent restent dans le document et
 * `getByRole` peut renvoyer l'élément du mauvais test — un faux positif
 * particulièrement trompeur car il ne se manifeste qu'en suite complète.
 */
afterEach(() => {
  cleanup();
});

/**
 * jsdom n'implémente pas `matchMedia`, que Radix et `next-themes` interrogent au
 * montage. On fournit une implémentation minimale qui répond « aucune
 * correspondance » plutôt que de laisser lever une exception.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }),
});

/** Radix mesure ses flottants avec ResizeObserver, absent de jsdom. */
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
});

/** Idem pour l'API Pointer Events, utilisée par les menus et les dialogues. */
if (typeof window.HTMLElement.prototype.hasPointerCapture !== 'function') {
  window.HTMLElement.prototype.hasPointerCapture = (): boolean => false;
  window.HTMLElement.prototype.setPointerCapture = (): void => {};
  window.HTMLElement.prototype.releasePointerCapture = (): void => {};
}

/** jsdom ne sait pas faire défiler : neutralisé pour éviter le bruit en console. */
window.HTMLElement.prototype.scrollIntoView = (): void => {};
