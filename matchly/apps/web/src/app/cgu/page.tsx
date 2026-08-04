import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Conditions générales d’utilisation',
  description:
    'Le cadre contractuel d’utilisation de Matchly sera publié avant l’ouverture des inscriptions.',
  path: '/cgu',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function CguPage() {
  return (
    <PagePlaceholder
      title="Conditions générales d’utilisation"
      description="Le cadre contractuel d’utilisation de Matchly sera publié avant l’ouverture des inscriptions."
      sprint="Sprint 2"
    />
  );
}
