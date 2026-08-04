import { cva } from 'class-variance-authority';

/**
 * Définitions de variantes des composants portant `'use client'`.
 *
 * Une définition `cva` est une donnée pure : des chaînes de classes CSS et une
 * table de correspondance. Rien n'y est interactif. Elle est pourtant piégée si
 * elle est déclarée dans un module `'use client'` — la directive s'applique au
 * module entier, et tout ce qu'il exporte devient une référence client. Styler
 * un lien rendu côté serveur avec `buttonVariants({ variant: 'outline' })`
 * échouerait alors au build, sans rapport apparent avec la ligne fautive.
 *
 * Les variantes des composants déjà neutres — Badge, Card, Container — restent
 * dans leur fichier : elles n'ont jamais posé le problème.
 */

/**
 * Variantes du bouton Matchly.
 *
 * `active:scale-[0.98]` est appliqué à toutes les variantes : ce très léger
 * enfoncement au clic est ce qui donne la sensation « native » recherchée. Il
 * est neutralisé automatiquement sous `prefers-reduced-motion` par la règle
 * globale de `tokens.css`.
 */
export const buttonVariants = cva(
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

/** Variantes de l'avatar : taille et anneau de statut. */
export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full bg-muted select-none',
  {
    variants: {
      size: {
        xs: 'size-6 text-[0.625rem]',
        sm: 'size-8 text-xs',
        md: 'size-10 text-sm',
        lg: 'size-14 text-base',
        xl: 'size-20 text-xl',
        '2xl': 'size-28 text-3xl',
      },
      ring: {
        none: '',
        /** Anneau de marque : signale un profil vérifié ou un club partenaire. */
        brand: 'ring-2 ring-violet-500 ring-offset-2 ring-offset-background',
        /** Anneau rouge : le profil diffuse en ce moment. */
        live: 'ring-2 ring-live ring-offset-2 ring-offset-background',
      },
    },
    defaultVariants: {
      size: 'md',
      ring: 'none',
    },
  },
);

/** Variantes du panneau coulissant : le côté d'où il entre. */
export const sheetVariants = cva(
  [
    'fixed z-50 flex flex-col gap-4 bg-popover text-popover-foreground shadow-xl',
    'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
  ],
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 h-auto max-h-[85dvh] border-b border-border data-[state=closed]:-translate-y-full',
        bottom:
          'inset-x-0 bottom-0 h-auto max-h-[85dvh] rounded-t-2xl border-t border-border data-[state=closed]:translate-y-full',
        left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-border data-[state=closed]:-translate-x-full',
        right:
          'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-border data-[state=closed]:translate-x-full',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
);
