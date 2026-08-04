import { isMatchOngoing, MATCH_STATUSES, SPORTS } from '@matchly/contracts';
import { describe, expect, it } from 'vitest';

import {
  MATCH_STATUS_LABELS,
  previewClubs,
  previewCompetition,
  previewMatches,
  SPORT_LABELS,
} from './landing';

describe('libellés', () => {
  it('traduit chaque discipline déclarée dans les contrats', () => {
    // Sans ce test, un sport ajouté aux contrats s'afficherait en `water_polo`
    // à l'écran. Le type l'attrape déjà à la compilation ; ce test attrape le
    // cas où quelqu'un élargirait le type sans compléter la table.
    for (const sport of SPORTS) {
      expect(SPORT_LABELS[sport]).toBeTypeOf('string');
      expect(SPORT_LABELS[sport].length).toBeGreaterThan(0);
    }
  });

  it('traduit chaque statut de match', () => {
    for (const status of MATCH_STATUSES) {
      expect(MATCH_STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
  });
});

describe('matchs d’aperçu', () => {
  it('utilise des identifiants uniques', () => {
    const ids = previewMatches.map((match) => match.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('porte des horodatages ISO analysables', () => {
    for (const match of previewMatches) {
      expect(Number.isNaN(Date.parse(match.scheduledAt))).toBe(false);
    }
  });

  it('ne donne un score qu’aux matchs commencés', () => {
    for (const match of previewMatches) {
      if (match.status === 'scheduled') {
        expect(match.home.score).toBeNull();
        expect(match.away.score).toBeNull();
      }
    }
  });

  it('n’attribue une minute de jeu qu’aux matchs en cours', () => {
    for (const match of previewMatches) {
      if (match.minute !== null) {
        expect(isMatchOngoing(match.status)).toBe(true);
      }
    }
  });

  it('ne compte des spectateurs que sur un match diffusé ou terminé', () => {
    for (const match of previewMatches) {
      if (match.viewers !== null) {
        expect(match.status).not.toBe('scheduled');
      }
    }
  });

  it('contient au moins un match en direct, sinon la section perd son sens', () => {
    expect(previewMatches.some((match) => isMatchOngoing(match.status))).toBe(true);
  });
});

describe('clubs d’aperçu', () => {
  it('utilise des identifiants uniques', () => {
    const ids = previewClubs.map((club) => club.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('déclare des effectifs cohérents', () => {
    for (const club of previewClubs) {
      expect(club.teamCount).toBeGreaterThan(0);
      // Un club ne peut pas avoir moins de membres que d'équipes.
      expect(club.memberCount).toBeGreaterThanOrEqual(club.teamCount);
    }
  });
});

describe('classement d’aperçu', () => {
  it('est ordonné par rang croissant', () => {
    const ranks = previewCompetition.standings.map((row) => row.rank);

    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it('est ordonné par points décroissants', () => {
    const points = previewCompetition.standings.map((row) => row.points);

    expect(points).toEqual([...points].sort((a, b) => b - a));
  });

  it('respecte l’arithmétique du football : 3 points par victoire, 1 par nul', () => {
    for (const row of previewCompetition.standings) {
      expect(row.points).toBe(row.won * 3 + row.drawn);
    }
  });

  it('a un nombre de matchs joués égal à la somme des résultats', () => {
    for (const row of previewCompetition.standings) {
      expect(row.played).toBe(row.won + row.drawn + row.lost);
    }
  });

  it('n’annonce jamais plus d’équipes classées que d’équipes inscrites', () => {
    expect(previewCompetition.standings.length).toBeLessThanOrEqual(previewCompetition.teamCount);
  });
});
