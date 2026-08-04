import { defineConfig } from 'prisma/config';

/**
 * Configuration de la CLI Prisma.
 *
 * Prisma 7 a sorti l'URL de connexion du fichier `schema.prisma`. C'est un
 * progrès : le schéma redevient une description pure du modèle, versionnable et
 * lisible, tandis que la connexion — qui diffère entre poste local, CI, aperçu
 * et production — vit dans un fichier TypeScript capable de lire
 * l'environnement.
 *
 * Ce fichier ne sert qu'aux commandes de la CLI (`migrate`, `studio`,
 * `generate`). À l'exécution, l'application ouvre sa propre connexion via
 * l'adaptateur `@prisma/adapter-pg` — voir `PrismaService`.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
