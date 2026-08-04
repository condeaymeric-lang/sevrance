import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Fusion de classes Tailwind avec résolution des conflits.
 *
 * `clsx` résout le conditionnel (`{ 'x': cond }`, tableaux, valeurs nulles),
 * `tailwind-merge` résout les collisions : dans `cn('px-4', 'px-6')`, seul
 * `px-6` survit. Sans cette seconde étape, une classe passée en prop ne pourrait
 * pas surcharger celle du composant — l'ordre dans la feuille de style
 * l'emporterait sur l'ordre dans l'attribut, et le résultat dépendrait du hasard
 * de compilation.
 *
 * Les utilitaires de marque définis dans `tokens.css` sont déclarés ici pour que
 * `tailwind-merge` sache dans quel groupe de conflit les ranger. Sans cette
 * déclaration ils lui sont inconnus, donc jamais candidats à l'éviction :
 * `cn('bg-gradient-brand', 'bg-gradient-brand-soft')` émettrait les deux et le
 * résultat dépendrait de l'ordre de la feuille de style.
 *
 * Chaque utilitaire est rangé dans le groupe de la propriété CSS qu'il écrit —
 * `bg-image` et non `bg-color` pour les dégradés. Un dégradé et une couleur de
 * fond ne s'excluent d'ailleurs pas en CSS : `bg-gradient-brand bg-red-500` est
 * une combinaison légitime, où la couleur sert de repli.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'text-color': ['text-gradient-brand'],
      'bg-image': ['bg-gradient-brand', 'bg-gradient-brand-soft'],
      shadow: ['shadow-glow'],
    },
  },
});

/**
 * Compose des classes CSS conditionnelles en résolvant les conflits Tailwind.
 *
 * @example
 * cn('rounded-lg px-4', isActive && 'bg-primary', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
