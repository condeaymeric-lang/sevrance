import { Badge, Container, LiveBadge, Section } from '@matchly/ui';
import { Bell, Camera, Check, Download } from 'lucide-react';

import { Reveal } from '@/components/reveal';

const APP_FEATURES = [
  {
    icon: Camera,
    title: 'Diffuser depuis le bord du terrain',
    description: 'Ingestion RTMP ou WebRTC, cadrage automatique, score incrusté en direct.',
  },
  {
    icon: Bell,
    title: 'Alertes de match',
    description: 'Coup d’envoi, but, carton, fin de rencontre. Uniquement pour vos équipes.',
  },
  {
    icon: Download,
    title: 'Replays hors ligne',
    description: 'Téléchargez un match et revoyez-le dans le train du retour.',
  },
] as const;

/**
 * Maquette de téléphone.
 *
 * Dessinée en CSS plutôt qu'importée en image : elle se recolore avec le thème,
 * reste nette sur tous les ratios de pixels, et ne coûte aucune requête sur le
 * chemin critique. Une capture d'écran PNG aurait fait les trois défauts
 * inverses — et aurait de toute façon montré une application qui n'existe pas.
 */
function PhoneMockup() {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-[15rem] rounded-[2.5rem] border-[0.6rem] border-neutral-900 bg-neutral-900 shadow-xl dark:border-neutral-700"
    >
      {/* Encoche. */}
      <div className="absolute top-0 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-neutral-900 dark:bg-neutral-700" />

      <div className="flex aspect-[9/19.5] flex-col overflow-hidden rounded-[2rem] bg-background">
        <div className="relative flex aspect-video shrink-0 items-center justify-center bg-gradient-brand">
          <span className="absolute top-2 left-2 origin-top-left scale-75">
            <LiveBadge viewerCount={1_240} />
          </span>
        </div>

        <div className="flex flex-col gap-2 p-3">
          <p className="text-[0.6rem] font-semibold">FC Saint-Denis — US Créteil</p>

          <div className="flex items-center justify-between rounded-lg bg-secondary px-2 py-1.5">
            <span className="text-[0.6rem] font-medium">Score</span>
            <span className="text-[0.7rem] font-bold tabular-nums">2 — 1</span>
          </div>

          {['But — 67′ Diallo', 'Carton jaune — 61′', 'But — 43′ Moreau'].map((line) => (
            <div
              key={line}
              className="rounded-lg border border-border px-2 py-1.5 text-[0.55rem] text-muted-foreground"
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Section « Téléchargement ».
 *
 * Les boutons de magasin ne pointent nulle part et l'annoncent : l'application
 * n'est pas publiée. Un bouton « App Store » qui ne mène à rien est un mensonge
 * que le visiteur découvre au clic, et le premier clic est exactement le moment
 * où l'on gagne ou perd sa confiance.
 */
export function DownloadSection() {
  return (
    <Section spacing="md" id="application" className="bg-surface">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Badge variant="brand">Application mobile</Badge>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Le terrain dans votre poche
            </h2>

            <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
              Diffuser, suivre et revivre depuis un téléphone. C’est là que se joue le sport amateur
              : au bord du terrain, pas devant un ordinateur.
            </p>

            <ul className="mt-8 flex flex-col gap-5">
              {APP_FEATURES.map((feature) => {
                const Icon = feature.icon;

                return (
                  <li key={feature.title} className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand-soft">
                      <Icon className="size-4 text-violet-600 dark:text-violet-300" aria-hidden />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{feature.title}</span>
                      <span className="text-sm text-pretty text-muted-foreground">
                        {feature.description}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-10 rounded-xl border border-dashed border-border p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Check className="size-4 text-success" aria-hidden />
                Bientôt sur l’App Store et Google Play
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                L’application n’est pas encore publiée. Créez votre compte : vous serez prévenu le
                jour de la sortie.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <PhoneMockup />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
