'use client';

import { cn } from '@matchly/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { mainNav } from '@/config/site';

/**
 * Indique si un lien de navigation correspond au chemin courant.
 *
 * La comparaison est préfixée pour que `/clubs/fc-saint-denis` garde l'entrée
 * « Clubs » active — une correspondance stricte ferait disparaître le repère
 * dès que l'utilisateur descend dans l'arborescence. La racine est traitée à
 * part : sinon elle serait préfixe de toutes les autres routes.
 *
 * @param pathname Chemin courant.
 * @param href Cible du lien.
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navigation principale, affichée à partir du point de rupture `lg`. */
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation principale" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {mainNav.map((item) => {
          const active = isNavItemActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                // `aria-current` porte l'information d'état pour les lecteurs
                // d'écran ; le soulignement la porte pour les autres.
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'hover:text-foreground',
                  'outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-brand"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
