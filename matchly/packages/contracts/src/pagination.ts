import { z } from 'zod';

/**
 * Pagination par curseur.
 *
 * Matchly n'expose volontairement aucune pagination par `offset`. Sur des
 * classements et des flux triés par date qui changent pendant que l'utilisateur
 * navigue, `OFFSET n` fait sauter ou dupliquer des lignes, et son coût croît
 * linéairement avec la profondeur — inacceptable sur des tables de plusieurs
 * millions de matchs. Le curseur est opaque côté client : il encode la clé de
 * tri de la dernière ligne rendue, ce qui donne un coût constant et un
 * défilement stable.
 */

/** Bornes du nombre d'éléments par page, appliquées côté serveur. */
export const PAGE_SIZE_MIN = 1;
export const PAGE_SIZE_MAX = 100;
export const PAGE_SIZE_DEFAULT = 20;

/** Paramètres de pagination acceptés en query string. */
export const cursorPaginationSchema = z.object({
  /**
   * Curseur opaque renvoyé par la page précédente. Absent = première page.
   * Le client ne doit jamais le construire ni l'interpréter.
   */
  cursor: z.string().min(1).max(512).optional(),
  /** Nombre d'éléments souhaités. Le serveur peut en renvoyer moins. */
  limit: z.coerce
    .number()
    .int('La limite doit être un entier.')
    .min(PAGE_SIZE_MIN, `La limite minimale est ${PAGE_SIZE_MIN}.`)
    .max(PAGE_SIZE_MAX, `La limite maximale est ${PAGE_SIZE_MAX}.`)
    .default(PAGE_SIZE_DEFAULT),
});
export type CursorPagination = z.infer<typeof cursorPaginationSchema>;

/** Sens de tri. */
export const sortDirectionSchema = z.enum(['asc', 'desc']).default('desc');
export type SortDirection = z.infer<typeof sortDirectionSchema>;

/**
 * Construit le schéma d'une page de résultats pour un type d'élément donné.
 *
 * @param itemSchema Schéma d'un élément de la page.
 * @returns Un schéma d'objet `{ items, pageInfo }`.
 *
 * @example
 * const clubPage = pageSchema(clubSummarySchema);
 * type ClubPage = z.infer<typeof clubPage>;
 */
export function pageSchema<TItem extends z.ZodTypeAny>(itemSchema: TItem) {
  return z.object({
    items: z.array(itemSchema),
    pageInfo: pageInfoSchema,
  });
}

/** Métadonnées de navigation renvoyées avec chaque page. */
export const pageInfoSchema = z.object({
  /** Curseur à renvoyer pour obtenir la page suivante. `null` = fin du flux. */
  nextCursor: z.string().nullable(),
  /** Vrai s'il reste au moins un élément après cette page. */
  hasNextPage: z.boolean(),
  /** Nombre d'éléments réellement renvoyés dans cette page. */
  count: z.number().int().nonnegative(),
});
export type PageInfo = z.infer<typeof pageInfoSchema>;

/** Page de résultats typée, indépendante de Zod pour un usage en TypeScript pur. */
export interface Page<TItem> {
  items: TItem[];
  pageInfo: PageInfo;
}

/**
 * Découpe une tranche sur-lue en page, en déduisant `hasNextPage`.
 *
 * L'appelant demande volontairement `limit + 1` lignes à la base : si la ligne
 * excédentaire existe, il reste une page après celle-ci. C'est la seule façon
 * de connaître l'existence d'une suite sans exécuter un `COUNT(*)` coûteux.
 *
 * @param rows Lignes lues, au plus `limit + 1`.
 * @param limit Taille de page demandée par le client.
 * @param toCursor Extrait le curseur opaque d'une ligne.
 *
 * @example
 * const rows = await db.match.findMany({ take: limit + 1, ... });
 * return buildPage(rows, limit, (m) => m.id);
 */
export function buildPage<TItem>(
  rows: readonly TItem[],
  limit: number,
  toCursor: (row: TItem) => string,
): Page<TItem> {
  const hasNextPage = rows.length > limit;
  const items = hasNextPage ? rows.slice(0, limit) : rows.slice();
  const last = items.at(-1);

  return {
    items,
    pageInfo: {
      nextCursor: hasNextPage && last !== undefined ? toCursor(last) : null,
      hasNextPage,
      count: items.length,
    },
  };
}
