'use client';

import { useEffect } from 'react';

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Frontière d'erreur de dernier recours.
 *
 * Ne se déclenche que si le layout racine lui-même échoue. Ce composant
 * remplace alors tout le document : il doit donc rendre ses propres balises
 * `<html>` et `<body>`.
 *
 * Aucun import du Design System ici, et aucun style Tailwind : si le layout
 * racine a échoué, la feuille de style peut ne pas être chargée. Les styles
 * sont écrits en ligne pour que cette page reste lisible dans tous les cas.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[matchly] erreur fatale :', error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          color: '#fafafa',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>
            Matchly est momentanément indisponible
          </h1>

          <p style={{ marginTop: '1rem', color: '#a1a1aa', lineHeight: 1.6 }}>
            Une erreur inattendue a interrompu le chargement de la page. Nos équipes en ont été
            informées.
          </p>

          {error.digest === undefined ? null : (
            <p
              style={{
                marginTop: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: '#71717a',
              }}
            >
              Référence : {error.digest}
            </p>
          )}

          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'linear-gradient(135deg, #6d28d9, #2563eb, #06b6d4)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Recharger la page
          </button>
        </div>
      </body>
    </html>
  );
}
