import { siteConfig } from '@/config/site';

/**
 * Données structurées Schema.org.
 *
 * Elles ne changent pas le classement en elles-mêmes, mais elles décident de
 * l'apparence du résultat : nom de marque, logo et champ de recherche dans les
 * pages de résultats. Sur un produit dont le nom est inconnu, c'est ce qui
 * distingue un lien nu d'une entrée identifiable.
 *
 * Ne déclarer ici QUE des faits vérifiables. Un `aggregateRating` ou un
 * `interactionStatistic` inventé est une violation des consignes qualité de
 * Google, sanctionnée par le retrait des résultats enrichis — et de toute façon
 * un mensonge.
 */

/** Type minimal d'un graphe JSON-LD, sans recourir à `any`. */
export type JsonLd = Record<string, unknown>;

/** Décrit l'organisation éditrice du site. */
export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.organization.name,
    url: siteConfig.url,
    logo: new URL(siteConfig.organization.logoPath, siteConfig.url).toString(),
    description: siteConfig.description,
    slogan: siteConfig.slogan,
  };
}

/**
 * Décrit le site lui-même.
 *
 * `potentialAction` déclare la recherche interne. Elle est volontairement
 * absente tant que `/recherche` n'existe pas — annoncer une action que le site
 * ne sait pas exécuter produit une erreur dans la Search Console. La recherche
 * arrive au Sprint 6.
 */
export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'fr-FR',
    publisher: {
      '@type': 'Organization',
      name: siteConfig.organization.name,
    },
  };
}

/**
 * Sérialise un graphe JSON-LD pour l'injecter dans une balise `<script>`.
 *
 * Les chevrons sont échappés en séquences Unicode. Sans cela, une chaîne
 * contenant `</script>` — venue par exemple d'un nom de club saisi par un
 * utilisateur — refermerait la balise et permettrait l'injection de script
 * arbitraire dans la page.
 *
 * @param schema Objet JSON-LD à sérialiser.
 */
export function serializeJsonLd(schema: JsonLd): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}
