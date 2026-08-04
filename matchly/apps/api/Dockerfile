# =============================================================================
# MATCHLY — image de production de l'API
# -----------------------------------------------------------------------------
# Construction depuis la racine du monorepo :
#   docker build -f apps/api/Dockerfile -t matchly-api .
#
# Trois étapes, pour une raison précise : l'image finale ne doit contenir ni les
# outils de compilation, ni les dépendances de développement, ni le code source.
# Une image mono-étape embarquerait TypeScript, ESLint, Vitest et le CLI Nest —
# quelques centaines de mégaoctets de surface d'attaque inutile en production.
# =============================================================================

# -----------------------------------------------------------------------------
# Étape 1 — dépendances complètes
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# Seuls les manifestes sont copiés d'abord : tant qu'aucune dépendance ne change,
# Docker réutilise le cache de cette couche et saute l'installation entière.
COPY package.json package-lock.json ./
COPY packages/config/package.json ./packages/config/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# `npm ci` installe exactement le lockfile, sans jamais le modifier.
RUN npm ci --ignore-scripts

# -----------------------------------------------------------------------------
# Étape 2 — compilation
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY . .

# Le client Prisma est généré depuis le schéma versionné, jamais copié : une
# image ne doit pas dépendre d'un artefact produit sur un poste de développeur.
RUN npm run db:generate --workspace @matchly/api \
  && npm run build --workspace @matchly/contracts \
  && npm run build --workspace @matchly/api

# Élague les dépendances de développement du graphe installé.
RUN npm prune --omit=dev

# -----------------------------------------------------------------------------
# Étape 3 — exécution
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Laisse Node ajuster son tas à la limite mémoire du conteneur plutôt qu'à la
# RAM de l'hôte : sans cela, le processus se fait tuer par l'OOM killer avant
# d'avoir déclenché son propre ramasse-miettes.
ENV NODE_OPTIONS="--max-old-space-size=768"

# `dumb-init` occupe le PID 1 et relaie SIGTERM au processus Node. Sans lui,
# Node ignore le signal d'arrêt, les hooks de fermeture ne s'exécutent pas, et
# chaque redéploiement laisse des connexions PostgreSQL ouvertes.
RUN apk add --no-cache dumb-init

# Utilisateur non privilégié : une exécution en root dans le conteneur
# transforme une exécution de code arbitraire en compromission de l'hôte.
RUN addgroup -g 1001 -S matchly && adduser -u 1001 -S matchly -G matchly

COPY --from=builder --chown=matchly:matchly /app/node_modules ./node_modules
COPY --from=builder --chown=matchly:matchly /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=matchly:matchly /app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=matchly:matchly /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=matchly:matchly /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder --chown=matchly:matchly /app/packages/contracts/package.json ./packages/contracts/

USER matchly
WORKDIR /app/apps/api

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
