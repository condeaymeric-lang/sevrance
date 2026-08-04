import type { CompetitionFormat, MatchStatus, Sport } from '@matchly/contracts';

/**
 * Contenu d'aperçu de la landing page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CE CONTENU EST ILLUSTRATIF. Aucun de ces clubs, matchs ou spectateurs
 * n'existe. L'API n'arrive qu'au Sprint 4 ; d'ici là, la page a besoin de
 * matière pour montrer ce que sera le produit.
 *
 * Chaque section qui l'affiche porte une mention « Aperçu » visible à l'écran :
 * présenter des matchs en direct et des compteurs de spectateurs sur un produit
 * sans utilisateurs induirait le visiteur en erreur, et une landing page qui
 * ment sur sa traction n'est pas un problème de design mais d'honnêteté.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Les types viennent de `@matchly/contracts`, ceux-là mêmes que l'API servira.
 * Le jour où les données réelles arrivent, remplacer la source est un
 * changement compatible au type près — pas une réécriture des composants.
 */

// -----------------------------------------------------------------------------
// Matchs
// -----------------------------------------------------------------------------

export interface PreviewTeam {
  name: string;
  /** Abréviation affichée sur les petits écrans. */
  shortName: string;
  score: number | null;
}

export interface PreviewMatch {
  id: string;
  sport: Sport;
  status: MatchStatus;
  competition: string;
  home: PreviewTeam;
  away: PreviewTeam;
  /** Minute de jeu écoulée. `null` hors match en cours. */
  minute: number | null;
  /** Coup d'envoi, en ISO 8601 UTC. */
  scheduledAt: string;
  /** Spectateurs simultanés. `null` si le match n'est pas diffusé. */
  viewers: number | null;
  venue: string;
}

export const previewMatches: readonly PreviewMatch[] = [
  {
    id: 'm1',
    sport: 'football',
    status: 'live',
    competition: 'Championnat régional · Île-de-France',
    home: { name: 'FC Saint-Denis', shortName: 'SDN', score: 2 },
    away: { name: 'US Créteil', shortName: 'CRE', score: 1 },
    minute: 67,
    scheduledAt: '2026-08-04T13:00:00.000Z',
    viewers: 1_240,
    venue: 'Stade Auguste-Delaune',
  },
  {
    id: 'm2',
    sport: 'basketball',
    status: 'live',
    competition: 'Coupe départementale · Rhône',
    home: { name: 'Villeurbanne BC', shortName: 'VBC', score: 78 },
    away: { name: 'ASVEL Espoirs', shortName: 'ASV', score: 74 },
    minute: 34,
    scheduledAt: '2026-08-04T13:15:00.000Z',
    viewers: 860,
    venue: 'Gymnase Marcel-Cerdan',
  },
  {
    id: 'm3',
    sport: 'handball',
    status: 'half_time',
    competition: 'Championnat régional · Bretagne',
    home: { name: 'Cesson-Sévigné', shortName: 'CES', score: 14 },
    away: { name: 'Brest HB', shortName: 'BRE', score: 14 },
    minute: 30,
    scheduledAt: '2026-08-04T13:30:00.000Z',
    viewers: 412,
    venue: 'Salle Pierre-de-Coubertin',
  },
  {
    id: 'm4',
    sport: 'rugby',
    status: 'scheduled',
    competition: 'Fédérale 3 · Occitanie',
    home: { name: 'Béziers Rugby', shortName: 'BEZ', score: null },
    away: { name: 'RC Narbonne', shortName: 'NAR', score: null },
    minute: null,
    scheduledAt: '2026-08-04T17:00:00.000Z',
    viewers: null,
    venue: 'Stade de la Méditerranée',
  },
  {
    id: 'm5',
    sport: 'volleyball',
    status: 'finished',
    competition: 'Championnat régional · PACA',
    home: { name: 'Nice VB', shortName: 'NIC', score: 3 },
    away: { name: 'Toulon VB', shortName: 'TLN', score: 1 },
    minute: null,
    scheduledAt: '2026-08-04T09:00:00.000Z',
    viewers: 2_180,
    venue: 'Palais des Sports Jean-Bouin',
  },
  {
    id: 'm6',
    sport: 'futsal',
    status: 'scheduled',
    competition: 'Coupe nationale · Nord',
    home: { name: 'Roubaix Futsal', shortName: 'RBX', score: null },
    away: { name: 'Lille Métropole', shortName: 'LIL', score: null },
    minute: null,
    scheduledAt: '2026-08-04T18:30:00.000Z',
    viewers: null,
    venue: 'Complexe Léo-Lagrange',
  },
];

// -----------------------------------------------------------------------------
// Clubs
// -----------------------------------------------------------------------------

export interface PreviewClub {
  id: string;
  name: string;
  sport: Sport;
  city: string;
  region: string;
  teamCount: number;
  memberCount: number;
  /** Vrai si le club diffuse un match en ce moment. */
  isLive: boolean;
}

