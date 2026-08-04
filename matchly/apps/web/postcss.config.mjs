/**
 * Tailwind CSS 4 s'intègre via un unique plugin PostCSS.
 * Autoprefixer n'est plus nécessaire : Tailwind 4 gère lui-même les préfixes
 * en s'appuyant sur la cible de navigateurs du projet.
 *
 * @type {import('postcss-load-config').Config}
 */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
