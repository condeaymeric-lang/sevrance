import type * as React from 'react';

import { cn } from '../lib/cn';

export interface LiveBadgeProps extends React.ComponentProps<'span'> {
  /** Nombre de spectateurs simultanés. Masqué si absent. */
  viewerCount?: number;
  /** Libellé affiché. Personnalisable pour l'internationalisation. */
  label?: string;
}

/**
 * Formate un nombre de spectateurs de façon compacte.
 *
 * Au-delà de quelques milliers, le chiffre exact n'apporte rien et déstabilise
 * la mise en page à chaque mise à jour temps réel : `12,4 k` reste lisible et
 * garde une largeur stable.
 */
function formatViewerCount(count: number): string {
  if (count < 1_000) return String(count);
  if (count < 1_000_000)
    return `${(count / 1_000).toFixed(count < 10_000 ? 1 : 0)} k`.replace('.', ',');
  return `${(count / 1_000_000).toFixed(1)} M`.replace('.', ',');
}

/**
 * Badge « EN DIRECT » — composant de marque, pas une simple variante de Badge.
 *
 * Trois exigences le distinguent d'un badge ordinaire :
 *   - le rouge du direct est un token dédié (`--live`), jamais le rouge de
 *     danger : un match en cours n'est pas une erreur ;
 *   - le halo animé signale l'activité à la périphérie du regard, là où un
 *     badge statique passe inaperçu dans une grille de vignettes ;
 *   - le compteur de spectateurs est marqué `aria-live="polite"` pour que sa
 *     mise à jour temps réel soit perçue sans interrompre la lecture.
 *
 * @example
 * <LiveBadge viewerCount={1240} />
 */
export function LiveBadge({
  className,
  viewerCount,
  label = 'En direct',
  ...props
}: LiveBadgeProps) {
  return (
    <span
      data-slot="live-badge"
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full bg-live px-2.5 py-1',
        'text-xs font-semibold tracking-wide text-live-foreground uppercase',
        'shadow-sm',
        className,
      )}
      {...props}
    >
      <span className="relative flex size-2 items-center justify-center" aria-hidden>
        <span className="absolute inline-flex size-2 animate-[live-pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full bg-current" />
        <span className="relative inline-flex size-2 rounded-full bg-current" />
      </span>

      {label}

      {viewerCount !== undefined ? (
        <span
          className="ml-0.5 border-l border-current/30 pl-1.5 font-medium normal-case tabular-nums"
          aria-live="polite"
        >
          <span className="sr-only">Spectateurs : </span>
          {formatViewerCount(viewerCount)}
        </span>
      ) : null}
    </span>
  );
}

export { formatViewerCount };
