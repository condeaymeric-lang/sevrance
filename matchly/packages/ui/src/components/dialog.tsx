'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type * as React from 'react';

import { cn } from '../lib/cn';

/**
 * Boîte de dialogue modale.
 *
 * Radix prend en charge le piège de focus, la restauration du focus à la
 * fermeture, `aria-modal`, la fermeture par Échap et l'inertie du fond. Ces
 * comportements sont non négociables (WCAG 2.1.2 « pas de piège au clavier »)
 * et représentent l'essentiel du coût réel d'une modale correcte.
 *
 * @example
 * <Dialog>
 *   <DialogTrigger asChild><Button>Créer un club</Button></DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Créer un club</DialogTitle>
 *       <DialogDescription>Renseignez les informations de base.</DialogDescription>
 *     </DialogHeader>
 *     …
 *   </DialogContent>
 * </Dialog>
 */
export function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

export function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

export function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/** Voile assombrissant le fond. */
export function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
        'data-[state=open]:animate-[fade-in_0.2s_ease-out_both]',
        className,
      )}
      {...props}
    />
  );
}

export interface DialogContentProps extends React.ComponentProps<typeof DialogPrimitive.Content> {
  /** Masque la croix de fermeture. Le dialogue doit alors offrir une autre sortie. */
  hideCloseButton?: boolean;
  /** Libellé accessible du bouton de fermeture. */
  closeLabel?: string;
}

/** Panneau du dialogue. */
export function DialogContent({
  className,
  children,
  hideCloseButton = false,
  closeLabel = 'Fermer',
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'grid w-[calc(100vw-2rem)] max-w-lg gap-4',
          'rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-xl',
          // Sur un très petit écran, le contenu doit pouvoir défiler dans la modale.
          'max-h-[calc(100dvh-2rem)] overflow-y-auto',
          'data-[state=open]:animate-[scale-in_0.2s_var(--ease-out-expo)_both]',
          className,
        )}
        {...props}
      >
        {children}

        {hideCloseButton ? null : (
          <DialogPrimitive.Close
            className={cn(
              'absolute top-4 right-4 rounded-md p-1 text-muted-foreground opacity-70',
              'transition-opacity hover:opacity-100',
              'outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:pointer-events-none',
            )}
          >
            <X className="size-4" aria-hidden />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-1.5 pr-8 text-left', className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

/**
 * Titre du dialogue.
 *
 * Obligatoire : Radix l'associe au conteneur via `aria-labelledby`, et c'est ce
 * titre que le lecteur d'écran annonce à l'ouverture. S'il doit rester
 * invisible, enveloppez-le dans `VisuallyHidden` plutôt que de l'omettre.
 */
export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}
