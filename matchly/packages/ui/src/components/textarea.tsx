import type * as React from 'react';

import { cn } from '../lib/cn';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
  /** Marque le champ comme invalide (pose `aria-invalid`). */
  invalid?: boolean;
}

/**
 * Zone de saisie multiligne.
 *
 * `field-sizing-content` laisse le navigateur adapter la hauteur au contenu
 * sans JavaScript ; `min-h` garantit une cible de saisie confortable là où la
 * propriété n'est pas encore supportée.
 *
 * @example
 * <Textarea placeholder="Racontez le match…" rows={4} />
 */
export function Textarea({
  className,
  invalid,
  'aria-invalid': ariaInvalid,
  ...props
}: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={invalid === true ? true : ariaInvalid}
      className={cn(
        'flex field-sizing-content min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm',
        'transition-[color,box-shadow,border-color] duration-200',
        'placeholder:text-muted-foreground',
        'outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/40',
        className,
      )}
      {...props}
    />
  );
}
