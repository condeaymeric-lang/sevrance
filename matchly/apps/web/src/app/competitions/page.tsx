import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Compétitions',
  description:
    'Championnats, coupes et tournois amateurs : calendriers, classements et feuilles de match.',
  path: '/competitions',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function CompetitionsPage() {
  return (
    <PagePlaceholder
      title="Compétitions"
      description="Championnats, coupes et tournois amateurs : calendriers, classements et feuilles de match."
      sprint="Sprint 4"
    />
  );
}
