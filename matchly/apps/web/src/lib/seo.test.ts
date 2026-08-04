import { describe, expect, it } from 'vitest';

import { siteConfig } from '@/config/site';

import { buildMetadata } from './seo';

describe('buildMetadata', () => {
  it('produit un canonique absolu à partir d’un chemin relatif', () => {
    const metadata = buildMetadata({ path: '/competitions' });

    expect(metadata.alternates?.canonical).toBe(`${siteConfig.url}/competitions`);
  });

  it('retombe sur le slogan quand aucun titre n’est fourni', () => {
    expect(buildMetadata().title).toBe(`${siteConfig.name} — ${siteConfig.slogan}`);
  });

  it('conserve le titre de page fourni', () => {
    expect(buildMetadata({ title: 'Compétitions' }).title).toBe('Compétitions');
  });

  it('propage titre et description aux cartes de partage', () => {
    const metadata = buildMetadata({ title: 'Clubs', description: 'Tous les clubs.' });

    expect(metadata.openGraph?.title).toBe('Clubs');
    expect(metadata.openGraph?.description).toBe('Tous les clubs.');
    expect(metadata.twitter?.title).toBe('Clubs');
  });

  it('interdit l’indexation quand noIndex est demandé', () => {
    const robots = buildMetadata({ noIndex: true }).robots;

    expect(robots).toEqual({ index: false, follow: false });
  });

  it('autorise l’indexation par défaut', () => {
    const robots = buildMetadata().robots;

    expect(robots).toMatchObject({ index: true, follow: true });
  });

  it('déclare une image Open Graph aux dimensions attendues', () => {
    const images = buildMetadata().openGraph?.images;

    expect(images).toEqual([
      { url: '/opengraph-image', width: 1200, height: 630, alt: siteConfig.name },
    ]);
  });
});
