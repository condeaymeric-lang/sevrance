import { describe, expect, it } from 'vitest';

import { buildPage, cursorPaginationSchema, PAGE_SIZE_DEFAULT } from './pagination';

interface Row {
  id: string;
}

const rows = (count: number): Row[] =>
  Array.from({ length: count }, (_, index) => ({ id: `row-${index}` }));

describe('buildPage', () => {
  it('détecte la page suivante grâce à la ligne sur-lue', () => {
    const page = buildPage(rows(21), 20, (row) => row.id);

    expect(page.items).toHaveLength(20);
    expect(page.pageInfo.hasNextPage).toBe(true);
    expect(page.pageInfo.nextCursor).toBe('row-19');
    expect(page.pageInfo.count).toBe(20);
  });

  it('signale la fin du flux quand il n’y a pas de ligne excédentaire', () => {
    const page = buildPage(rows(12), 20, (row) => row.id);

    expect(page.items).toHaveLength(12);
    expect(page.pageInfo.hasNextPage).toBe(false);
    expect(page.pageInfo.nextCursor).toBeNull();
  });

  it('gère une page vide sans produire de curseur', () => {
    const page = buildPage([], 20, (row: Row) => row.id);

    expect(page.items).toEqual([]);
    expect(page.pageInfo.hasNextPage).toBe(false);
    expect(page.pageInfo.nextCursor).toBeNull();
    expect(page.pageInfo.count).toBe(0);
  });

  it('ne mute pas le tableau source', () => {
    const source = rows(5);

    buildPage(source, 20, (row) => row.id);

    expect(source).toHaveLength(5);
  });
});

describe('cursorPaginationSchema', () => {
  it('applique la limite par défaut', () => {
    expect(cursorPaginationSchema.parse({})).toEqual({ limit: PAGE_SIZE_DEFAULT });
  });

  it('convertit la limite reçue en query string', () => {
    expect(cursorPaginationSchema.parse({ limit: '50' }).limit).toBe(50);
  });

  it('refuse une limite hors bornes', () => {
    expect(cursorPaginationSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(cursorPaginationSchema.safeParse({ limit: 500 }).success).toBe(false);
  });
});
