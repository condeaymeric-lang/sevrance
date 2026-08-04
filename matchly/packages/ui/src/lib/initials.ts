/**
 * Extrait les initiales d'un nom, pour le repli d'avatar.
 *
 * Cette fonction vit dans son propre module, et non dans `avatar.tsx`, pour une
 * raison de frontière serveur/client. `avatar.tsx` porte `'use client'` : la
 * directive s'applique au MODULE entier, pas aux seuls composants. Toute valeur
 * qui en est exportée — y compris une fonction parfaitement pure — devient une
 * référence client, et l'appeler depuis un Server Component échoue au build sur
 * un « Attempted to call initials() from the server ».
 *
 * D'où l'invariant du Design System : **aucun export pur ne réside dans un
 * module `'use client'`**. Fonctions utilitaires et définitions de variantes
 * vivent dans des modules neutres, que les deux côtés peuvent importer.
 *
 * @param name Nom complet, par exemple « Amélie Dubois ».
 * @param max Nombre maximum d'initiales.
 *
 * @example
 * initials('Amélie Dubois')  // 'AD'
 * initials('FC Saint-Denis') // 'FS'
 */
export function initials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
    .slice(0, max)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
