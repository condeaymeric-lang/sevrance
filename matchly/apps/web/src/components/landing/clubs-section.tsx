import { Button, Card, Container, Section } from '@matchly/ui';
import { ArrowRight, Radio, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

import { ClubCard } from '@/components/club/club-card';
import { SectionHeading } from '@/components/landing/section-heading';
import { Reveal } from '@/components/reveal';
import { previewClubs } from '@/content/landing';

/** Ce qu'un club obtient en s'inscrivant. */
const CLUB_BENEFITS = [
  {
    icon: Radio,
    title: 'Diffuser sans régie',
    description:
      'Un téléphone suffit. L’habillage, le score et le chronomètre sont incrustés automatiquement.',
  },
  {
    icon: Trophy,
    title: 'Gérer ses compétitions',
    description:
      'Calendriers, feuilles de match et classements se tiennent à jour tout seuls après chaque rencontre.',
  },
  {
    icon: Users,
    title: 'Fédérer ses membres',
    description:
      'Joueurs, encadrants et supporters retrouvent au même endroit l’agenda, les replays et les statistiques.',
  },
] as const;

/**
 * Section « Clubs ».
 *
 * Elle répond à la question du club, pas à celle du spectateur : la landing
 * doit convertir les clubs, sans qui la plateforme n'a aucun contenu. Les
 * bénéfices précèdent donc l'annuaire.
 */
export function ClubsSection() {
  return (
    <Section spacing="md" id="clubs" className="bg-surface">
      <Container>
        <SectionHeading
          eyebrow="Clubs"
          title="Votre club mérite mieux qu’une page Facebook"
          description="Une identité, un effectif, un palmarès et une chaîne de diffusion. Tout ce qu’un club professionnel possède, gratuitement, pour un club amateur."
          action={
            <Button asChild variant="outline">
              <Link href="/clubs">
                Explorer les clubs
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {CLUB_BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <Reveal as="li" key={benefit.title} delay={index * 0.08}>
                <Card className="h-full">
                  <div className="flex h-full flex-col gap-3 p-6">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-brand-soft">
                      <Icon className="size-5 text-violet-600 dark:text-violet-300" aria-hidden />
                    </span>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-pretty text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </ul>

        <div className="mt-16">
          <SectionHeading
            as="h3"
            title="Ils ouvrent la voie"
            description="Un aperçu de ce à quoi ressemblera l’annuaire des clubs."
            preview
          />

          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {previewClubs.map((club, index) => (
              <Reveal as="li" key={club.id} delay={index * 0.05}>
                <ClubCard club={club} />
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
