import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('affiche le repli quand aucune image n’est fournie', () => {
    render(
      <Avatar>
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByText('AD')).toBeInTheDocument();
  });

  it('applique la taille demandée', () => {
    const { container } = render(
      <Avatar size="xl">
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>,
    );

    expect(container.querySelector('[data-slot="avatar"]')).toHaveClass('size-20');
  });

  it('applique l’anneau « direct »', () => {
    const { container } = render(
      <Avatar ring="live">
        <AvatarFallback>AD</AvatarFallback>
      </Avatar>,
    );

    expect(container.querySelector('[data-slot="avatar"]')).toHaveClass('ring-live');
  });
});
