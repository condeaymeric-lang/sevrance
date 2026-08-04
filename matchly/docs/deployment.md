# Déploiement

---

## Vercel — application web

Matchly vivant dans un sous-répertoire d'un dépôt qui héberge un autre produit,
**le réglage du répertoire racine est obligatoire** : sans lui, Vercel détecte
le projet de la racine du dépôt et déploie la mauvaise application.

### Réglages du projet

| Réglage            | Valeur                                         |
| ------------------ | ---------------------------------------------- |
| Framework Preset   | Next.js                                        |
| **Root Directory** | `matchly`                                      |
| Build Command      | `npx turbo run build --filter=@matchly/web...` |
| Install Command    | `npm ci`                                       |
| Output Directory   | `apps/web/.next`                               |
| Node.js Version    | 22.x                                           |

Ces valeurs sont déjà déclarées dans `matchly/vercel.json`. Seul **Root
Directory** doit être saisi dans l'interface : Vercel lit `vercel.json` _après_
avoir résolu ce répertoire, il ne peut donc pas s'y trouver.

> Dans les réglages du projet, décochez « Include files outside the Root
> Directory » : le déploiement ignore alors le reste du dépôt, ce qui raccourcit
> l'upload et évite qu'un changement sans rapport invalide le cache de build.

### Variables d'environnement

À définir pour les trois environnements (Production, Preview, Development) :

| Variable               | Production                       | Remarque                                                                                                                                       |
| ---------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | `https://matchly.app`            | Sur les aperçus, laisser vide : l'URL est déduite de `VERCEL_URL`, seule valeur correcte pour un déploiement dont l'URL change à chaque commit |
| `NEXT_PUBLIC_API_URL`  | `https://api.matchly.app/api/v1` |                                                                                                                                                |
| `NEXT_PUBLIC_WS_URL`   | `https://api.matchly.app`        |                                                                                                                                                |

Aucune de ces variables n'est un secret — le préfixe `NEXT_PUBLIC_` les expose
au navigateur par construction. **Ne jamais y mettre `DATABASE_URL` ni aucune
clé** : la valeur se retrouverait dans le bundle JavaScript public.

### Après le premier déploiement

1. Ajouter le domaine (`matchly.app`) dans l'onglet Domains.
2. Renseigner `NEXT_PUBLIC_SITE_URL` avec ce domaine, puis redéployer — les
   URLs canoniques, le sitemap et les cartes Open Graph en dépendent.
3. Vérifier `/robots.txt`, `/sitemap.xml` et `/opengraph-image`.

---

## GitHub Actions

`.github/workflows/matchly-ci.yml`, à la **racine du dépôt** : GitHub ne lit les
workflows que là. Un filtre `paths: ['matchly/**']` empêche les commits d'autres
produits du dépôt de déclencher cette chaîne, et inversement.

Quatre jobs parallèles :

| Job                 | Contenu                                                           |
| ------------------- | ----------------------------------------------------------------- |
| **Qualité**         | `format:check`, `lint`, `typecheck`                               |
| **Tests**           | Tests unitaires de tous les paquets                               |
| **Build**           | Build de production complet                                       |
| **Base de données** | `prisma validate` puis `prisma db push` contre un vrai PostgreSQL |

Le job base de données mérite une note : valider le schéma hors ligne ne prouve
rien. Seule une migration réellement appliquée révèle une contrainte impossible
ou un index en conflit.

Le job Qualité est séparé du Build pour que l'erreur remonte en une minute
plutôt qu'en dix.

---

## API — conteneur

L'API n'est pas déployable sur Vercel : elle maintient des connexions
persistantes (pool PostgreSQL, Redis, WebSocket) qu'un environnement sans état
ne peut pas conserver. Elle se déploie en conteneur — Railway, Fly.io, Render,
ou Kubernetes.

```bash
# Depuis matchly/
docker build -f apps/api/Dockerfile -t matchly-api .
docker run -p 4000:4000 --env-file .env matchly-api
```

L'image est construite en trois étapes pour que le résultat final ne contienne
ni outils de compilation, ni dépendances de développement, ni code source.

### Sondes à câbler sur l'orchestrateur

| Sonde     | Chemin          | Rôle                                                        |
| --------- | --------------- | ----------------------------------------------------------- |
| Liveness  | `/health/live`  | Le processus est-il vivant ? **Ne teste aucune dépendance** |
| Readiness | `/health/ready` | Puis-je router du trafic ? Teste PostgreSQL, Redis, mémoire |

Ne **jamais** pointer la sonde de vivacité sur `/health/ready` : une coupure
PostgreSQL ferait alors redémarrer en boucle des instances saines, transformant
une panne de base en panne totale.

### Variables d'environnement de l'API

Toutes sont validées par Zod au démarrage. Une variable manquante empêche le
processus de démarrer — c'est voulu, et immédiatement visible dans les logs de
déploiement.

| Variable                         | Obligatoire | Défaut                                                 |
| -------------------------------- | ----------- | ------------------------------------------------------ |
| `DATABASE_URL`                   | ✅          | —                                                      |
| `REDIS_URL`                      | ✅          | —                                                      |
| `API_PORT`                       |             | `4000`                                                 |
| `API_CORS_ORIGINS`               |             | `http://localhost:3000`                                |
| `API_SWAGGER_ENABLED`            |             | `true` — **à passer à `false` en production publique** |
| `API_RATE_LIMIT_TTL_MS` / `_MAX` |             | `60000` / `120`                                        |
| `MEDIAMTX_*`                     |             | Valeurs locales                                        |

### Migrations en production

```bash
npm run db:deploy --workspace @matchly/api   # prisma migrate deploy
```

À exécuter comme une étape de déploiement distincte, **avant** le basculement du
trafic — jamais au démarrage de l'application : plusieurs instances qui
migreraient simultanément entreraient en conflit sur le verrou de migration.

---

## Cloudflare

Prévu au Sprint 5, avec le streaming :

- proxy DNS et TLS sur `matchly.app` ;
- cache des segments HLS en périphérie — c'est là que se joue le coût de bande
  passante d'une plateforme vidéo ;
- WAF et protection anti-déni de service sur le point d'ingestion ;
- Cloudflare Images pour les médias téléversés par les utilisateurs.
