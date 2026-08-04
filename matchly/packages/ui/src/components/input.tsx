import type * as React from 'react';

import { cn } from '../lib/cn';

export interface InputProps extends React.ComponentProps<'input'> {
  /**
   * Marque le champ comme invalide.
   *
   * Pose `aria-invalid`, que le style cible ensuite via `aria-invalid:*`. La
   * couleur n'est donc jamais le seul signal d'erreur — condition du critère
   * WCAG 1.4.1, qui interdit de véhiculer une information par la seule couleur.
   */
  invalid?: boolean;
}

/**
 * Champ de saisie du Design System.
 *
 * Toujours associé à un {@link Label} par `id`/`htmlFor` : un champ sans
 * étiquette programmatique est inutilisable au lecteur d'écran, même si un
 * texte est visuellement placé à côté.
 *
 * @example
 * <div className="space-y-2">
 *   <Label htmlFor="email">Adresse email</Label>
 *   <Input id="email" type="email" autoComplete="email" />
 * </div>
 */
export function Input({
  className,
  type = 'text',
  invalid,
  'aria-invalid': ariaInvalid,
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      aria-invalid={invalid === true ? true : ariaInvalid}
      className={cn(
        'flex h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm',
        'transition-[color,box-shadow,border-color] duration-200',
        'placeholder:text-muted-foreground',
        'file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/40',
        // Neutralise le fond jaune de l'autofill Chrome, illisible en thème sombre.
        'autofill:shadow-[inset_0_0_0_1000px_var(--color-background)]',
        className,
      )}
      {...props}
    />
  );
}
