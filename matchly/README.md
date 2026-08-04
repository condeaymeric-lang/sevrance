# Matchly

> Chaque match mérite son public.

La plateforme mondiale du sport amateur : diffuser, suivre, exister, revivre.

---

## État du projet

**Sprint 0 — architecture et Design System : terminé.**

Aucune fonctionnalité métier n'est développée à ce stade, et c'est volontaire :
la règle du projet est qu'aucune fonctionnalité ne démarre avant que
l'architecture ne soit posée. Ce qui est livré ici est le socle sur lequel les
sept sprints suivants viendront construire.

| Sprint | Contenu                                           | État                        |
| ------ | ------------------------------------------------- | --------------------------- |
| **0**  | Architecture, Design System, outillage, CI        | ✅ Terminé                  |
| 1      | Landing page, SEO, déploiement                    | ⏳ En attente de validation |
| 2      | Authentification (email, Google, Apple), sessions | ⏳                          |
| 3      | Dashboard, profils, paramètres, notifications     | ⏳                          |
| 4      | Clubs, équipes, championnats, matchs              | ⏳                          |
| 5      | Streaming, lecteur, chat, Match Center            | ⏳                          |
| 6      | Replays, historique, favoris, recherche           | ⏳                          |
| 7      | IA : highlights, résumés, statistiques            | ⏳                          |

---

## Structure

Monorepo npm workspaces, orchestré par Turborepo.

```
matchly/
├── apps/
│   ├── web/            Next.js 16 · React 19 · Tailwind CSS 4
│   └── api/            NestJS 11 · Prisma 7 · PostgreSQL · Redis · Socket.IO
├── packages/
│   ├── ui/             Design System (tokens, primitives, animations)
│   ├── contracts/      Schémas Zod et types partagés web ↔ api
│   └── config/         Configurations TypeScript et ESLint partagées
├── infra/
│   ├── docker-compose.yml   PostgreSQL · Redis · MediaMTX
│   └── mediamtx/            Ingestion RTMP, diffusion HLS et WebRTC
└── docs/               Architecture, outillage, déploiement
```

**Le paquet `contracts` est la pièce centrale de l'architecture.** Il ne dépend
ni de React, ni de NestJS, ni de Prisma : les deux côtés du réseau importent les
mêmes schémas Zod. Un formulaire valide donc exactement ce que l'API validera,
au lieu de deux jeux de règles qui divergent au premier oubli.

---

## Démarrage

Prérequis : **Node.js ≥ 20.9**, **npm ≥ 10**, **Docker** (pour l'infrastructure).

```bash
cd matchly

# 1. Dépendances
npm install

# 2. Variables d'environnement
cp .env.example .env
cp .env.example apps/web/.env.local

# 3. Infrastructure (PostgreSQL, Redis, MediaMTX)
npm run infra:up

# 4. Schéma de base de données
npm run db:generate
npm run db:migrate

# 5. Développement
npm run dev
```

| Service           | URL                                                 |
| ----------------- | --------------------------------------------------- |
| Web               | http://localhost:3000                               |
| Design System     | http://localhost:3000/design-system                 |
| API               | http://localhost:4000/api/v1                        |
| Documentation API | http://localhost:4000/api/docs                      |
| Sondes de santé   | http://localhost:4000/health/live · `/health/ready` |
| Ingestion RTMP    | rtmp://localhost:1935                               |
| Lecture HLS       | http://localhost:8888                               |
| Lecture WebRTC    | http://localhost:8889                               |

---

## Commandes

| Commande                          | Effet                                   |
| --------------------------------- | --------------------------------------- |
| `npm run dev`                     | Lance web et api en parallèle           |
| `npm run build`                   | Build de production de tous les paquets |
| `npm run lint`                    | ESLint sur tout le monorepo             |
| `npm run typecheck`               | Vérification des types                  |
| `npm run test`                    | Tests unitaires                         |
| `npm run format`                  | Formatage Prettier                      |
| `npm run db:migrate`              | Crée et applique une migration          |
| `npm run db:studio`               | Explorateur de base Prisma              |
| `npm run infra:up` / `infra:down` | Démarre / arrête l'infrastructure       |

---

## Qualité

Règles non négociables, appliquées par l'outillage plutôt que par la revue :

- **TypeScript strict**, `noUncheckedIndexedAccess` compris ;
- **aucun `any`** — `@typescript-eslint/no-explicit-any` est en `error` ;
- **accessibilité WCAG** — `jsx-a11y` est en `error`, pas en `warn` ;
- **thème clair et sombre** sur chaque composant ;
- **chaque composant testé**, chaque page responsive ;
- **animations respectant `prefers-reduced-motion`**.

État actuel : **131 tests**, lint et typecheck verts sur les cinq paquets.

---

## Documentation

| Document                                       | Contenu                                           |
| ---------------------------------------------- | ------------------------------------------------- |
| [`docs/architecture.md`](docs/architecture.md) | Décisions structurantes et leurs raisons          |
| [`docs/tooling.md`](docs/tooling.md)           | ESLint, Prettier, Husky, tests                    |
| [`docs/deployment.md`](docs/deployment.md)     | Vercel, GitHub Actions, variables d'environnement |

---

## Identité

|             |                                     |
| ----------- | ----------------------------------- |
| **Nom**     | Matchly                             |
| **Slogan**  | Chaque match mérite son public.     |
| **Logo**    | Version 08 (provisoire)             |
| **Palette** | Blanc · Noir · Violet · Bleu · Cyan |
| **Police**  | Poppins                             |
