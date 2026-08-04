import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('rend un bouton accessible par son libellé', () => {
    render(<Button>Regarder le direct</Button>);

    expect(screen.getByRole('button', { name: 'Regarder le direct' })).toBeInTheDocument();
  });

  it('déclenche onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Suivre</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Suivre' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('est activable au clavier', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Suivre</Button>);

    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('ne déclenche pas onClick quand il est désactivé', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Suivre
      </Button>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  describe('état de chargement', () => {
    it('désactive le bouton et annonce l’attente', () => {
      render(<Button loading>Publier</Button>);
      const button = screen.getByRole('button');

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('conserve le libellé visible pour éviter le saut de largeur', () => {
      render(<Button loading>Publier</Button>);

      expect(screen.getByRole('button')).toHaveTextContent('Publier');
    });

    it('expose un libellé de chargement aux lecteurs d’écran', () => {
      render(
        <Button loading loadingLabel="Publication en cours">
          Publier
        </Button>,
      );

      expect(screen.getByText('Publication en cours')).toBeInTheDocument();
    });

    it('bloque le clic pendant le chargement', async () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Publier
        </Button>,
      );

      await userEvent.click(screen.getByRole('button'));

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('asChild', () => {
    it('rend l’enfant à la place du bouton, sans imbriquer button dans a', () => {
      render(
        <Button asChild>
          <a href="/clubs">Explorer les clubs</a>
        </Button>,
      );

      const link = screen.getByRole('link', { name: 'Explorer les clubs' });

      expect(link).toBeInTheDocument();
      expect(link.tagName).toBe('A');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('transmet les styles de variante à l’enfant', () => {
      render(
        <Button asChild variant="gradient">
          <a href="/live">Direct</a>
        </Button>,
      );

      expect(screen.getByRole('link')).toHaveClass('bg-gradient-brand');
    });
  });

  it('laisse la prop className surcharger la variante', () => {
    render(<Button className="bg-destructive">Supprimer</Button>);

    const button = screen.getByRole('button');

    expect(button).toHaveClass('bg-destructive');
    expect(button).not.toHaveClass('bg-primary');
  });

  it('applique la taille demandée', () => {
    render(<Button size="xl">Commencer</Button>);

    expect(screen.getByRole('button')).toHaveClass('h-14');
  });
});
