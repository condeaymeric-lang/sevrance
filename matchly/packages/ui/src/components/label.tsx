'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import type * as React from 'react';

import { cn } from '../lib/cn';

export interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  /** Ajoute l'astérisque de champ obligatoire, annoncée aux lecteurs d'écran. */
  required?: boolean;
}

/**
 * Étiquette de champ de formulaire.
 *
 * @example
 * <Label htmlFor="club-name" required>Nom du club</Label>
 */
export function Label({ className, required = false, children, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-1 text-sm leading-none font-medium select-none',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span className="text-destructive">
          <span aria-hidden>*</span>
          <span className="sr-only">(obligatoire)</span>
        </span>
      ) : null}
    </LabelPrimitive.Root>
  );
}
