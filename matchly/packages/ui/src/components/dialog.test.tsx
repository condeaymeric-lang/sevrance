import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';

function TestDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Créer un club</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un club</DialogTitle>
          <DialogDescription>Renseignez les informations de base.</DialogDescription>
        </DialogHeader>
        <Button>Valider</Button>
      </DialogContent>
    </Dialog>
  );
}

describe('Dialog', () => {
  it('reste fermé tant que le déclencheur n’est pas activé', () => {
    render(<TestDialog />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('s’ouvre au clic sur le déclencheur', async () => {
    render(<TestDialog />);

    await userEvent.click(screen.getByRole('button', { name: 'Créer un club' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('associe son titre au conteneur pour l’annonce à l’ouverture', async () => {
    render(<TestDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Créer un club' }));

    // Le nom accessible du dialogue provient du DialogTitle via aria-labelledby.
    expect(await screen.findByRole('dialog', { name: 'Créer un club' })).toBeInTheDocument();
  });

  it('se ferme avec la touche Échap', async () => {
    render(<TestDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Créer un club' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('expose un bouton de fermeture explicite', async () => {
    render(<TestDialog />);
    await userEvent.click(screen.getByRole('button', { name: 'Créer un club' }));

    const close = await screen.findByRole('button', { name: 'Fermer' });
    await userEvent.click(close);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('permet de masquer le bouton de fermeture', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent hideCloseButton>
          <DialogTitle>Étape obligatoire</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.queryByRole('button', { name: 'Fermer' })).not.toBeInTheDocument();
  });
});
