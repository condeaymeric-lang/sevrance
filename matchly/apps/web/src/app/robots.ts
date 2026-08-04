import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

/**
 * Directives d'exploration.
 *
 * Les segments privés sont exclus dès maintenant : une route de compte ou
 * d'administration explorée une seule fois peut rester des mois dans l'index,
 * et l'en retirer coûte bien plus cher que de l'interdire d'emblée.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/compte/', '/admin/', '/_next/'],
      },
    ],
    sitemap: new URL('/sitemap.xml', siteConfig.url).toString(),
    host: siteConfig.url,
  };
}
