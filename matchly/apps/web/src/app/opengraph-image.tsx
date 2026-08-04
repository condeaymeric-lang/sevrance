import { ImageResponse } from 'next/og';

import { siteConfig } from '@/config/site';

export const alt = `${siteConfig.name} — ${siteConfig.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Carte Open Graph par défaut, générée au build.
 *
 * Volontairement écrite avec des polices système plutôt qu'avec Poppins :
 * charger une police distante ici ferait dépendre le build d'un appel réseau
 * sortant, ce qui échoue dans les environnements de CI cloisonnés. La carte est
 * une image de partage, pas une page de marque — la composition et les couleurs
 * portent l'identité, pas la graisse de la police.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        backgroundColor: '#0a0a0f',
        backgroundImage:
          'radial-gradient(circle at 20% 0%, rgba(109,40,217,0.45) 0%, transparent 55%), radial-gradient(circle at 90% 100%, rgba(6,182,212,0.35) 0%, transparent 50%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <svg width="72" height="72" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient
              id="og-mark"
              x1="2"
              y1="4"
              x2="30"
              y2="28"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <path
            d="M4 26V9.5a1.5 1.5 0 0 1 2.6-1.02L16 18.5l9.4-10.02A1.5 1.5 0 0 1 28 9.5V26"
            stroke="url(#og-mark)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{ fontSize: 48, fontWeight: 700, color: '#ffffff', letterSpacing: -1 }}>
          Matchly
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <span
          style={{
            fontSize: 76,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          Chaque match mérite son public.
        </span>
        <span style={{ fontSize: 30, color: '#a1a1aa', lineHeight: 1.4 }}>
          La plateforme mondiale du sport amateur.
        </span>
      </div>
    </div>,
    size,
  );
}
