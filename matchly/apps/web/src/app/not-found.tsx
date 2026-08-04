import { Button, Container, Section } from '@matchly/ui';
import Link from 'next/link';

/**
 * Page 404.
 *
 * Elle propose des issues plutôt qu'un simple constat d'échec : une impasse
 * fait quitter le site, une porte de sortie ramène l'utilisateur dans le flux.
 */
export default function NotFound() {
  return (
    <Section spacing="lg">
      <Container size="sm" className="flex flex-col items-center text-center">
        <p className="text-gradient-brand text-7xl font-semibold tracking-tight tabular-nums">
          404
        </p>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Cette page n’existe pas
        </h1>

        <p className="mt-4 text-balance text-muted-foreground">
          Le lien est peut-être obsolète, ou la page a changé d’adresse.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="gradient">
            <Link href="/">Retour à l’accueil</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/live">Voir le direct</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
