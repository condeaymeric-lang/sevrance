import { Badge, Container, Section } from '@matchly/ui';
import type { Metadata } from 'next';

import { buildMetadata } from '@/lib/seo';

import { DesignSystemShowcase } from './showcase';

export const metadata: Metadata = buildMetadata({
  title: 'Design System',
  description:
    'Référence vivante des tokens, primitives et règles d’accessibilité du Design System Matchly.',
  path: '/design-system',
  // Référence interne : utile à l'équipe, sans intérêt pour un moteur de recherche.
  noIndex: true,
});

/**
 * Référence vivante du Design System.
 *
 * Cette page rend les composants réels, pas des captures : une régression
 * visuelle s'y voit immédiatement, et le contrôle des deux thèmes se fait avec
 * le sélecteur de l'en-tête. Elle remplace un Storybook au Sprint 0 — un outil
 * de plus à installer, configurer et maintenir pour le même service.
 */
export default function DesignSystemPage() {
  return (
    <>
      <Section spacing="md" className="border-b border-border">
        <Container>
          <Badge variant="brand">Sprint 0</Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Design System
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-balance text-muted-foreground">
            Tokens, primitives et règles d’accessibilité. Tout ce qui est affiché ici est le
            composant réel, rendu dans le thème actif.
          </p>
        </Container>
      </Section>

      <DesignSystemShowcase />
    </>
  );
}
