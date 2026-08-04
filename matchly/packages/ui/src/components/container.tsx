import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../lib/cn';

const containerVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      /** Largeur de référence des pages Matchly. */
      lg: 'max-w-7xl',
      xl: 'max-w-[90rem]',
      full: 'max-w-none',
    },
    padded: {
      true: 'px-4 sm:px-6 lg:px-8',
      false: '',
    },
  },
  defaultVariants: {
    size: 'lg',
    padded: true,
  },
});

export interface ContainerProps
  extends React.ComponentProps<'div'>, VariantProps<typeof containerVariants> {
  as?: 'div' | 'section' | 'header' | 'footer' | 'main' | 'nav';
}

/**
 * Conteneur centré à largeur maximale.
 *
 * Toute la mise en page horizontale de Matchly passe par ce composant. La
 * gouttière est définie une seule fois ici : sans cela, chaque section
 * réinvente ses `px-*` et les bords finissent désalignés d'une section à
 * l'autre — le défaut de finition le plus visible sur un site vitrine.
 *
 * @example
 * <Container as="section" size="lg">…</Container>
 */
export function Container({
  className,
  size,
  padded,
  as: Component = 'div',
  ...props
}: ContainerProps) {
  return (
    <Component
      data-slot="container"
      className={cn(containerVariants({ size, padded }), className)}
      {...props}
    />
  );
}

const sectionVariants = cva('relative w-full', {
  variants: {
    spacing: {
      none: '',
      sm: 'py-12 sm:py-16',
      md: 'py-16 sm:py-20 lg:py-24',
      lg: 'py-20 sm:py-28 lg:py-32',
    },
  },
  defaultVariants: {
    spacing: 'md',
  },
});

export interface SectionProps
  extends React.ComponentProps<'section'>, VariantProps<typeof sectionVariants> {}

/**
 * Section de page, avec le rythme vertical standard.
 *
 * Le rythme est fluide (`py-16 → py-24`) plutôt que fixe : sur mobile, un
 * espacement conçu pour le bureau consomme la moitié de l'écran en blanc.
 *
 * @example
 * <Section spacing="lg"><Container>…</Container></Section>
 */
export function Section({ className, spacing, ...props }: SectionProps) {
  return (
    <section
      data-slot="section"
      className={cn(sectionVariants({ spacing }), className)}
      {...props}
    />
  );
}

export { containerVariants, sectionVariants };
