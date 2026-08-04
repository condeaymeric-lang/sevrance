'use client';

import * as VisuallyHiddenPrimitive from '@radix-ui/react-visually-hidden';
import type * as React from 'react';

/**
 * Masque un contenu à l'œil tout en le laissant accessible aux lecteurs d'écran.
 *
 * À ne pas confondre avec `display: none` ou `hidden`, qui retirent l'élément de
 * l'arbre d'accessibilité. Cas d'usage typique : un `DialogTitle` obligatoire
 * mais superflu visuellement, ou l'intitulé d'un bouton réduit à son icône.
 *
 * @example
 * <VisuallyHidden><DialogTitle>Navigation principale</DialogTitle></VisuallyHidden>
 */
export function VisuallyHidden(props: React.ComponentProps<typeof VisuallyHiddenPrimitive.Root>) {
  return <VisuallyHiddenPrimitive.Root data-slot="visually-hidden" {...props} />;
}
