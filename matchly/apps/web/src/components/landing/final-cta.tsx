import { Button, Container, Section } from '@matchly/ui';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { Reveal } from '@/components/reveal';

/**
 * Appel à l'action de fin de page.
 *
 * Reprend la promesse du hero plutôt que d'en inventer une nouvelle : le
 * visiteur qui arrive ici a lu toute la page, il a besoin d'une décision à
 * prendre, pas d'un argument de plus.
 */
export function FinalCta() {
  return (
    <Section spacing="lg">
      <Container size="md">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-brand opacity-[0.07] dark:opacity-[0.12]"
            />

            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Le prochain match de votre club
              <br />
              <span className="text-gradient-brand">mérite un public.</span>
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
              Créez votre club en quelques minutes. Gratuit pour le sport amateur, sans carte
              bancaire et sans engagement.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" variant="gradient">
                <Link href="/inscription">
                  Créer mon club
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild size="xl" variant="ghost">
                <Link href="/diffuser">Comment diffuser un match ?</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
