import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Se connecter',
  description:
    'L’authentification par email, Google et Apple arrive au Sprint 2, avec gestion complète des sessions.',
  path: '/connexion',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function ConnexionPage() {
  return (
    <PagePlaceholder
      title="Se connecter"
      description="L’authentification par email, Google et Apple arrive au Sprint 2, avec gestion complète des sessions."
      sprint="Sprint 2"
    />
  );
}
