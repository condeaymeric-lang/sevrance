import { describe, expect, it } from 'vitest';

import { CLUB_ROLES, hasClubRole, isMatchOngoing, MATCH_STATUSES } from './enums';

describe('hasClubRole', () => {
  it('accorde à un rôle supérieur les droits des rôles inférieurs', () => {
    expect(hasClubRole('owner', 'supporter')).toBe(true);
    expect(hasClubRole('manager', 'coach')).toBe(true);
  });

  it('refuse à un rôle inférieur les droits des rôles supérieurs', () => {
    expect(hasClubRole('player', 'owner')).toBe(false);
    expect(hasClubRole('supporter', 'player')).toBe(false);
  });

  it('accorde à un rôle ses propres droits', () => {
    for (const role of CLUB_ROLES) {
      expect(hasClubRole(role, role)).toBe(true);
    }
  });

  it('définit un ordre total sur les rôles', () => {
    for (const [index, role] of CLUB_ROLES.entries()) {
      for (const lower of CLUB_ROLES.slice(0, index)) {
        expect(hasClubRole(role, lower)).toBe(true);
        expect(hasClubRole(lower, role)).toBe(false);
      }
    }
  });
});

describe('isMatchOngoing', () => {
  it('considère la mi-temps comme un match en cours', () => {
    expect(isMatchOngoing('half_time')).toBe(true);
    expect(isMatchOngoing('live')).toBe(true);
  });

  it('exclut les états planifiés et terminaux', () => {
    expect(isMatchOngoing('scheduled')).toBe(false);
    expect(isMatchOngoing('finished')).toBe(false);
    expect(isMatchOngoing('cancelled')).toBe(false);
    expect(isMatchOngoing('postponed')).toBe(false);
  });

  it('classe chaque statut connu sans lever d’erreur', () => {
    for (const status of MATCH_STATUSES) {
      expect(typeof isMatchOngoing(status)).toBe('boolean');
    }
  });
});
