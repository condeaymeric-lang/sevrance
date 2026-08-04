'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import type * as React from 'react';

import { cn } from '../lib/cn';

const sheetVariants = cva(
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

/**
 * Panneau latéral coulissant.
 *
 * Construit sur la primitive Dialog, dont il hérite le piège de focus et
 * l'inertie du fond. C'est le support de la navigation mobile de Matchly, et le
 * conteneur des panneaux de filtres sur les pages de recherche.
 *
 * @example
 * <Sheet>
 *   <SheetTrigger asChild>
 *     <Button size="icon" variant="ghost" aria-label="Ouvrir le menu"><Menu /></Button>
 *   </SheetTrigger>
 *   <SheetContent side="right">
 *     <SheetHeader><SheetTitle>Navigation</SheetTitle></SheetHeader>
 *     …
 *   </SheetContent>
 * </Sheet>
 */
export function Sheet(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" {...props} />;
}

export function SheetTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

export function SheetClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="sheet-close" {...props} />;
}

export interface SheetContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content>, VariantProps<typeof sheetVariants> {
  closeLabel?: string;
}

export function SheetContent({
  className,
  side = 'right',
  children,
  closeLabel = 'Fermer',
  ...props
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
          'data-[state=open]:animate-[fade-in_0.2s_ease-out_both]',
        )}
      />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}

        <DialogPrimitive.Close
          className={cn(
            'absolute top-4 right-4 rounded-md p-1 text-muted-foreground opacity-70',
            'transition-opacity hover:opacity-100',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <X className="size-4" aria-hidden />
          <span className="sr-only">{closeLabel}</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 border-b border-border p-6 pr-12', className)}
      {...props}
    />
  );
}

export function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-body"
      className={cn('flex-1 overflow-y-auto px-6 py-4', className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn('mt-auto flex flex-col gap-2 border-t border-border p-6', className)}
      {...props}
    />
  );
}

/** Titre du panneau. Obligatoire pour l'accessibilité — voir `DialogTitle`. */
export function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { sheetVariants };
