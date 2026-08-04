import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Clubs',
  description: 'Les clubs, leurs équipes, leurs effectifs et leur palmarès, partout dans le monde.',
  path: '/clubs',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function ClubsPage() {
  return (
    <PagePlaceholder
      title="Clubs"
      description="Les clubs, leurs équipes, leurs effectifs et leur palmarès, partout dans le monde."
      sprint="Sprint 4"
    />
  );
}
