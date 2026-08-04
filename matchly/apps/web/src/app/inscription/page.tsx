import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Créer un compte',
  description:
    'Rejoignez Matchly pour suivre vos clubs, recevoir les alertes de match et diffuser vos rencontres.',
  path: '/inscription',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function InscriptionPage() {
  return (
    <PagePlaceholder
      title="Créer un compte"
      description="Rejoignez Matchly pour suivre vos clubs, recevoir les alertes de match et diffuser vos rencontres."
      sprint="Sprint 2"
    />
  );
}
