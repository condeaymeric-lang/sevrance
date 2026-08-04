'use client';

import {
  Button,
  cn,
  Logo,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  VisuallyHidden,
} from '@matchly/ui';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { mainNav } from '@/config/site';

import { isNavItemActive } from './main-nav';

/**
 * Navigation mobile, dans un panneau coulissant.
 *
 * Le panneau se referme à chaque changement de chemin : sans cela, il resterait
 * ouvert par-dessus la page fraîchement chargée, puisque la navigation côté
 * client ne démonte pas l'en-tête.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Ouvrir le menu">
          <Menu className="size-5" aria-hidden />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full max-w-xs">
        <SheetHeader>
          <Logo />
          {/* Radix exige un titre ; le logo tient déjà ce rôle visuellement. */}
          <VisuallyHidden>
            <SheetTitle>Navigation principale</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>

        <SheetBody>
          <nav aria-label="Navigation principale">
            <ul className="flex flex-col gap-1">
              {mainNav.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-start gap-3 rounded-xl p-3 transition-colors',
                        'outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        active ? 'bg-secondary' : 'hover:bg-secondary/60',
                      )}
                    >
                      <Icon
                        aria-hidden
                        className={cn(
                          'mt-0.5 size-5 shrink-0',
                          active ? 'text-primary' : 'text-muted-foreground',
                        )}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6">
            <Button asChild variant="outline" fullWidth>
              <Link href="/connexion">Se connecter</Link>
            </Button>
            <Button asChild variant="gradient" fullWidth>
              <Link href="/inscription">Créer un compte</Link>
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
