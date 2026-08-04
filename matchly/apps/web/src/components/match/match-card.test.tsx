import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { PreviewMatch } from '@/content/landing';

import { MatchCard } from './match-card';

function buildMatch(overrides: Partial<PreviewMatch> = {}): PreviewMatch {
  return {
    id: 'm-test',
    sport: 'football',
    status: 'scheduled',
    competition: 'Championnat régional · Île-de-France',
    home: { name: 'FC Saint-Denis', shortName: 'SDN', score: null },
    away: { name: 'US Créteil', shortName: 'CRE', score: null },
    minute: null,
    scheduledAt: '2026-08-04T13:00:00.000Z',
    viewers: null,
    venue: 'Stade Auguste-Delaune',
    ...overrides,
  };
}

describe('MatchCard', () => {
  it('affiche les deux équipes et le lieu', () => {
    render(<MatchCard match={buildMatch()} />);

    expect(screen.getByText('FC Saint-Denis')).toBeInTheDocument();
    expect(screen.getByText('US Créteil')).toBeInTheDocument();
    expect(screen.getByText('Stade Auguste-Delaune')).toBeInTheDocument();
  });

  it('affiche l’heure du coup d’envoi pour un match à venir', () => {
    render(<MatchCard match={buildMatch()} />);

    // 13:00 UTC en août = 15:00 à Paris.
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('n’affiche aucun score avant le coup d’envoi', () => {
    const { container } = render(<MatchCard match={buildMatch()} />);

    // Un 0-0 avant le début est une information différente d'un score inconnu.
    expect(container.querySelector('.tabular-nums')).toBeNull();
  });

  describe('match en direct', () => {
    const liveMatch = buildMatch({
      status: 'live',
      home: { name: 'FC Saint-Denis', shortName: 'SDN', score: 2 },
      away: { name: 'US Créteil', shortName: 'CRE', score: 1 },
      minute: 67,
      viewers: 1_240,
    });

    it('affiche le badge « en direct » et le compteur de spectateurs', () => {
      render(<MatchCard match={liveMatch} />);

      expect(screen.getByText('En direct')).toBeInTheDocument();
      expect(screen.getByText('1,2 k')).toBeInTheDocument();
    });

    it('affiche la minute de jeu', () => {
      render(<MatchCard match={liveMatch} />);

      expect(screen.getByText('67′')).toBeInTheDocument();
    });

    it('ne désigne aucun vainqueur tant que le match n’est pas terminé', () => {
      // Souligner l'équipe qui mène à la 67e suggère une issue non acquise.
      const { container } = render(<MatchCard match={liveMatch} />);

      expect(container.querySelectorAll('.font-bold')).toHaveLength(0);
    });
  });

  it('met le vainqueur en évidence une fois le match terminé', () => {
    const { container } = render(
      <MatchCard
        match={buildMatch({
          status: 'finished',
          home: { name: 'Nice VB', shortName: 'NIC', score: 3 },
          away: { name: 'Toulon VB', shortName: 'TLN', score: 1 },
        })}
      />,
    );

    // Exactement un score en gras : celui du vainqueur.
    expect(container.querySelectorAll('.font-bold')).toHaveLength(1);
  });

  it('ne met personne en évidence sur un match nul terminé', () => {
    const { container } = render(
      <MatchCard
        match={buildMatch({
          status: 'finished',
          home: { name: 'Cesson', shortName: 'CES', score: 14 },
          away: { name: 'Brest HB', shortName: 'BRE', score: 14 },
        })}
      />,
    );

    expect(container.querySelectorAll('.font-bold')).toHaveLength(0);
  });

  it('affiche « Mi-temps » plutôt que la minute pendant la pause', () => {
    render(
      <MatchCard
        match={buildMatch({
          status: 'half_time',
          minute: 30,
          home: { name: 'Cesson', shortName: 'CES', score: 14 },
          away: { name: 'Brest HB', shortName: 'BRE', score: 14 },
        })}
      />,
    );

    expect(screen.getByText('Mi-temps')).toBeInTheDocument();
    expect(screen.queryByText('30′')).not.toBeInTheDocument();
  });

  it('donne un nom accessible décrivant la rencontre', () => {
    render(<MatchCard match={buildMatch()} />);

    expect(screen.getByLabelText('FC Saint-Denis contre US Créteil, À venir')).toBeInTheDocument();
  });
});
