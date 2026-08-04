import type { Metadata } from 'next';

import { siteConfig } from '@/config/site';

export interface PageSeoOptions {
  /** Titre propre à la page, sans le nom du site (ajouté automatiquement). */
  title?: string;
  description?: string;
  /** Chemin canonique, relatif à la racine. */
  path?: string;
  /** Retire la page de l'indexation (comptes, aperçus, pages techniques). */
  noIndex?: boolean;
  /** Chemin de l'image Open Graph, relatif à la racine. */
  image?: string;
}

/**
 * Construit les métadonnées d'une page.
 *
 * Centraliser la construction garantit que chaque page publiée porte un
 * canonique, un titre borné et une carte Open Graph valide. Sans cela, les
 * pages ajoutées au fil des sprints partent avec des métadonnées incomplètes,
 * et l'indexation se dégrade lentement sans que personne ne le remarque.
 *
 * @example
 * export const metadata = buildMetadata({
 *   title: 'Compétitions',
 *   description: 'Tous les championnats amateurs suivis par Matchly.',
 *   path: '/competitions',
 * });
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  noIndex = false,
  image = '/opengraph-image',
}: PageSeoOptions = {}): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  // Google tronque au-delà d'une soixantaine de caractères : le titre complet
  // sert à l'onglet et au partage, le titre court au référencement.
  const fullTitle = title === undefined ? `${siteConfig.name} — ${siteConfig.slogan}` : title;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: fullTitle,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}
