import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Le direct',
  description:
    'Tous les matchs amateurs diffusés en ce moment, avec le score, le chronomètre et le chat en temps réel.',
  path: '/live',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function LivePage() {
  return (
    <PagePlaceholder
      title="Le direct"
      description="Tous les matchs amateurs diffusés en ce moment, avec le score, le chronomètre et le chat en temps réel."
      sprint="Sprint 5"
    />
  );
}
