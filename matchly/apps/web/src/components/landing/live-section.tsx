import { isMatchOngoing } from '@matchly/contracts';
import { Button, Container, Section } from '@matchly/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { SectionHeading } from '@/components/landing/section-heading';
import { MatchCard } from '@/components/match/match-card';
import { Reveal } from '@/components/reveal';
import { previewMatches } from '@/content/landing';

/**
 * Section « Direct ».
 *
 * Les matchs en cours sont remontés en tête. Sur une plateforme de direct,
 * l'ordre chronologique brut enterrerait sous les rencontres à venir la seule
 * chose que le visiteur peut regarder tout de suite.
 */
export function LiveSection() {
  const sorted = [...previewMatches].sort((a, b) => {
    const aLive = isMatchOngoing(a.status);
    const bLive = isMatchOngoing(b.status);

    if (aLive !== bLive) return aLive ? -1 : 1;
    return a.scheduledAt.localeCompare(b.scheduledAt);
  });

  const liveCount = sorted.filter((match) => isMatchOngoing(match.status)).length;

  return (
    <Section spacing="md" id="direct">
      <Container>
        <SectionHeading
          eyebrow="Direct"
          title="Le sport amateur, en ce moment même"
          description="Score, chronomètre, chat et Match Center. Chaque rencontre diffusée devient une vraie retransmission, pas une vidéo de téléphone posée sur un banc."
          preview
          action={
            <Button asChild variant="outline">
              <Link href="/live">
                Tous les directs
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />

        {/*
         * Région polie : quand les données réelles arriveront au Sprint 4, un
         * match qui passe en direct sera annoncé sans interrompre la lecture.
         */}
        <ul
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-live="polite"
          aria-label={`${liveCount} matchs en direct`}
        >
          {sorted.map((match, index) => (
            <Reveal as="li" key={match.id} delay={index * 0.05}>
              <MatchCard match={match} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
