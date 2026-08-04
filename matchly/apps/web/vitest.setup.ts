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

/**
 * jsdom n'implémente pas `IntersectionObserver`, dont Framer Motion se sert
 * pour `whileInView`. Le doublon signale immédiatement l'intersection : les
 * composants révélés au défilement sont donc testés dans leur état final,
 * qui est celui que l'utilisateur finit par voir.
 */
class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as IntersectionObserver,
    );
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
});
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverStub,
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
