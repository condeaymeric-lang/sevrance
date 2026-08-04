import { Badge, Button, Container, LiveBadge, Section } from '@matchly/ui';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

import { Reveal } from '@/components/reveal';

/** Chiffres de couverture du produit, pas de traction. */
const REACH = [
  { value: '16', label: 'disciplines couvertes' },
  { value: '4K', label: 'jusqu’à 4K, 60 i/s' },
  { value: '< 1 s', label: 'de latence en WebRTC' },
  { value: '0 €', label: 'pour diffuser un match' },
] as const;

/**
 * Décor du hero.
 *
 * Entièrement en CSS : aucun JavaScript n'intervient dans le rendu du premier
 * écran. Une animation pilotée par Framer Motion ici retarderait l'hydratation
 * sans rien ajouter — le mouvement est lent et purement atmosphérique, il n'a
 * besoin ni d'état ni d'interaction.
 *
 * L'ensemble est `aria-hidden` : c'est de la texture, pas du contenu.
 */
function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Halo de marque. Discret en clair, où il teinterait le texte. */}
      <div className="absolute inset-x-0 -top-64 flex justify-center opacity-[0.18] blur-3xl dark:opacity-30">
        <div className="aspect-[1.6] w-[64rem] animate-[gradient-pan_8s_ease-in-out_infinite] bg-gradient-brand bg-[length:200%_200%] [clip-path:ellipse(50%_40%_at_50%_50%)]" />
      </div>

      {/*
       * Grille de terrain, en fondu vers le bas.
       * Le masque évite la ligne de coupe nette qui trahirait le procédé.
       */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)] bg-[size:4rem_4rem] opacity-40" />
    </div>
  );
}

/**
 * Aperçu flottant d'un match en direct.
 *
 * Montre le produit plutôt que de le décrire. Animé à l'entrée — contrairement
 * au titre — parce qu'il est sous la ligne de flottaison sur la plupart des
 * écrans et ne peut donc pas être l'élément LCP.
 */
function LiveMatchPreview() {
  return (
    <Reveal delay={0.25} className="mx-auto mt-16 w-full max-w-2xl">
      <div className="rounded-2xl border border-border bg-card p-2 shadow-xl">
        {/* Zone vidéo simulée. */}
        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-brand-soft dark:bg-surface">
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,var(--matchly-violet-500)_0%,transparent_60%)] opacity-30"
          />

          <div className="absolute top-3 left-3">
            <LiveBadge viewerCount={1_240} />
          </div>

          <span className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
            <Play className="ml-1 size-6 fill-black text-black" aria-hidden />
          </span>

          <p className="absolute right-3 bottom-3 left-3 truncate text-xs font-medium text-foreground/70">
            FC Saint-Denis 2 — 1 US Créteil · 67′
          </p>
        </div>
      </div>
    </Reveal>
  );
}

/**
 * Hero de la landing page.
 *
 * Server Component. Le `<h1>` n'est enveloppé dans aucune animation
 * d'apparition : c'est l'élément LCP de la page, et une `opacity: 0` initiale
 * en attendant l'hydratation de Framer Motion dégraderait précisément la
 * métrique que ce sprint cherche à optimiser. Seuls le décor (CSS) et les
 * éléments sous la ligne de flottaison sont animés.
 */
export function Hero() {
  return (
    <Section spacing="lg" className="overflow-hidden pb-16 sm:pb-20 lg:pb-24">
      <HeroBackdrop />

      <Container size="md" className="flex flex-col items-center text-center">
        <Badge variant="brand" className="px-3 py-1">
          La plateforme mondiale du sport amateur
        </Badge>

        <h1 className="mt-8 text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Chaque match
          <br />
          <span className="text-gradient-brand">mérite son public.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
          Des millions de matchs amateurs se jouent chaque année devant trois personnes et un chien.
          Matchly les diffuse, les classe et les archive — pour que chaque club, chaque équipe et
          chaque joueur existe quelque part.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="xl" variant="gradient">
            <Link href="/inscription">
              Créer mon club
              <ArrowRight aria-hidden />
            </Link>
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href="/live">Voir les matchs en direct</Link>
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Gratuit pour les clubs amateurs. Sans carte bancaire.
        </p>
      </Container>

      <Container size="md">
        <LiveMatchPreview />

        {/* Chiffres de capacité technique — jamais de métriques d'usage
            inventées : ce produit n'a pas encore d'utilisateurs. */}
        <Reveal delay={0.35}>
          <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-border pt-10 lg:grid-cols-4">
            {REACH.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                <dt className="sr-only">{item.label}</dt>
                <dd className="text-gradient-brand text-3xl font-semibold tracking-tight tabular-nums">
                  {item.value}
                </dd>
                <p aria-hidden className="text-xs text-balance text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </Section>
  );
}
