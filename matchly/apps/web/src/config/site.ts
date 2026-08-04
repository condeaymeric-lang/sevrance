import type { LucideIcon } from 'lucide-react';
import { Clapperboard, Radio, Trophy, Users } from 'lucide-react';

import { env } from '@/lib/env';

/**
 * Configuration éditoriale du site.
 *
 * Tout ce qui relève du texte de marque, de la navigation et des métadonnées
 * par défaut vit ici. C'est le seul fichier à toucher pour renommer une entrée
 * de menu ou faire évoluer le discours — les composants n'écrivent jamais ces
 * chaînes en dur.
 */

export interface NavItem {
  /** Libellé affiché. */
  label: string;
  /** Chemin interne. */
  href: string;
  /** Description courte, utilisée dans la navigation mobile. */
  description: string;
  icon: LucideIcon;
}

export const siteConfig = {
  name: 'Matchly',
  slogan: 'Chaque match mérite son public.',
  description:
    'Matchly diffuse, classe et archive le sport amateur. Suivez les matchs en direct, ' +
    'explorez les compétitions, découvrez les clubs et revivez chaque action.',
  url: env.NEXT_PUBLIC_SITE_URL,
  locale: 'fr_FR',
  /** Utilisé par les balises Open Graph et les données structurées. */
  organization: {
    name: 'Matchly',
    logoPath: '/icon.svg',
  },
} as const;

/**
 * Navigation principale.
 *
 * Volontairement limitée à quatre entrées : au-delà, la barre déborde sur les
 * écrans intermédiaires et l'utilisateur cesse de percevoir la hiérarchie.
 */
export const mainNav: readonly NavItem[] = [
  {
    label: 'Direct',
    href: '/live',
    description: 'Les matchs diffusés en ce moment.',
    icon: Radio,
  },
  {
    label: 'Compétitions',
    href: '/competitions',
    description: 'Championnats, coupes et classements.',
    icon: Trophy,
  },
  {
    label: 'Clubs',
    href: '/clubs',
    description: 'Les clubs, leurs équipes et leurs effectifs.',
    icon: Users,
  },
  {
    label: 'Replays',
    href: '/replays',
    description: 'Les rencontres passées et leurs résumés.',
    icon: Clapperboard,
  },
];

export interface FooterSection {
  title: string;
  links: ReadonlyArray<{ label: string; href: string }>;
}

export const footerNav: readonly FooterSection[] = [
  {
    title: 'Plateforme',
    links: [
      { label: 'Direct', href: '/live' },
      { label: 'Compétitions', href: '/competitions' },
      { label: 'Clubs', href: '/clubs' },
      { label: 'Replays', href: '/replays' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Design System', href: '/design-system' },
      { label: 'Diffuser un match', href: '/diffuser' },
      { label: 'Aide', href: '/aide' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Conditions générales', href: '/cgu' },
      { label: 'Confidentialité', href: '/confidentialite' },
      { label: 'Mentions légales', href: '/mentions-legales' },
    ],
  },
];
