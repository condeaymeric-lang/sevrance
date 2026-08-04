import type { NextConfig } from 'next';

/**
 * En-têtes de sécurité appliqués à toutes les réponses.
 *
 * Ils sont définis ici plutôt que dans Cloudflare pour que l'environnement de
 * développement local ait exactement la même politique que la production : une
 * violation de CSP doit apparaître sur le poste du développeur, pas après le
 * déploiement.
 *
 * La CSP est volontairement absente de cette liste : Matchly chargera des flux
 * HLS, des lecteurs WebRTC et des origines média à partir du Sprint 5, et une
 * CSP écrite avant de connaître ces origines serait soit trop laxiste pour
 * servir à quelque chose, soit corrigée dans l'urgence à chaque sprint. Elle
 * sera introduite en mode `Report-Only` au Sprint 5.
 */
const securityHeaders = [
  // Empêche le navigateur de deviner un type MIME différent de celui annoncé.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Interdit l'inclusion du site dans une iframe tierce (clickjacking).
  { key: 'X-Frame-Options', value: 'DENY' },
  // Ne transmet l'URL complète qu'aux navigations de même origine.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Coupe l'accès aux capteurs dont Matchly n'a pas besoin côté web.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
  // Force HTTPS pendant deux ans, sous-domaines compris.
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * `@matchly/ui` est publié en TypeScript source, sans étape de build.
   * Next doit donc le compiler comme s'il faisait partie de l'application —
   * c'est ce qui préserve les directives `'use client'` et permet au tree
   * shaking de s'appliquer au Design System.
   */
  transpilePackages: ['@matchly/ui'],

  // N'annonce pas la version de Next dans les en-têtes.
  poweredByHeader: false,

  images: {
    // AVIF d'abord : ~30 % plus léger que WebP à qualité égale sur les photos
    // de sport, où les aplats de pelouse compressent très bien.
    formats: ['image/avif', 'image/webp'],
    // Les médias utilisateurs transiteront par Cloudflare Images.
    remotePatterns: [],
  },

  /**
   * `typedRoutes` n'est pas activé : les types de routes sont produits par
   * `next build`, or Turborepo lance `typecheck` et `build` en parallèle. Le
   * typecheck échouerait alors de façon non déterministe selon lequel finit en
   * premier. À reconsidérer si la CI passe à un ordonnancement séquentiel.
   */

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
