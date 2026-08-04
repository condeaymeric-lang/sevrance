# Outillage

---

## ESLint

Configuration plate (flat config), en trois couches dans `packages/config/eslint/` :

| Fichier     | Portée                                              |
| ----------- | --------------------------------------------------- |
| `base.mjs`  | Socle commun : TypeScript, tri des imports, hygiène |
| `react.mjs` | `base` + React, Hooks, `jsx-a11y`                   |
| `next.mjs`  | `react` + règles Next et Core Web Vitals            |
| `nest.mjs`  | `base` + adaptations NestJS                         |

### Règles bloquantes

- `@typescript-eslint/no-explicit-any` — la charte interdit `any`.
- `jsx-a11y/*` en **`error`**, pas en `warn` : l'accessibilité est un critère de
  sortie de sprint.
- `react-hooks/exhaustive-deps` en `error`.
- `simple-import-sort` — imports déterministes, donc diffs propres.

### Un piège à connaître : `consistent-type-imports` et NestJS

La règle est **désactivée dans `nest.mjs`**, et ce n'est pas un relâchement.

NestJS résout ses dépendances en lisant les types des paramètres de constructeur
via `emitDecoratorMetadata`. Un `import type` est effacé à la compilation : les
métadonnées `design:paramtypes` tombent alors sur `Object`, et le conteneur ne
sait plus quoi injecter.

Le piège est que le code continue de compiler **et** de passer le lint. L'échec
ne survient qu'au démarrage, sous la forme d'un `Nest can't resolve dependencies`
sans rapport apparent avec un import. Lancer `eslint --fix` sur cette règle dans
un projet Nest est une façon fiable de casser la production.

La règle reste active partout ailleurs, où aucune métadonnée d'exécution n'est
en jeu.

---

## Prettier

Configuration unique à la racine, avec `prettier-plugin-tailwindcss` : les
classes Tailwind sont triées automatiquement, dans les attributs `className`
comme dans les appels à `cn()`, `cva()` et `clsx()`.

```bash
npm run format         # écrit
npm run format:check   # vérifie (utilisé en CI)
```

---

## Husky et lint-staged

`.husky/pre-commit` lance `lint-staged` (ESLint + Prettier sur les fichiers
indexés), `.husky/pre-push` lance `npm run typecheck`.

### Pourquoi les hooks ne s'installent pas automatiquement

Matchly vit dans un sous-répertoire d'un dépôt Git qui héberge aussi un autre
produit. Installer Husky depuis ici écraserait `core.hooksPath` **pour le dépôt
entier**, et ferait tourner les hooks Matchly sur des commits qui n'ont rien à
voir avec Matchly.

`scripts/setup-husky.mjs` détecte la situation et s'abstient, en sortant en
succès pour ne jamais casser `npm install`. Pour activer les hooks
volontairement :

```bash
git -C <racine-du-dépôt> config core.hooksPath matchly/.husky/_
```

Le jour où Matchly devient la racine de son propre dépôt, l'installation
redevient automatique sans qu'aucune configuration ne change.

---

## Tests

**Vitest** partout, un seul lanceur pour tout le monorepo.

| Paquet      | Environnement | Particularité                                                                                                                                                                    |
| ----------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contracts` | node          | —                                                                                                                                                                                |
| `ui`        | jsdom         | Testing Library ; `vitest.setup.ts` fournit `matchMedia`, `ResizeObserver` et l'API Pointer Events, absents de jsdom et interrogés par Radix                                     |
| `web`       | jsdom         | `next/navigation` est doublé pour tester les composants qui lisent le chemin courant                                                                                             |
| `api`       | node          | `unplugin-swc` produit `emitDecoratorMetadata`, que l'esbuild de Vite ne sait pas générer — sans lui, tout test montant un module Nest échouerait sur une dépendance non résolue |

```bash
npm run test         # une passe
npm run test:watch   # mode veille
```

---

## TypeScript

Configurations partagées dans `packages/config/typescript/`, **volontairement
autonomes** : elles n'`extends` rien hors du paquet.

Un chemin relatif remontant hors du paquet se résout différemment selon
l'outil — `tsc` suit le lien symbolique des workspaces npm jusqu'au chemin réel,
le resolver de Vite/Vitest le suit depuis `node_modules/`. Le `extends` casse
alors d'un côté ou de l'autre. Tout garder dans le paquet supprime la classe de
bug entière.

Réglages notables, au-delà de `strict` :

| Option                                  | Effet                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| `noUncheckedIndexedAccess`              | `array[i]` est `T \| undefined` — impose de traiter le cas hors bornes          |
| `noUnusedLocals` / `noUnusedParameters` | Le code mort casse le build                                                     |
| `noImplicitOverride`                    | `override` obligatoire, évite les surcharges accidentelles                      |
| `isolatedModules`                       | Garantit que chaque fichier est transpilable seul (requis par Turbopack et SWC) |

---

## Turborepo

`turbo.json` décrit le graphe : `build` dépend de `^build`, donc `contracts` se
compile avant `api` et `web`. Le cache évite de reconstruire ce qui n'a pas
changé.

```bash
npx turbo run build --filter=@matchly/web...   # web et ses dépendances
npx turbo run test --filter=@matchly/ui        # un seul paquet
```
