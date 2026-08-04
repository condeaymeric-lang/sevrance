import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '../lib/cn';

const badgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1.5',
    'rounded-full border px-2.5 py-0.5 text-xs font-medium',
    'whitespace-nowrap transition-colors',
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        /** Teinte de marque, sur fond translucide : lisible dans les deux thèmes. */
        brand: 'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-300',
        accent: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

/**
 * Étiquette de statut ou de catégorie.
 *
 * Pour signaler un match en direct, utilisez {@link LiveBadge} : le badge doit
 * alors être animé et annoncé aux lecteurs d'écran, ce que cette primitive
 * neutre ne fait pas.
 *
 * @example
 * <Badge variant="brand">Football</Badge>
 */
export function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Component = asChild ? Slot : 'span';

  return (
    <Component data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
