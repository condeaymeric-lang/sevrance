import type * as React from 'react';

import { cn } from '../lib/cn';

export interface SpinnerProps extends React.ComponentProps<'svg'> {
  /** Libellé annoncé aux lecteurs d'écran. `null` rend le spinner décoratif. */
  label?: string | null;
}

/**
 * Indicateur de chargement indéterminé.
 *
 * Le SVG est inline plutôt qu'importé de `lucide-react` : c'est le composant le
 * plus fréquemment monté de l'application (chaque bouton, chaque suspense), et
 * l'inliner évite de charger une icône supplémentaire sur le chemin critique.
 *
 * @example
 * <Spinner label="Chargement des matchs" />
 */
export function Spinner({ className, label = null, ...props }: SpinnerProps) {
  const decorative = label === null;

  return (
    <svg
      data-slot="spinner"
      className={cn('size-4 animate-spin text-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
