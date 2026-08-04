import { z } from 'zod';

/**
 * Configuration de l'API, validée au démarrage.
 *
 * Le principe est le même que côté web, avec une exigence plus forte : l'API
 * détient la base de données et les secrets. Une variable manquante doit
 * empêcher le processus de démarrer, jamais produire un comportement dégradé
 * silencieux. Un serveur qui démarre sans `DATABASE_URL` accepterait du trafic
 * puis échouerait à la première requête — bien pire qu'un refus immédiat de
 * démarrer, immédiatement visible dans les logs de déploiement.
 */
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // --- Serveur HTTP --------------------------------------------------------
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  API_HOST: z.string().min(1).default('0.0.0.0'),
  API_GLOBAL_PREFIX: z.string().default('api'),
  API_SWAGGER_ENABLED: z
    .string()
    .default('true')
    .transform((value) => value === 'true'),

  /**
   * Origines autorisées en CORS, séparées par des virgules.
   *
   * Jamais de joker : les requêtes Matchly portent un cookie de session, et
   * `Access-Control-Allow-Origin: *` est de toute façon refusé par le
   * navigateur dès que `credentials` est activé.
   */
  API_CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),

  // --- Limitation de débit -------------------------------------------------
  API_RATE_LIMIT_TTL_MS: z.coerce.number().int().positive().default(60_000),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

  // --- Dépendances ---------------------------------------------------------
  DATABASE_URL: z.string().min(1, 'DATABASE_URL est obligatoire.'),
  REDIS_URL: z.string().min(1, 'REDIS_URL est obligatoire.'),
  REDIS_KEY_PREFIX: z.string().default('matchly:'),

  // --- Streaming -----------------------------------------------------------
  MEDIAMTX_RTMP_URL: z.string().default('rtmp://localhost:1935'),
  MEDIAMTX_HLS_URL: z.string().default('http://localhost:8888'),
  MEDIAMTX_WEBRTC_URL: z.string().default('http://localhost:8889'),
  MEDIAMTX_API_URL: z.string().default('http://localhost:9997'),
});

export type AppConfig = z.infer<typeof configSchema>;

/**
 * Valide l'environnement et renvoie la configuration typée.
 *
 * Branchée sur `ConfigModule.forRoot({ validate })`, cette fonction s'exécute
 * avant l'instanciation du moindre module.
 *
 * @param raw Environnement brut, tel que fourni par `process.env`.
 * @throws {Error} Si une variable est absente ou malformée, avec le détail
 *                 de chaque champ fautif.
 */
export function validateConfig(raw: Record<string, unknown>): AppConfig {
  const parsed = configSchema.safeParse(raw);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `Configuration invalide, démarrage interrompu :\n${details}\n` +
        'Consultez matchly/.env.example.',
    );
  }

  return parsed.data;
}
