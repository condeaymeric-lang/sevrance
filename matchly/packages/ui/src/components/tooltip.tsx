'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type * as React from 'react';

import { cn } from '../lib/cn';

/**
 * Fournisseur de tooltips.
 *
 * À monter une seule fois, haut dans l'arbre : il mutualise le délai
 * d'ouverture entre tous les tooltips, ce qui permet à un survol rapide d'une
 * barre d'outils d'afficher les infobulles instantanément après la première.
 */
export function TooltipProvider({
  delayDuration = 200,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

/**
 * Infobulle.
 *
 * Une infobulle ne doit jamais porter une information indispensable : elle est
 * inaccessible au tactile, où il n'existe pas de survol. Le contenu critique va
 * dans la page ; le tooltip ne fait que préciser.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <Button size="icon" variant="ghost" aria-label="Partager"><Share2 /></Button>
 *   </TooltipTrigger>
 *   <TooltipContent>Partager le match</TooltipContent>
 * </Tooltip>
 */
export function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

export function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-fit max-w-xs rounded-lg bg-foreground px-2.5 py-1.5',
          'text-xs text-balance text-background shadow-md',
          'animate-[scale-in_0.15s_var(--ease-out-expo)_both]',
          'data-[state=closed]:animate-none data-[state=closed]:opacity-0',
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_1px)] rotate-45 rounded-[2px] fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
