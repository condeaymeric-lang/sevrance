import { Badge, Button, Container, Section } from '@matchly/ui';
import Link from 'next/link';
import type { ReactNode } from 'react';

export interface PagePlaceholderProps {
  /** Titre de la page. Rendu en `<h1>`. */
  title: string;
  /** Phrase expliquant ce que la page contiendra. */
  description: string;
  /** Sprint qui livrera cette page, affiché en étiquette. */
  sprint: string;
  children?: ReactNode;
}

/**
 * Page d'attente d'une route non encore développée.
 *
 * Ces routes existent dès le Sprint 0 pour une raison précise : chaque entrée
 * de navigation doit mener quelque part. Un menu dont la moitié des liens
 * renvoie un 404 rend le maillage interne intestable, fausse les audits SEO et
 * empêche de valider la navigation au clavier.
 *
 * Elles sont désindexées par `buildMetadata({ noIndex: true })` côté page :
 * une page d'attente indexée pénaliserait le domaine entier.
 */
export function PagePlaceholder({ title, description, sprint, children }: PagePlaceholderProps) {
  return (
    <Section spacing="lg">
      <Container size="md" className="flex flex-col items-center text-center">
        <Badge variant="brand">{sprint}</Badge>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>

        <p className="mt-4 max-w-xl text-lg text-balance text-muted-foreground">{description}</p>

        {children}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/">Retour à l’accueil</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/design-system">Voir le Design System</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
