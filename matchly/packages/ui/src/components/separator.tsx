'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import type * as React from 'react';

import { cn } from '../lib/cn';

/**
 * Trait de séparation.
 *
 * `decorative` vaut `true` par défaut : le séparateur sort alors de l'arbre
 * d'accessibilité. C'est presque toujours le bon choix — un trait purement
 * visuel n'a rien à annoncer. Passez `decorative={false}` uniquement quand le
 * trait marque une vraie frontière sémantique entre deux groupes de contenu.
 *
 * @example
 * <Separator className="my-6" />
 * <Separator orientation="vertical" className="h-6" />
 */
export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}
