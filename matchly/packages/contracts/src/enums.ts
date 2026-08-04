import { z } from 'zod';

/**
 * Énumérations du domaine Matchly.
 *
 * Chaque énumération est déclarée comme un tuple `as const` puis enveloppée
 * dans un schéma Zod. Ce double niveau donne trois choses en une seule
 * définition : la validation à l'exécution, le type union à la compilation, et
 * une liste itérable pour peupler les listes déroulantes de l'interface sans
 * jamais retaper les valeurs.
 *
 * Les `const enum` TypeScript sont volontairement proscrits : ils ne survivent
 * pas à `isolatedModules` et casseraient le partage entre Next et NestJS.
 */

/** Disciplines couvertes au lancement. */
export const SPORTS = [
  'football',
  'futsal',
  'basketball',
  'handball',
  'rugby',
  'volleyball',
  'hockey',
  'tennis',
  'badminton',
  'padel',
  'water_polo',
  'american_football',
  'baseball',
  'cricket',
  'ice_hockey',
  'other',
] as const;
export const sportSchema = z.enum(SPORTS);
export type Sport = z.infer<typeof sportSchema>;

/**
 * Cycle de vie d'un match.
 *
 * `scheduled → live → finished` est le chemin nominal. `postponed` et
 * `cancelled` sont des états terminaux du point de vue du direct mais laissent
 * la fiche du match consultable — un match reporté conserve son historique.
 */
export const MATCH_STATUSES = [
  'scheduled',
  'live',
  'half_time',
  'finished',
  'postponed',
  'cancelled',
] as const;
export const matchStatusSchema = z.enum(MATCH_STATUSES);
export type MatchStatus = z.infer<typeof matchStatusSchema>;

/** États d'un flux vidéo, du point de vue de l'ingestion MediaMTX. */
export const STREAM_STATUSES = ['idle', 'connecting', 'live', 'ended', 'errored'] as const;
export const streamStatusSchema = z.enum(STREAM_STATUSES);
export type StreamStatus = z.infer<typeof streamStatusSchema>;

/** Protocoles de lecture proposés au joueur vidéo, par latence croissante. */
export const STREAM_PROTOCOLS = ['webrtc', 'hls'] as const;
export const streamProtocolSchema = z.enum(STREAM_PROTOCOLS);
export type StreamProtocol = z.infer<typeof streamProtocolSchema>;

/** Rôles d'un membre au sein d'un club. Ordre croissant de privilèges. */
export const CLUB_ROLES = ['supporter', 'player', 'coach', 'manager', 'owner'] as const;
export const clubRoleSchema = z.enum(CLUB_ROLES);
export type ClubRole = z.infer<typeof clubRoleSchema>;

/** Formats de compétition supportés par le moteur de calendrier. */
export const COMPETITION_FORMATS = [
  'league',
  'knockout',
  'group_stage_knockout',
  'friendly',
] as const;
export const competitionFormatSchema = z.enum(COMPETITION_FORMATS);
export type CompetitionFormat = z.infer<typeof competitionFormatSchema>;

/** Visibilité d'une ressource. `unlisted` = accessible par lien, non indexée. */
export const VISIBILITIES = ['public', 'unlisted', 'private'] as const;
export const visibilitySchema = z.enum(VISIBILITIES);
export type Visibility = z.infer<typeof visibilitySchema>;

/** Thème d'interface. `system` suit la préférence du système d'exploitation. */
export const THEMES = ['light', 'dark', 'system'] as const;
export const themeSchema = z.enum(THEMES);
export type Theme = z.infer<typeof themeSchema>;

/**
 * Poids hiérarchique des rôles de club, pour les contrôles d'autorisation.
 *
 * Comparer des entiers évite de disséminer des listes de rôles autorisés dans
 * le code : `rank(actual) >= rank(required)` suffit.
 */
const CLUB_ROLE_RANK: Readonly<Record<ClubRole, number>> = {
  supporter: 0,
  player: 1,
  coach: 2,
  manager: 3,
  owner: 4,
};

/**
 * Indique si un rôle satisfait au minimum requis.
 *
 * @param actual Rôle réellement porté par l'utilisateur sur le club.
 * @param required Rôle minimum exigé par l'action.
 *
 * @example
 * hasClubRole('manager', 'coach') // true
 * hasClubRole('player', 'owner')  // false
 */
export function hasClubRole(actual: ClubRole, required: ClubRole): boolean {
  return CLUB_ROLE_RANK[actual] >= CLUB_ROLE_RANK[required];
}

/** Statuts de match considérés comme « en cours » par l'interface. */
const ONGOING_MATCH_STATUSES: ReadonlySet<MatchStatus> = new Set<MatchStatus>([
  'live',
  'half_time',
]);

/**
 * Indique si un match doit s'afficher dans les sections « en direct ».
 *
 * La mi-temps compte comme en cours : le flux vidéo, le chat et le Match Center
 * restent actifs, seul le chronomètre est en pause.
 */
export function isMatchOngoing(status: MatchStatus): boolean {
  return ONGOING_MATCH_STATUSES.has(status);
}
