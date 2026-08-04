import { cn } from '@matchly/ui';

import type { PreviewStanding } from '@/content/landing';

/** Libellé complet de chaque résultat, pour les lecteurs d'écran. */
const FORM_LABELS = { W: 'Victoire', D: 'Nul', L: 'Défaite' } as const;

const FORM_STYLES = {
  W: 'bg-success text-success-foreground',
  D: 'bg-muted text-muted-foreground',
  L: 'bg-destructive text-destructive-foreground',
} as const;

/**
 * Pastille de résultat.
 *
 * La lettre est conservée en plus de la couleur : une pastille uniquement
 * colorée serait indéchiffrable pour un daltonien, la forme la plus courante de
 * daltonisme confondant précisément le vert et le rouge (WCAG 1.4.1).
 */
function FormDot({ result }: { result: PreviewStanding['form'][number] }) {
  return (
    <span
      className={cn(
        'inline-flex size-5 items-center justify-center rounded-full text-[0.625rem] font-bold',
        FORM_STYLES[result],
      )}
      title={FORM_LABELS[result]}
    >
      <span aria-hidden>{result}</span>
      <span className="sr-only">{FORM_LABELS[result]}</span>
    </span>
  );
}

export interface StandingsTableProps {
  standings: readonly PreviewStanding[];
  /** Légende du tableau, annoncée aux lecteurs d'écran. */
  caption: string;
  className?: string;
}

/**
 * Classement d'une compétition.
 *
 * Rendu en `<table>` et non en grille de `<div>`. Un classement *est* un
 * tableau de données : la structure sémantique permet à un lecteur d'écran
 * d'annoncer « ligne 3, colonne Points, 35 » au lieu d'égrener des nombres hors
 * contexte. Les `<th scope>` sont ce qui rend cette annonce possible.
 *
 * Le conteneur défile horizontalement plutôt que de compresser les colonnes :
 * sur mobile, un tableau écrasé devient illisible bien avant d'être compact.
 */
export function StandingsTable({ standings, caption, className }: StandingsTableProps) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full min-w-[34rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>

        <thead>
          <tr className="border-b border-border text-xs text-muted-foreground">
            <th scope="col" className="py-3 pr-2 text-left font-medium">
              #
            </th>
            <th scope="col" className="py-3 pr-4 text-left font-medium">
              Équipe
            </th>
            <th scope="col" className="px-2 py-3 text-right font-medium">
              J
            </th>
            <th scope="col" className="px-2 py-3 text-right font-medium">
              G
            </th>
            <th scope="col" className="px-2 py-3 text-right font-medium">
              N
            </th>
            <th scope="col" className="px-2 py-3 text-right font-medium">
              P
            </th>
            <th scope="col" className="px-2 py-3 text-right font-medium">
              Pts
            </th>
            <th scope="col" className="py-3 pl-4 text-right font-medium">
              Forme
            </th>
          </tr>
        </thead>

        <tbody>
          {standings.map((row) => (
            <tr
              key={row.team}
              className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/50"
            >
              <td className="py-3 pr-2">
                <span
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-md text-xs font-semibold tabular-nums',
                    // Le podium est mis en avant : c'est l'information qu'on
                    // cherche en premier dans un classement.
                    row.rank <= 3 ? 'bg-gradient-brand text-white' : 'text-muted-foreground',
                  )}
                >
                  {row.rank}
                </span>
              </td>

              <th scope="row" className="py-3 pr-4 text-left font-medium">
                {row.team}
              </th>

              <td className="px-2 py-3 text-right text-muted-foreground tabular-nums">
                {row.played}
              </td>
              <td className="px-2 py-3 text-right text-muted-foreground tabular-nums">{row.won}</td>
              <td className="px-2 py-3 text-right text-muted-foreground tabular-nums">
                {row.drawn}
              </td>
              <td className="px-2 py-3 text-right text-muted-foreground tabular-nums">
                {row.lost}
              </td>
              <td className="px-2 py-3 text-right font-bold tabular-nums">{row.points}</td>

              <td className="py-3 pl-4">
                <div className="flex items-center justify-end gap-1">
                  {row.form.map((result, index) => (
                    <FormDot key={`${row.team}-${String(index)}`} result={result} />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
