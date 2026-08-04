import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Replays',
  description:
    'Revivez les rencontres passées, leurs temps forts et leurs résumés générés automatiquement.',
  path: '/replays',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function ReplaysPage() {
  return (
    <PagePlaceholder
      title="Replays"
      description="Revivez les rencontres passées, leurs temps forts et leurs résumés générés automatiquement."
      sprint="Sprint 6"
    />
  );
}
