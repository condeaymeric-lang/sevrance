import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { formatViewerCount, LiveBadge } from './live-badge';

describe('formatViewerCount', () => {
  it('affiche les petits nombres tels quels', () => {
    expect(formatViewerCount(0)).toBe('0');
    expect(formatViewerCount(999)).toBe('999');
  });

  it('abrège les milliers avec une décimale sous 10 000', () => {
    expect(formatViewerCount(1_240)).toBe('1,2 k');
    expect(formatViewerCount(9_900)).toBe('9,9 k');
  });

  it('abandonne la décimale au-delà de 10 000, où elle n’apporte rien', () => {
    expect(formatViewerCount(12_400)).toBe('12 k');
    expect(formatViewerCount(999_000)).toBe('999 k');
  });

  it('abrège les millions', () => {
    expect(formatViewerCount(1_500_000)).toBe('1,5 M');
  });

  it('utilise la virgule décimale française', () => {
    expect(formatViewerCount(1_240)).not.toContain('.');
  });
});

describe('LiveBadge', () => {
  it('affiche le libellé « En direct » par défaut', () => {
    render(<LiveBadge />);

    expect(screen.getByText('En direct')).toBeInTheDocument();
  });

  it('masque le compteur quand aucun spectateur n’est fourni', () => {
    render(<LiveBadge />);

    expect(screen.queryByText(/Spectateurs/)).not.toBeInTheDocument();
  });

  it('annonce le compteur de spectateurs aux lecteurs d’écran', () => {
    render(<LiveBadge viewerCount={1_240} />);

    expect(screen.getByText('Spectateurs :')).toBeInTheDocument();
    expect(screen.getByText('1,2 k')).toBeInTheDocument();
  });

  it('met à jour le compteur en région polie, sans interrompre la lecture', () => {
    const { container } = render(<LiveBadge viewerCount={42} />);

    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull();
  });

  it('accepte un libellé personnalisé pour l’internationalisation', () => {
    render(<LiveBadge label="Live" />);

    expect(screen.getByText('Live')).toBeInTheDocument();
  });
});
