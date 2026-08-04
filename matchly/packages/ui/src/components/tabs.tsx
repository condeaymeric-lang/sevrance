'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type * as React from 'react';

import { cn } from '../lib/cn';

/**
 * Onglets — navigation entre vues d'un même contexte.
 *
 * Radix implémente le motif ARIA « tabs » complet : flèches directionnelles,
 * Home/Fin, et association `aria-controls` entre chaque onglet et son panneau.
 * Reproduire cela à la main est la source d'erreur d'accessibilité la plus
 * fréquente sur ce composant, d'où le recours à la primitive.
 *
 * @example
 * <Tabs defaultValue="resume">
 *   <TabsList>
 *     <TabsTrigger value="resume">Résumé</TabsTrigger>
 *     <TabsTrigger value="stats">Statistiques</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="resume">…</TabsContent>
 *   <TabsContent value="stats">…</TabsContent>
 * </Tabs>
 */
export function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
}

/** Barre d'onglets. Défile horizontalement plutôt que de passer à la ligne. */
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex w-fit max-w-full items-center justify-start gap-1 overflow-x-auto',
        'rounded-xl bg-muted p-1 text-muted-foreground',
        // Masque la barre de défilement : le débordement reste tactile mais discret.
        '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    />
  );
}

/** Déclencheur d'un onglet. */
export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5',
        'text-sm font-medium whitespace-nowrap',
        'transition-all duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

/** Panneau associé à un onglet. */
export function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'flex-1 outline-none',
        'data-[state=active]:animate-[fade-in_0.3s_var(--ease-out-quart)_both]',
        className,
      )}
      {...props}
    />
  );
}
