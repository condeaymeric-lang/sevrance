import { Badge, cn } from '@matchly/ui';
import type { ReactNode } from 'react';

export interface SectionHeadingProps {
  /** Étiquette au-dessus du titre. */
  eyebrow?: string;
  title: string;
  description?: string;
  /**
   * Signale que la section montre du contenu illustratif.
   *
   * Affiche une mention « Aperçu » explicite. Les données de démonstration de
   * la landing page décrivent des clubs et des matchs qui n'existent pas :
   * les présenter sans le dire reviendrait à mentir sur la traction du produit.
   */
  preview?: boolean;
  /** Action alignée à droite sur grand écran. */
  action?: ReactNode;
  className?: string;
  /** Niveau de titre. Toujours `h2` sur une page dont le `h1` est le hero. */
  as?: 'h2' | 'h3';
}

/**
 * En-tête de section de la landing page.
 *
 * Centralisé pour que le rythme typographique — taille, graisse, espacement,
 * largeur de l'accroche — soit identique d'une section à l'autre. Recomposé
 * à la main dans chaque section, il dérive au troisième copier-coller.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  preview = false,
  action,
  className,
  as: Heading = 'h2',
}: SectionHeadingProps) {
  return (
    <div
      className={cn('flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between', className)}
    >
      <div className="flex flex-col gap-3">
        {eyebrow === undefined && !preview ? null : (
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow === undefined ? null : <Badge variant="brand">{eyebrow}</Badge>}
            {preview ? (
              <Badge variant="outline" className="text-muted-foreground">
                Aperçu — données d’illustration
              </Badge>
            ) : null}
          </div>
        )}

        <Heading className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </Heading>

        {description === undefined ? null : (
          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
      </div>

      {action === undefined ? null : <div className="shrink-0">{action}</div>}
    </div>
  );
}
