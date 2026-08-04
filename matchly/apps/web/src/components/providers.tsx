'use client';

import { TooltipProvider } from '@matchly/ui';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { createQueryClient } from '@/lib/query-client';

/**
 * Client de requêtes réutilisé pour toute la session navigateur.
 *
 * `undefined` tant qu'on est côté serveur : chaque rendu serveur doit repartir
 * d'un cache vierge, faute de quoi les données d'un visiteur pourraient être
 * servies à un autre.
 */
let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}

export interface ProvidersProps {
  children: ReactNode;
}

/**
 * Contextes globaux de l'application.
 *
 * Regroupés dans un unique composant client monté par le layout racine : le
 * layout reste ainsi un Server Component, et seule cette frontière est envoyée
 * au navigateur.
 */
export function Providers({ children }: ProvidersProps) {
  /**
   * `useState` avec initialiseur paresseux, et non un appel direct : en mode
   * strict React monte deux fois, et un appel direct créerait puis jetterait un
   * client à chaque rendu, vidant le cache sans prévenir.
   */
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        // Neutralise les transitions CSS pendant la bascule de thème : sans
        // cela, chaque couleur de la page s'anime et le changement paraît lent.
        disableTransitionOnChange
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
