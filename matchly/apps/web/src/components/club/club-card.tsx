import { Avatar, AvatarFallback, Badge, Card, cn, initials } from '@matchly/ui';
import { MapPin, Users } from 'lucide-react';

import { type PreviewClub, SPORT_LABELS } from '@/content/landing';

export interface ClubCardProps {
  club: PreviewClub;
  className?: string;
}

/**
 * Fiche de club.
 *
 * L'avatar est un repli d'initiales, pas une photo. C'est un choix assumé :
 * illustrer des clubs fictifs avec des logos ou des photos de banque d'images
 * donnerait une fausse impression d'existence, et les initiales sur dégradé de
 * marque produisent de toute façon une grille plus cohérente qu'une collection
 * de logos hétérogènes — ce que sera la réalité une fois les clubs inscrits.
 *
 * @example
 * <ClubCard club={club} />
 */
export function ClubCard({ club, className }: ClubCardProps) {
  return (
    <Card interactive className={cn('h-full', className)}>
      <div className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <Avatar size="lg" ring={club.isLive ? 'live' : 'none'}>
            <AvatarFallback>{initials(club.name)}</AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate font-semibold">{club.name}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" aria-hidden />
              <span className="truncate">
                {club.city} · {club.region}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Badge variant="brand">{SPORT_LABELS[club.sport]}</Badge>
          <Badge variant="secondary">
            {club.teamCount} {club.teamCount > 1 ? 'équipes' : 'équipe'}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Users className="size-3" aria-hidden />
            <span className="tabular-nums">{club.memberCount}</span>
            <span className="sr-only">membres</span>
          </Badge>
        </div>
      </div>
    </Card>
  );
}
