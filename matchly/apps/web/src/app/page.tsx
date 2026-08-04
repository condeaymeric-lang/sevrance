import type { Metadata } from 'next';

import { ClubsSection } from '@/components/landing/clubs-section';
import { CompetitionsSection } from '@/components/landing/competitions-section';
import { DownloadSection } from '@/components/landing/download-section';
import { FinalCta } from '@/components/landing/final-cta';
import { Hero } from '@/components/landing/hero';
import { LiveSection } from '@/components/landing/live-section';
import { buildMetadata } from '@/lib/seo';
import { organizationSchema, serializeJsonLd, websiteSchema } from '@/lib/structured-data';

export const metadata: Metadata = buildMetadata({
  path: '/',
  description:
    'Matchly diffuse, classe et archive le sport amateur. Matchs en direct, classements tenus à ' +
    'jour, profils de clubs et replays — gratuitement, pour tous les clubs amateurs.',
});

/**
 * Landing page.
 *
 * Server Component de bout en bout : seuls les composants `Reveal` — qui
 * observent le défilement — franchissent la frontière client. Le premier écran
 * ne dépend donc d'aucun JavaScript pour s'afficher.
 *
 * Les sections portent un `id` (`#direct`, `#clubs`, `#competitions`,
 * `#application`) : le pied de page et de futures campagnes pourront pointer
 * directement dessus, et `scroll-padding-top` les décale déjà sous l'en-tête
 * collant.
 */
export default function HomePage() {
  return (
    <>
      {/*
       * Données structurées. Injectées ici plutôt que dans le layout racine :
       * `WebSite` ne doit être déclaré que sur la page d'accueil, sa
       * répétition sur chaque page brouillant l'entité aux yeux des moteurs.
       */}
      <script
        type="application/ld+json"
        // Le contenu est produit par notre code et échappé par
        // `serializeJsonLd` ; aucune donnée utilisateur n'y transite.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteSchema()) }}
      />

      <Hero />
      <LiveSection />
      <ClubsSection />
      <CompetitionsSection />
      <DownloadSection />
      <FinalCta />
    </>
  );
}
