import { describe, expect, it } from 'vitest';

import { siteConfig } from '@/config/site';

import { organizationSchema, serializeJsonLd, websiteSchema } from './structured-data';

describe('serializeJsonLd', () => {
  it('échappe les chevrons pour empêcher la sortie de la balise script', () => {
    // Sans cet échappement, une chaîne contenant `</script>` refermerait la
    // balise et permettrait l'injection de script arbitraire dans la page.
    const serialized = serializeJsonLd({ name: '</script><script>alert(1)</script>' });

    expect(serialized).not.toContain('</script>');
    expect(serialized).not.toContain('<');
    expect(serialized).not.toContain('>');
    expect(serialized).toContain('\\u003c');
  });

  it('produit un JSON qui reste analysable après échappement', () => {
    const serialized = serializeJsonLd({ name: 'FC <Saint-Denis>' });

    // Les séquences < sont interprétées par JSON.parse : la valeur
    // d'origine est restituée intacte.
    expect(JSON.parse(serialized)).toEqual({ name: 'FC <Saint-Denis>' });
  });

  it('préserve les accents sans les échapper inutilement', () => {
    expect(JSON.parse(serializeJsonLd({ city: 'Béziers' }))).toEqual({ city: 'Béziers' });
  });
});

describe('organizationSchema', () => {
  it('déclare le type Organization avec le contexte Schema.org', () => {
    const schema = organizationSchema();

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
  });

  it('expose un logo en URL absolue', () => {
    // Une URL relative est ignorée par les moteurs de recherche.
    expect(String(organizationSchema()['logo'])).toMatch(/^https?:\/\//);
  });

  it('reprend le nom et l’URL du site', () => {
    const schema = organizationSchema();

    expect(schema['name']).toBe(siteConfig.organization.name);
    expect(schema['url']).toBe(siteConfig.url);
  });
});

describe('websiteSchema', () => {
  it('déclare le type WebSite et la langue', () => {
    const schema = websiteSchema();

    expect(schema['@type']).toBe('WebSite');
    expect(schema['inLanguage']).toBe('fr-FR');
  });

  it('n’annonce aucune action de recherche tant que /recherche n’existe pas', () => {
    // Déclarer une `potentialAction` que le site ne sait pas exécuter produit
    // une erreur dans la Search Console.
    expect(websiteSchema()['potentialAction']).toBeUndefined();
  });

  it('reste sérialisable sans perte', () => {
    expect(JSON.parse(serializeJsonLd(websiteSchema()))).toEqual(websiteSchema());
  });
});
