import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../lib/cn';

const cardVariants = cva('rounded-2xl text-card-foreground transition-all duration-300', {
  variants: {
    variant: {
      /** Surface par défaut : bordée, posée sur le fond. */
      default: 'border border-border bg-card shadow-sm',
      /** Surface flottante, pour les éléments mis en avant. */
      elevated: 'border border-border bg-card shadow-lg',
      /** Sans bordure ni ombre : pour composer une grille dense. */
      flat: 'bg-card',
      /** Vitrée : à réserver aux surcouches posées sur une image ou une vidéo. */
      glass: 'border border-white/10 glass shadow-lg',
      /** Bordure dégradée, pour l'offre ou le plan recommandé. */
      brand: 'border-gradient-brand bg-card shadow-md',
    },
    interactive: {
      /**
       * Carte cliquable. Le `focus-within` reproduit l'état de survol au
       * clavier : sans lui, un utilisateur qui tabule ne verrait jamais l'état
       * actif de la carte, seulement celui du lien qu'elle contient.
       */
      true: 'cursor-pointer focus-within:-translate-y-1 focus-within:border-violet-500/40 focus-within:shadow-lg hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    interactive: false,
  },
});

export interface CardProps extends React.ComponentProps<'div'>, VariantProps<typeof cardVariants> {}

/**
 * Conteneur de contenu — brique de composition la plus utilisée de Matchly
 * (vignette de match, fiche de club, panneau de statistiques).
 *
 * @example
 * <Card interactive>
 *   <CardHeader>
 *     <CardTitle>FC Saint-Denis</CardTitle>
 *     <CardDescription>Football · Île-de-France</CardDescription>
 *   </CardHeader>
 *   <CardContent>…</CardContent>
 * </Card>
 */
export function Card({ className, variant, interactive, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, interactive }), className)}
      {...props}
    />
  );
}

/** En-tête de carte : titre, description et actions éventuelles. */
export function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-1.5 p-6', className)}
      {...props}
    />
  );
}

/**
 * Titre de carte.
 *
 * Rendu en `<h3>` par défaut : la hiérarchie de titres d'une page doit rester
 * continue pour la navigation par titres des lecteurs d'écran. Utilisez `as`
 * si le contexte impose un autre niveau.
 */
export function CardTitle({
  className,
  as: Component = 'h3',
  ...props
}: React.ComponentProps<'h3'> & { as?: 'h2' | 'h3' | 'h4' | 'div' }) {
  return (
    <Component
      data-slot="card-title"
      className={cn('text-lg leading-tight font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

/** Texte secondaire de l'en-tête. */
export function CardDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Corps de la carte. */
export function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-6 pt-0', className)} {...props} />;
}

/** Pied de carte, généralement réservé aux actions. */
export function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-3 p-6 pt-0', className)}
      {...props}
    />
  );
}

export { cardVariants };
