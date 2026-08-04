import { Container, Logo } from '@matchly/ui';
import Link from 'next/link';

import { footerNav, siteConfig } from '@/config/site';

/**
 * Pied de page du site.
 *
 * Chaque colonne est un `<nav>` doté de son propre `aria-label` : un lecteur
 * d'écran qui liste les repères de la page distingue alors « Plateforme » de
 * « Légal », au lieu de trois « navigation » indiscernables.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm text-balance text-muted-foreground">
              {siteConfig.slogan} Matchly diffuse, classe et archive le sport amateur.
            </p>
          </div>

          {footerNav.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-sm font-semibold">{section.title}</h2>
              <ul className="mt-4 flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="rounded text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} {siteConfig.name}. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">Conçu pour le sport amateur.</p>
        </div>
      </Container>
    </footer>
  );
}
