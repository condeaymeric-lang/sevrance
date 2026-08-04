import { Button, Container, Logo } from '@matchly/ui';
import Link from 'next/link';

import { ThemeToggle } from '@/components/theme/theme-toggle';

import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';

/**
 * En-tête du site.
 *
 * Server Component : seuls la navigation (qui lit le chemin courant), le menu
 * mobile et le sélecteur de thème sont des îlots clients. L'en-tête étant
 * présent sur toutes les pages, chaque kilo-octet économisé ici l'est partout.
 *
 * Le fond est vitré et non opaque : sous l'en-tête collant, le contenu qui
 * défile reste perceptible, ce qui préserve le sentiment de continuité.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border glass">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              aria-label="Matchly — retour à l'accueil"
              className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Logo />
            </Link>
            <MainNav />
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />

            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/connexion">Se connecter</Link>
            </Button>
            <Button asChild variant="gradient" size="sm" className="hidden sm:inline-flex">
              <Link href="/inscription">Créer un compte</Link>
            </Button>

            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
