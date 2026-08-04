import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Mentions légales',
  description:
    'Les informations légales relatives à l’éditeur du service seront publiées avant l’ouverture des inscriptions.',
  path: '/mentions-legales',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function MentionsLegalesPage() {
  return (
    <PagePlaceholder
      title="Mentions légales"
      description="Les informations légales relatives à l’éditeur du service seront publiées avant l’ouverture des inscriptions."
      sprint="Sprint 2"
    />
  );
}
