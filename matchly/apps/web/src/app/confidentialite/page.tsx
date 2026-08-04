import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Politique de confidentialité',
  description:
    'Le détail des données traitées par Matchly et de vos droits sera publié avant l’ouverture des inscriptions.',
  path: '/confidentialite',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function ConfidentialitePage() {
  return (
    <PagePlaceholder
      title="Politique de confidentialité"
      description="Le détail des données traitées par Matchly et de vos droits sera publié avant l’ouverture des inscriptions."
      sprint="Sprint 2"
    />
  );
}
