import type * as React from 'react';
import { useId } from 'react';

import { cn } from '../lib/cn';

export interface LogoMarkProps extends React.ComponentProps<'svg'> {
  /**
   * Rend le symbole en `currentColor` au lieu du dégradé de marque.
   * Nécessaire partout où le dégradé ne passe pas : favicon monochrome,
   * impression, incrustation sur une vidéo.
   */
  monochrome?: boolean;
}

/**
 * Symbole Matchly — version 08 (provisoire).
 *
 * Le dessin est un « M » dont les deux jambages sont deux chevrons qui
 * convergent : deux équipes qui se rencontrent. Le sommet ouvert au centre
 * évoque l'écran de diffusion, et le dégradé violet → bleu → cyan y déroule la
 * palette complète de la marque.
 *
 * Le dégradé SVG reçoit un identifiant unique via `useId` : deux logos sur la
 * même page partageraient sinon le même `id`, et le second effacerait la
 * définition du premier — un bug de rendu classique et difficile à diagnostiquer.
 */
export function LogoMark({ className, monochrome = false, ...props }: LogoMarkProps) {
  const gradientId = useId();
  const stroke = monochrome ? 'currentColor' : `url(#${gradientId})`;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="presentation"
      aria-hidden
      className={cn('size-8 shrink-0', className)}
      {...props}
    >
      {monochrome ? null : (
        <defs>
          <linearGradient
            id={gradientId}
            x1="2"
            y1="4"
            x2="30"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="var(--matchly-violet-600)" />
            <stop offset="50%" stopColor="var(--matchly-blue-600)" />
            <stop offset="100%" stopColor="var(--matchly-cyan-500)" />
          </linearGradient>
        </defs>
      )}

      <path
        d="M4 26V9.5a1.5 1.5 0 0 1 2.6-1.02L16 18.5l9.4-10.02A1.5 1.5 0 0 1 28 9.5V26"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface LogoProps extends React.ComponentProps<'span'> {
  /** Masque le mot-symbole et ne garde que le pictogramme. */
  markOnly?: boolean;
  monochrome?: boolean;
  /** Classes appliquées au seul pictogramme. */
  markClassName?: string;
}

/**
 * Logo complet — symbole + mot-symbole.
 *
 * Le nom est rendu en texte réel plutôt qu'en tracé vectoriel : il reste
 * sélectionnable, lisible par les lecteurs d'écran, et se recolore avec le
 * thème sans qu'on maintienne deux fichiers.
 *
 * @example
 * <Link href="/" aria-label="Matchly — accueil"><Logo /></Link>
 */
export function Logo({
  className,
  markOnly = false,
  monochrome = false,
  markClassName,
  ...props
}: LogoProps) {
  return (
    <span data-slot="logo" className={cn('inline-flex items-center gap-2', className)} {...props}>
      <LogoMark className={markClassName} monochrome={monochrome} />
      {markOnly ? (
        <span className="sr-only">Matchly</span>
      ) : (
        <span className="text-xl leading-none font-semibold tracking-tight">Matchly</span>
      )}
    </span>
  );
}