export const previewClubs: readonly PreviewClub[] = [
  {
    id: 'c1',
    name: 'FC Saint-Denis',
    sport: 'football',
    city: 'Saint-Denis',
    region: 'Île-de-France',
    teamCount: 8,
    memberCount: 214,
    isLive: true,
  },
  {
    id: 'c2',
    name: 'Villeurbanne BC',
    sport: 'basketball',
    city: 'Villeurbanne',
    region: 'Auvergne-Rhône-Alpes',
    teamCount: 6,
    memberCount: 158,
    isLive: true,
  },
  {
    id: 'c3',
    name: 'Béziers Rugby',
    sport: 'rugby',
    city: 'Béziers',
    region: 'Occitanie',
    teamCount: 5,
    memberCount: 187,
    isLive: false,
  },
  {
    id: 'c4',
    name: 'Cesson-Sévigné HB',
    sport: 'handball',
    city: 'Cesson-Sévigné',
    region: 'Bretagne',
    teamCount: 7,
    memberCount: 143,
    isLive: false,
  },
  {
    id: 'c5',
    name: 'Nice Volley-Ball',
    sport: 'volleyball',
    city: 'Nice',
    region: "Provence-Alpes-Côte d'Azur",
    teamCount: 4,
    memberCount: 96,
    isLive: false,
  },
  {
    id: 'c6',
    name: 'Roubaix Futsal',
    sport: 'futsal',
    city: 'Roubaix',
    region: 'Hauts-de-France',
    teamCount: 3,
    memberCount: 72,
    isLive: false,
  },
];

// -----------------------------------------------------------------------------
// Compétitions
// -----------------------------------------------------------------------------

export interface PreviewStanding {
  rank: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  /** Cinq derniers résultats, du plus ancien au plus récent. */
  form: ReadonlyArray<'W' | 'D' | 'L'>;
}

export interface PreviewCompetition {
  id: string;
  name: string;
  sport: Sport;
  format: CompetitionFormat;
  region: string;
  seasonLabel: string;
  teamCount: number;
  matchCount: number;
  standings: readonly PreviewStanding[];
}

export const previewCompetition: PreviewCompetition = {
  id: 'comp1',
  name: 'Championnat régional',
  sport: 'football',
  format: 'league',
  region: 'Île-de-France',
  seasonLabel: '2025-2026',
  teamCount: 14,
  matchCount: 182,
  standings: [
    {
      rank: 1,
      team: 'FC Saint-Denis',
      played: 18,
      won: 13,
      drawn: 3,
      lost: 2,
      points: 42,
      form: ['W', 'W', 'D', 'W', 'W'],
    },
    {
      rank: 2,
      team: 'US Créteil',
      played: 18,
      won: 12,
      drawn: 4,
      lost: 2,
      points: 40,
      form: ['W', 'D', 'W', 'W', 'D'],
    },
    {
      rank: 3,
      team: 'AS Montreuil',
      played: 18,
      won: 11,
      drawn: 2,
      lost: 5,
      points: 35,
      form: ['L', 'W', 'W', 'D', 'W'],
    },
    {
      rank: 4,
      team: 'Red Star Amateur',
      played: 18,
      won: 9,
      drawn: 5,
      lost: 4,
      points: 32,
      form: ['D', 'W', 'L', 'W', 'W'],
    },
    {
      rank: 5,
      team: 'Aubervilliers FC',
      played: 18,
      won: 8,
      drawn: 4,
      lost: 6,
      points: 28,
      form: ['W', 'L', 'D', 'L', 'W'],
    },
  ],
};

// -----------------------------------------------------------------------------
// Libellés d'affichage
// -----------------------------------------------------------------------------

/**
 * Nom français de chaque discipline.
 *
 * `Record<Sport, string>` et non `Partial<…>` : ajouter un sport dans les
 * contrats casse la compilation ici tant que la traduction manque. C'est
 * exactement ce qu'on veut — un sport sans libellé s'afficherait autrement en
 * `water_polo` à l'écran.
 */
export const SPORT_LABELS: Readonly<Record<Sport, string>> = {
  football: 'Football',
  futsal: 'Futsal',
  basketball: 'Basketball',
  handball: 'Handball',
  rugby: 'Rugby',
  volleyball: 'Volleyball',
  hockey: 'Hockey',
  tennis: 'Tennis',
  badminton: 'Badminton',
  padel: 'Padel',
  water_polo: 'Water-polo',
  american_football: 'Football américain',
  baseball: 'Baseball',
  cricket: 'Cricket',
  ice_hockey: 'Hockey sur glace',
  other: 'Autre',
};

/** Libellé court d'un statut de match, pour les vignettes. */
export const MATCH_STATUS_LABELS: Readonly<Record<MatchStatus, string>> = {
  scheduled: 'À venir',
  live: 'En direct',
  half_time: 'Mi-temps',
  finished: 'Terminé',
  postponed: 'Reporté',
  cancelled: 'Annulé',
};
