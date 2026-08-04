'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import type * as React from 'react';

import { cn } from '../lib/cn';

/**
 * Interrupteur binaire, à effet immédiat.
 *
 * À utiliser quand le changement s'applique tout de suite (activer les
 * notifications, passer en thème sombre). Si l'état ne prend effet qu'après
 * validation d'un formulaire, une case à cocher est le bon composant : un
 * interrupteur promet un effet instantané qu'un formulaire ne tient pas.
 *
 * @example
 * <div className="flex items-center gap-3">
 *   <Switch id="notify" checked={enabled} onCheckedChange={setEnabled} />
 *   <Label htmlFor="notify">Alertes de match</Label>
 * </div>
 */
export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent',
        'transition-colors duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-0',
          'transition-transform duration-200 ease-out',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  );
}
