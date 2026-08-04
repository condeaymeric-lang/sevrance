import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

/** jsdom n'implémente pas `matchMedia`, interrogé par `next-themes` au montage. */
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

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

Object.defineProperty(window, 'ResizeObserver', { writable: true, value: ResizeObserverStub });

if (typeof window.HTMLElement.prototype.hasPointerCapture !== 'function') {
  window.HTMLElement.prototype.hasPointerCapture = (): boolean => false;
  window.HTMLElement.prototype.setPointerCapture = (): void => {};
  window.HTMLElement.prototype.releasePointerCapture = (): void => {};
}

window.HTMLElement.prototype.scrollIntoView = (): void => {};

/**
 * `next/navigation` lève une erreur hors du routeur App.
 * Ce doublon permet de tester des composants qui lisent le chemin courant —
 * la navigation principale, par exemple — sans monter un routeur complet.
 */
vi.mock('next/navigation', () => ({
  usePathname: (): string => '/',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));
