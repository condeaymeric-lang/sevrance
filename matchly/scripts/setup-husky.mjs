#!/usr/bin/env node
/**
 * Installe les hooks Git Husky uniquement lorsque c'est sûr.
 *
 * Matchly vit actuellement dans un sous-répertoire d'un dépôt Git qui héberge
 * aussi un autre produit. Installer Husky depuis ici écraserait `core.hooksPath`
 * pour l'ensemble du dépôt et ferait tourner les hooks Matchly sur des commits
 * qui n'ont rien à voir avec Matchly.
 *
 * Ce script :
 *   - installe Husky si (et seulement si) la racine Git est le dossier Matchly ;
 *   - sinon, affiche la marche à suivre et sort en succès (0) pour ne jamais
 *     casser `npm install` ni la CI.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** La CI n'a pas besoin des hooks : on sort immédiatement. */
if (process.env.CI || process.env.HUSKY === '0' || process.env.VERCEL) {
  process.exit(0);
}

/** @returns {string | null} racine du dépôt Git, ou null si hors dépôt. */
function gitRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: packageRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

const root = gitRoot();

if (root === null) {
  console.log('[husky] hors dépôt Git — installation ignorée.');
  process.exit(0);
}

if (resolve(root) !== packageRoot) {
  console.log(
    [
      '[husky] Matchly est un sous-répertoire du dépôt Git.',
      `        Racine Git : ${root}`,
      `        Matchly    : ${packageRoot}`,
      '        Les hooks ne sont pas installés pour ne pas modifier',
      "        core.hooksPath à l'échelle du dépôt entier.",
      '        Pour les activer volontairement :',
      `          git -C "${root}" config core.hooksPath matchly/.husky/_`,
      '        Voir matchly/docs/tooling.md.',
    ].join('\n'),
  );
  process.exit(0);
}

if (!existsSync(resolve(packageRoot, 'node_modules', 'husky'))) {
  console.log('[husky] paquet absent — installation ignorée.');
  process.exit(0);
}

execFileSync('npx', ['husky'], { cwd: packageRoot, stdio: 'inherit' });
