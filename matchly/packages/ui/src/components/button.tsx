'use client';

import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../lib/cn';
import { Spinner } from './spinner';

/**
 * Variantes du bouton Matchly.
 *
 * `active:scale-[0.98]` est appliqué à toutes les variantes : ce très léger
 * enfoncement au clic est ce qui donne la sensation « native » recherchée. Il
 * est neutralisé automatiquement sous `prefers-reduced-motion` par la règle
 * globale de `tokens.css`.
 */
const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'rounded-lg text-sm font-medium',
    'transition-all duration-200 ease-out',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        /** Action principale d'un écran. Une seule par vue. */
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:shadow-md',
        /**
         * Action héroïque : dégradé de marque. Réservée aux appels à l'action
         * majeurs (landing, onboarding). En abuser dilue l'identité.
         */
        gradient:
          'bg-gradient-brand bg-[length:200%_200%] text-white shadow-md hover:bg-[position:100%_50%] hover:shadow-glow',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline:
          'border border-border bg-transparent hover:bg-secondary hover:text-secondary-foreground',
        ghost: 'bg-transparent hover:bg-secondary hover:text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        sm: 'h-8 gap-1.5 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-base font-semibold',
        icon: 'size-10',
        'icon-sm': 'size-8',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
);

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
