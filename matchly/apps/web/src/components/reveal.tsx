import type { CSSProperties, ReactNode } from 'react';

export interface RevealProps {
  children: ReactNode;
  /**
   * Décalage du départ, en secondes. Sert à échelonner une grille.
   *
   * N'a d'effet que sur les navigateurs sans `animation-timeline: view()` :
   * ailleurs, la position dans la page tient déjà lieu d'échelonnement.
   */
  delay?: number;
  className?: string;
  /** Balise rendue. `li` quand le contenu est un élément de liste. */
  as?: 'div' | 'li' | 'section';
}

/**
 * Révèle son contenu à mesure qu'il entre dans le champ de vision.
 *
 * ## Pourquoi ce composant ne contient aucun JavaScript
 *
 * La première version s'appuyait sur `whileInView` de Framer Motion. Elle
 * masquait le contenu de toute la page pour les utilisateurs ayant demandé
 * moins d'animations — l'exact opposé de son intention.
 *
 * Le mécanisme mérite d'être retenu, parce qu'il vaut pour toute animation
 * conditionnée à une préférence système. `prefers-reduced-motion` n'est lisible
 * que dans un navigateur : le rendu serveur emprunte donc forcément la branche
 * animée et émet `opacity: 0` en style inline. Au moment de l'hydratation,
 * React ne retire pas un attribut `style` présent dans le HTML serveur mais
 * absent du rendu client — il n'y voit rien à réconcilier. Le style survit, et
 * la page reste transparente pour toujours. Changer de branche, de type
 * d'élément ou passer `initial={false}` n'y change rien : le mal est déjà
 * dans le HTML.
 *
 * En CSS, l'état masqué est déclaré à l'intérieur de
 * `@media (prefers-reduced-motion: no-preference)` — voir `tokens.css`. Il
 * n'existe pas pour qui a exprimé la préférence, et le HTML servi est toujours
 * visible. Le composant redevient au passage un Server Component : une
 * frontière client de moins, et zéro octet de JavaScript pour une animation
 * décorative.
 *
 * Ce composant ne doit jamais envelopper l'élément LCP : l'état initial
 * retarderait le Largest Contentful Paint.
 *
 * @example
 * {clubs.map((club, index) => (
 *   <Reveal as="li" key={club.id} delay={index * 0.06}>
 *     <ClubCard club={club} />
 *   </Reveal>
 * ))}
 */
export function Reveal({ children, delay = 0, className, as: Component = 'div' }: RevealProps) {
  return (
    <Component
      data-reveal
      className={className}
      style={delay > 0 ? ({ '--reveal-delay': `${String(delay)}s` } as CSSProperties) : undefined}
    >
      {children}
    </Component>
  );
}
