'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@matchly/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
] as const;

/**
 * Sélecteur de thème.
 *
 * Le composant ne rend son icône définitive qu'après montage. Le serveur ne
 * connaît pas la préférence de l'utilisateur — elle vit dans `localStorage` et
 * dans les réglages du système — et rendre une icône devinée provoquerait une
 * erreur d'hydratation, puis un scintillement au premier chargement. Un
 * gabarit inerte de même dimension tient la place en attendant, ce qui évite
 * aussi tout décalage de mise en page.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-hidden tabIndex={-1} disabled>
        <Sun className="size-4 opacity-0" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Changer de thème">
          <Sun className="size-4 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => {
              setTheme(value);
            }}
            // Signale l'option retenue autrement que par la seule couleur.
            aria-current={theme === value ? 'true' : undefined}
            className={theme === value ? 'font-semibold text-primary' : undefined}
          >
            <Icon aria-hidden />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
