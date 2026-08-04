import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

/**
 * Manifeste d'application web.
 *
 * Permet l'installation de Matchly sur l'écran d'accueil mobile — usage
 * naturel pour un produit consulté au bord d'un terrain. `display: standalone`
 * masque la barre d'adresse et rend l'écran entier au flux vidéo.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.slogan}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#0a0a0f',
    lang: 'fr',
    orientation: 'any',
    categories: ['sports', 'entertainment', 'social'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
