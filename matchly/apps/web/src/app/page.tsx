import { Badge, Button, Card, CardContent, Container, Section } from '@matchly/ui';
import type { Metadata } from 'next';
import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ path: '/' });

/**
 * Piliers du produit.
 *
 * Repris de la thèse fondatrice de Matchly : quatre usages que le sport amateur
 * n'a aujourd'hui nulle part, réunis sur une seule plateforme.
 */
const PILLARS = [
  {
    title: 'Diffuser',
    description:
      'Chaque club diffuse ses matchs depuis un téléphone ou une caméra, sans régie ni budget.',
  },
  {
    title: 'Suivre',
    description:
      'Scores en direct, calendriers et classements de toutes les compétitions amateurs.',
  },
  {
    title: 'Exister',
    description:
      'Un profil pour chaque joueur, chaque équipe, chaque club — et un palmarès qui les suit.',
  },
  {
    title: 'Revivre',
    description:
      'Replays, temps forts et résumés automatiques, disponibles dès le coup de sifflet.',
  },
] as const;

/**
 * Page d'accueil du Sprint 0.
 *
 * Elle affiche l'ossature — en-tête, thème, typographie, Design System — et
 * l'ambition du produit, sans anticiper la landing page du Sprint 1. Le
 * découpage par sprints n'aurait aucune valeur si le Sprint 0 livrait déjà
 * l'écran du Sprint 1.
 */
export default function HomePage() {
  return (
    <>
      <Section spacing="lg" className="overflow-hidden">
        {/* Halo de marque : décoratif, donc hors de l'arbre d'accessibilité. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center opacity-40 blur-3xl dark:opacity-30"
        >
          <div className="aspect-[1.6] w-[64rem] bg-gradient-brand [clip-path:ellipse(50%_40%_at_50%_50%)]" />
        </div>

        <Container size="md" className="flex flex-col items-center text-center">
          <Badge variant="brand">Sprint 0 — architecture et Design System</Badge>

          <h1 className="mt-8 text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            Chaque match
            <br />
            <span className="text-gradient-brand">mérite son public.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-balance text-muted-foreground sm:text-xl">
            {siteConfig.description}
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="gradient">
              <Link href="/design-system">Explorer le Design System</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/live">Voir le direct</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Quatre usages, une seule plateforme
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Le sport amateur produit des millions de matchs par an. Presque aucun n’est diffusé,
            classé ou archivé. Matchly comble ces quatre manques d’un coup.
          </p>

          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, index) => (
              <li key={pillar.title}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <span
                      aria-hidden
                      className="text-gradient-brand text-sm font-semibold tabular-nums"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-semibold">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground">{pillar.description}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
