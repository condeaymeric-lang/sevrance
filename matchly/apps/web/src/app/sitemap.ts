import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

/**
 * Routes réellement indexables.
 *
 * Le sitemap ne liste que des pages destinées à l'indexation. Y faire figurer
 * les pages d'attente — marquées `noIndex` — enverrait à Google deux signaux
 * contradictoires et ferait perdre du budget d'exploration sur des pages vides.
 * Chaque sprint ajoute ici les routes qu'il rend publiques.
 */
const INDEXABLE_ROUTES: ReadonlyArray<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [{ path: '/', changeFrequency: 'daily', priority: 1 }];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXABLE_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified,
    changeFrequency,
    priority,
  }));
}
