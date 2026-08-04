import type * as React from 'react';

import { cn } from '../lib/cn';

/**
 * Bloc de chargement.
 *
 * Le squelette reproduit la forme du contenu à venir pour éviter le décalage de
 * mise en page (CLS) au moment de l'hydratation — un des trois Core Web Vitals
 * que Matchly s'engage à tenir.
 *
 * Il est marqué `aria-hidden` : annoncer « chargement » sur chaque bloc
 * inonderait le lecteur d'écran. C'est au conteneur de porter un unique
 * `aria-busy` ou une région `aria-live`.
 *
 * @example
 * <div aria-busy>
 *   <Skeleton className="h-40 w-full rounded-2xl" />
 *   <Skeleton className="mt-3 h-4 w-2/3" />
 * </div>
 */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        'animate-pulse rounded-md bg-muted',
        // Reflet balayant : signale une attente active plutôt qu'un blocage.
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent',
        className,
      )}
      {...props}
    />
  );
}
