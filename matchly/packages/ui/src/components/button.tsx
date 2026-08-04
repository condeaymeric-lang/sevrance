'use client';

import { Slot, Slottable } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../lib/cn';
import { buttonVariants } from '../variants';
import { Spinner } from './spinner';

export interface ButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /**
   * Rend le composant enfant à la place d'un `<button>`, en lui transmettant
   * styles et comportement. Indispensable pour styler un `<Link>` Next sans
   * imbriquer un bouton dans une ancre — ce qui produirait du HTML invalide et
   * un ordre de tabulation cassé.
   */
  asChild?: boolean;
  /**
   * Affiche un indicateur de chargement et désactive le bouton.
   * Le libellé reste monté pour que la largeur ne saute pas pendant l'attente.
   */
  loading?: boolean;
  /** Texte annoncé aux lecteurs d'écran pendant le chargement. */
  loadingLabel?: string;
}

/**
 * Bouton — primitive d'action du Design System.
 *
 * @example
 * <Button variant="gradient" size="lg">Regarder le direct</Button>
 *
 * @example Rendu comme un lien Next.js
 * <Button asChild variant="outline">
 *   <Link href="/clubs">Explorer les clubs</Link>
 * </Button>
 */
export function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  loading = false,
  loadingLabel = 'Chargement en cours',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      data-slot="button"
      data-loading={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner className="size-4" aria-hidden /> : null}
      {loading ? <span className="sr-only">{loadingLabel}</span> : null}
      {/*
       * `Slottable` désigne l'enfant sur lequel `Slot` doit se greffer.
       * Sans lui, `asChild` reçoit trois enfants (les deux emplacements de
       * chargement, même rendus `null`, comptent) et `Slot` lève une erreur.
       * Il permet en prime au spinner de rester rendu à l'intérieur de
       * l'élément fourni. Hors `asChild`, il se contente de rendre ses enfants.
       */}
      <Slottable>{children}</Slottable>
    </Component>
  );
}

export { buttonVariants };
