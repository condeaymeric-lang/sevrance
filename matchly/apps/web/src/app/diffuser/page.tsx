import type { Metadata } from 'next';

import { PagePlaceholder } from '@/components/layout/page-placeholder';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Diffuser un match',
  description:
    'Diffusez depuis un téléphone ou une caméra, en RTMP ou WebRTC, avec habillage automatique du score.',
  path: '/diffuser',
  // Page d'attente : indexer une page sans contenu dilue la qualité perçue du
  // domaine. L'indexation sera réactivée en même temps que le contenu réel.
  noIndex: true,
});

export default function DiffuserPage() {
  return (
    <PagePlaceholder
      title="Diffuser un match"
      description="Diffusez depuis un téléphone ou une caméra, en RTMP ou WebRTC, avec habillage automatique du score."
      sprint="Sprint 5"
    />
  );
}
