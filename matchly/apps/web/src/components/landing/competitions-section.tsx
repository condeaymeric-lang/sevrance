import { Badge, Button, Card, Container, Section } from '@matchly/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { StandingsTable } from '@/components/competition/standings-table';
import { SectionHeading } from '@/components/landing/section-heading';
import { Reveal } from '@/components/reveal';
import { previewCompetition, SPORT_LABELS } from '@/content/landing';

/**
 * Section « Compétitions ».
 *
 * Le classement réel est affiché plutôt que décrit. C'est la promesse la plus
 * simple à comprendre du produit — « le Flashscore du sport amateur » — et un
 * tableau vaut n'importe quel paragraphe pour l'établir.
 */
export function CompetitionsSection() {
  const { name, region, seasonLabel, sport, teamCount, matchCount, standings } = previewCompetition;

  return (
    <Section spacing="md" id="competitions">
      <Container>
        <SectionHeading
          eyebrow="Compétitions"
          title="Des classements tenus à jour tout seuls"
          description="Chaque feuille de match validée met à jour le classement, les statistiques et le palmarès. Plus de tableur partagé, plus de PDF envoyé le lundi soir."
          preview
          action={
            <Button asChild variant="outline">
              <Link href="/competitions">
                Voir les compétitions
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />

        <Reveal className="mt-12">
          <Card variant="elevated">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold">
                  {name} · {region}
                </h3>
                <p className="text-xs text-muted-foreground">Saison {seasonLabel}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">{SPORT_LABELS[sport]}</Badge>
                <Badge variant="secondary">{teamCount} équipes</Badge>
                <Badge variant="outline">{matchCount} matchs</Badge>
              </div>
            </div>

            <div className="p-5">
              <StandingsTable
                standings={standings}
                caption={`Classement du ${name} ${region}, saison ${seasonLabel}`}
              />
            </div>
          </Card>
        </Reveal>
      </Container>
    </Section>
  );
}
