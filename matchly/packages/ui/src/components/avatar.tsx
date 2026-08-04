'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../lib/cn';
import { avatarVariants } from '../variants';

export interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>, VariantProps<typeof avatarVariants> {}

/**
 * Conteneur d'avatar.
 *
 * Radix gère le cycle de chargement de l'image et bascule sur le repli si elle
 * échoue : indispensable ici, où les photos de profil sont téléversées par les
 * utilisateurs et où une URL morte ne doit jamais laisser un trou dans la page.
 *
 * @example
 * <Avatar size="lg" ring="live">
 *   <AvatarImage src={user.avatarUrl} alt="" />
 *   <AvatarFallback>{initials(user.name)}</AvatarFallback>
 * </Avatar>
 */
export function Avatar({ className, size, ring, ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size, ring }), className)}
      {...props}
    />
  );
}

/**
 * Image de l'avatar.
 *
 * `alt=""` est le bon choix quand le nom de la personne est déjà écrit à côté :
 * répéter ce nom dans l'alternative textuelle le ferait annoncer deux fois.
 */
export function AvatarImage({
  className,
  alt = '',
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      alt={alt}
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  );
}

/** Repli affiché tant que l'image n'est pas chargée, ou si elle échoue. */
export function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full',
        'bg-gradient-brand-soft font-medium text-foreground uppercase',
        className,
      )}
      {...props}
    />
  );
}

export { avatarVariants };
