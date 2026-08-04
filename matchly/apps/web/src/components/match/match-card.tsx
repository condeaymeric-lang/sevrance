import { isMatchOngoing } from '@matchly/contracts';
import { Badge, Card, cn, LiveBadge } from '@matchly/ui';
import { MapPin } from 'lucide-react';

import { MATCH_STATUS_LABELS, type PreviewMatch, SPORT_LABELS } from '@/content/landing';
import { formatTime } from '@/lib/format';

export interface MatchCardProps {
  match: PreviewMatch;
  className?: string;
}

/**
 * Ligne d'équipe : nom, abréviation sur petit écran, score.
 *
 * Le score est en `tabular-nums` : sans chiffres à chasse fixe, passer de 9 à
 * 10 décale toute la colonne, et sur un score qui se met à jour en direct le
 * saut est visible à chaque but.
 */
function TeamRow({
  team,
  isWinner,
  hasScore,
}: {
  team: PreviewMatch['home'];
  isWinner: boolean;
  hasScore: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={cn(
          'truncate text-sm',
          isWinner ? 'font-semibold text-foreground' : 'font-medium text-foreground/80',
        )}
      >
        <span className="hidden sm:inline">{team.name}</span>
        <span className="sm:hidden">{team.shortName}</span>
      </span>

      {hasScore ? (
        <span
          className={cn(
            'shrink-0 text-lg tabular-nums',
            isWinner ? 'font-bold text-foreground' : 'font-semibold text-muted-foreground',
          )}
        >
          {team.score}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Vignette de match.
 *
 * Composant de domaine : il vit dans `apps/web` et non dans `@matchly/ui`,
 * parce qu'il connaît la notion de match. Le Design System ne doit contenir que
 * des primitives ignorantes du métier — c'est ce qui lui permet de servir un
 * jour une application d'administration ou un back-office sans traîner le
 * vocabulaire du sport avec lui.
 *
 * @example
 * <MatchCard match={match} />
 */
export function MatchCard({ match, className }: MatchCardProps) {
  const ongoing = isMatchOngoing(match.status);
  const finished = match.status === 'finished';

  // Les scores sont extraits en variables locales pour que TypeScript puisse
  // les affiner : une comparaison directe sur `match.home.score` obligerait à
  // une assertion de non-nullité, que la charte interdit.
  const homeScore = match.home.score;
  const awayScore = match.away.score;
  const hasScore = homeScore !== null && awayScore !== null;

  // Un vainqueur ne se met en évidence qu'une fois le match terminé : souligner
  // une équipe qui mène à la 20e minute suggère une issue qui n'est pas acquise.
  const homeWins = finished && homeScore !== null && awayScore !== null && homeScore > awayScore;
  const awayWins = finished && homeScore !== null && awayScore !== null && awayScore > homeScore;

  return (
    <Card
      interactive
      className={cn('flex h-full flex-col overflow-hidden', className)}
      aria-label={`${match.home.name} contre ${match.away.name}, ${MATCH_STATUS_LABELS[match.status]}`}
    >
      {/* Bandeau : discipline et statut. */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <Badge variant="secondary" className="shrink-0">
          {SPORT_LABELS[match.sport]}
        </Badge>

        {ongoing ? (
          <LiveBadge viewerCount={match.viewers ?? undefined} />
        ) : (
          <Badge variant={finished ? 'outline' : 'accent'} className="shrink-0">
            {finished ? MATCH_STATUS_LABELS[match.status] : formatTime(match.scheduledAt)}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="truncate text-xs text-muted-foreground">{match.competition}</p>

        <div className="flex flex-col gap-2">
          <TeamRow team={match.home} isWinner={homeWins} hasScore={hasScore} />
          <TeamRow team={match.away} isWinner={awayWins} hasScore={hasScore} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{match.venue}</span>
          </span>

          {match.minute === null ? null : (
            <span className="shrink-0 font-medium tabular-nums">
              {match.status === 'half_time' ? 'Mi-temps' : `${match.minute}′`}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
