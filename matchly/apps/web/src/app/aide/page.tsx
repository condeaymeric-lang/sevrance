import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Centre d’aide',
  description:
    'Guides de diffusion, gestion de club et réponses aux questions les plus fréquentes.',
  path: '/aide',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function AidePage() {
  return (
    <PagePlaceholder
      title="Centre d’aide"
      description="Guides de diffusion, gestion de club et réponses aux questions les plus fréquentes."
      sprint="Sprint 6"
    />
  );
}
