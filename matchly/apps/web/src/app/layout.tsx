import '@/app/globals.css';

import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { Providers } from '@/components/providers';
import { siteConfig } from '@/config/site';
import { buildMetadata } from '@/lib/seo';

/**
 * Poppins, police de la marque.
 *
 * `next/font` télécharge la police au build et la sert depuis notre propre
 * domaine : aucune requête vers Google au chargement, donc aucune connexion
 * tierce à négocier sur le chemin critique, et pas de cookie externe à
 * déclarer. `display: swap` affiche immédiatement le texte dans une police de
 * repli plutôt que de laisser un blanc — c'est ce qui protège le LCP.
 *
 * Les graisses sont limitées à celles réellement utilisées par le Design
 * System : chaque graisse supplémentaire est un fichier de plus à charger.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  ...buildMetadata(),
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  keywords: [
    'sport amateur',
    'streaming sportif',
    'match en direct',
    'club de sport',
    'championnat amateur',
    'résultats sportifs',
  ],
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // La couleur de la barre d'adresse mobile suit le thème actif.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /*
     * `suppressHydrationWarning` est indispensable ici, et uniquement ici :
     * `next-themes` écrit la classe de thème sur <html> avant l'hydratation
     * pour éviter le flash de thème clair. Le serveur ne peut pas connaître
     * cette valeur, donc le balisage diffère forcément sur cet élément.
     */
    <html lang="fr" suppressHydrationWarning className={poppins.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <Providers>
          {/*
           * Lien d'évitement : première cible de tabulation de la page, il
           * permet de sauter la navigation pour atteindre le contenu
           * directement (WCAG 2.4.1). Invisible tant qu'il n'a pas le focus.
           */}
          <a
            href="#contenu"
            className="sr-only rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
          >
            Aller au contenu principal
          </a>

          <SiteHeader />

          <main id="contenu" className="flex-1">
            {children}
          </main>

          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
