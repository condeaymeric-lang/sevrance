'use client';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../lib/cn';

const avatarVariants = cva(
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

/**
 * Extrait les initiales d'un nom, pour le repli d'avatar.
 *
 * @param name Nom complet, par exemple « Amélie Dubois ».
 * @param max Nombre maximum d'initiales.
 *
 * @example
 * initials('Amélie Dubois')  // 'AD'
 * initials('FC Saint-Denis') // 'FS'
 */
export function initials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, max)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export { avatarVariants };
