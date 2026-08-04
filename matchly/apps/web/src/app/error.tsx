'use client';

import { Button, Container, Section } from '@matchly/ui';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export interface ErrorPageProps {
  error: Error & { digest?: string };
  /** Fourni par Next : retente le rendu du segment fautif. */
  reset: () => void;
}

/**
 * Frontière d'erreur des routes.
 *
 * Next impose un Client Component ici : la page doit pouvoir relancer le rendu
 * sans recharger le document.
 *
 * Le message d'erreur brut n'est jamais affiché — il peut contenir un chemin de
 * fichier, une requête ou un fragment de configuration. Seul le `digest`, un
 * identifiant opaque, est montré : c'est lui qui permet de retrouver la trace
 * complète côté serveur.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Sera relié à Sentry au Sprint 1, quand l'observabilité sera branchée.
    console.error('[matchly] erreur de rendu :', error);
  }, [error]);

  return (
    <Section spacing="lg">
      <Container size="sm" className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Quelque chose s’est mal passé
        </h1>

        <p className="mt-4 text-balance text-muted-foreground">
          L’erreur a été enregistrée. Vous pouvez réessayer : la plupart de ces incidents sont
          passagers.
        </p>

        {error.digest === undefined ? null : (
          <p className="mt-6 rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
            Référence : {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} variant="gradient">
            <RotateCcw aria-hidden />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Retour à l’accueil</Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
