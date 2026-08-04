import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Reveal } from './reveal';

describe('Reveal', () => {
  it('rend son contenu', () => {
    render(<Reveal>Contenu visible</Reveal>);

    expect(screen.getByText('Contenu visible')).toBeInTheDocument();
  });

  it('n’émet jamais d’opacité nulle en ligne', () => {
    // Régression : la version pilotée par Framer Motion émettait
    // `opacity: 0` côté serveur. React ne retirant pas un attribut `style`
    // présent dans le HTML serveur et absent du rendu client, le contenu
    // restait invisible pour les utilisateurs ayant demandé moins
    // d'animations. L'état masqué appartient désormais à une règle CSS placée
    // sous `@media (prefers-reduced-motion: no-preference)`.
    const { container } = render(<Reveal>Contenu</Reveal>);

    expect(container.firstElementChild?.getAttribute('style') ?? '').not.toMatch(/opacity/);
  });

  it('marque l’élément pour la règle CSS de révélation', () => {
    const { container } = render(<Reveal>Contenu</Reveal>);

    expect(container.firstElementChild).toHaveAttribute('data-reveal');
  });

  it('expose le délai sous forme de variable CSS', () => {
    const { container } = render(<Reveal delay={0.3}>Contenu</Reveal>);

    expect(container.firstElementChild?.getAttribute('style')).toContain('--reveal-delay: 0.3s');
  });

  it('n’ajoute aucun style quand le délai est nul', () => {
    const { container } = render(<Reveal>Contenu</Reveal>);

    expect(container.firstElementChild?.hasAttribute('style')).toBe(false);
  });

  it('rend la balise demandée', () => {
    const { container } = render(<Reveal as="li">Élément</Reveal>);

    expect(container.firstElementChild?.tagName).toBe('LI');
  });

  it('transmet la classe reçue', () => {
    const { container } = render(<Reveal className="ma-classe">Contenu</Reveal>);

    expect(container.firstElementChild).toHaveClass('ma-classe');
  });
});
