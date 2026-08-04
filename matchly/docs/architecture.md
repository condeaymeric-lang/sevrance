# Architecture

Ce document consigne les décisions structurantes du Sprint 0 **et leurs
raisons**. Une décision dont on a oublié le motif est une décision qu'on
détricote au premier inconfort.

---

## 1. Monorepo

**Décision.** npm workspaces + Turborepo, quatre applications et paquets.

**Pourquoi.** Le web et l'API partagent un vocabulaire de domaine : sports,
statuts de match, rôles de club, format des erreurs. Dans deux dépôts séparés,
ce vocabulaire est dupliqué et diverge — c'est mécanique, pas hypothétique. Le
monorepo permet à `@matchly/contracts` d'être la seule définition, importée des
deux côtés.

Turborepo apporte le graphe de dépendances entre tâches (`contracts` se
construit avant `api`) et un cache qui évite de reconstruire ce qui n'a pas
changé.

**Ce qu'on accepte en échange.** Un `npm install` plus long, et l'obligation de
tenir les versions alignées entre paquets.

---

## 2. `@matchly/contracts` — la frontière typée

**Décision.** Un paquet sans dépendance à React, NestJS ou Prisma, contenant
uniquement des schémas Zod, des types et des fonctions pures.

**Pourquoi.** C'est ce qui rend la promesse du typage vraie plutôt
qu'optimiste. Le typage TypeScript s'arrête à la frontière réseau : ce qui
arrive dans un `fetch` est `unknown`, et le déclarer typé est une fiction qu'un
déploiement d'API désynchronisé démolit silencieusement. En validant la réponse
avec le même schéma Zod des deux côtés, on fait de cette frontière le seul
point d'entrée de données non fiables.

**Conséquence pratique.** Un champ renommé dans l'API casse la compilation du
web. C'est le comportement recherché.

---

## 3. Validation avec Zod, pas `class-validator`

**Décision.** L'API valide ses entrées avec `ZodValidationPipe`, non avec le
`ValidationPipe` de NestJS.

**Pourquoi.** `class-validator` repose sur des décorateurs de classe : ses
règles ne peuvent pas franchir la frontière réseau ni être exécutées par un
formulaire React. Zod le peut. Un seul schéma sert donc à la fois la validation
côté navigateur et côté serveur.

---

## 4. Pagination par curseur uniquement

**Décision.** Aucune API Matchly n'expose de pagination par `offset`.

**Pourquoi.** Sur des flux triés par date qui changent pendant la navigation,
`OFFSET n` fait sauter ou dupliquer des lignes. Et son coût croît linéairement
avec la profondeur : `OFFSET 100000` oblige PostgreSQL à parcourir cent mille
lignes pour les jeter. Sur une table de matchs destinée à dépasser le million
de lignes, c'est disqualifiant.

Le curseur encode la clé de tri de la dernière ligne rendue : coût constant,
défilement stable.

**Détail d'implémentation.** On lit `limit + 1` lignes ; l'existence de la ligne
excédentaire donne `hasNextPage` sans exécuter de `COUNT(*)`.

---

## 5. Clés primaires en UUID v7

**Décision.** `@default(uuid(7))` sur toutes les tables.

**Pourquoi.** Un UUID v4 est purement aléatoire : chaque insertion tombe à un
endroit imprévisible de l'index B-tree, qui se fragmente, et les pages chaudes
cessent de tenir en cache. Un UUID v7 commence par un horodatage, donc les
insertions restent quasi séquentielles.

On garde l'avantage d'un identifiant non devinable — un entier auto-incrémenté
exposerait le volume d'activité et permettrait l'énumération — sans le coût
d'écriture du v4.

---

## 6. Enveloppe d'erreur unique

**Décision.** Toute erreur de l'API sort en `{ error: { code, message, fields?,
requestId?, timestamp } }`, garantie par un filtre global.

**Pourquoi.** Le frontend n'a qu'un format à savoir lire, et il branche son
affichage sur `code` — stable, destiné aux machines — plutôt que sur `message`,
traduisible et susceptible d'évoluer. Le catalogue de codes est fermé : ajouter
un code est un changement de contrat, donc visible en revue.

Les erreurs 5xx ne divulguent jamais leur message d'origine : une trace de pile
ou une requête SQL dans un corps de réponse est une fuite exploitable. Le
`requestId` permet de retrouver le détail dans les logs.

---

## 7. Design System en source, non compilé

**Décision.** `@matchly/ui` exporte du TypeScript source, transpilé par
l'application hôte via `transpilePackages`.

**Pourquoi.** Une étape de build intermédiaire fait sauter les directives
`'use client'` selon l'outil, transformant silencieusement un composant
interactif en composant serveur — un bug qui ne se manifeste qu'à l'exécution.
En consommant la source, la directive traverse intacte et le tree shaking de
Next s'applique normalement.

`@matchly/contracts`, lui, **est** compilé : NestJS ne peut pas transpiler une
dépendance TypeScript brute.

---

## 8. Tokens en OKLCH

**Décision.** Toute la palette est écrite en OKLCH, jamais en hexadécimal.

**Pourquoi.** OKLCH est perceptuellement uniforme : deux teintes de même
luminosité `L` sont perçues aussi claires l'une que l'autre. Une échelle
50→950 construite ainsi garde un contraste homogène d'une couleur à l'autre,
ce qui rend les seuils WCAG prévisibles au lieu d'être vérifiés au cas par cas.

C'est aussi ce qui permet au violet, au bleu et au cyan de coexister dans un
dégradé sans la zone grisâtre que produit une interpolation sRGB.

**Corollaire.** `@theme inline` est obligatoire côté Tailwind : sans `inline`,
les valeurs sont figées au build et les utilitaires garderaient la couleur du
thème clair sous `.dark`.

---

## 9. Primitives Radix pour tout composant à état

**Décision.** Dialog, DropdownMenu, Tabs, Tooltip, Switch, Avatar, Sheet
reposent sur Radix.

**Pourquoi.** L'essentiel du coût réel de ces composants n'est pas visuel : c'est
le piège de focus, la restauration du focus à la fermeture, la navigation aux
flèches, `aria-controls`, l'inertie du fond. Les réimplémenter est la source
d'erreur d'accessibilité la plus fréquente, et ces comportements sont
non négociables (WCAG 2.1.2, 2.4.3, 4.1.2).

Radix ne fournit aucun style : l'identité visuelle reste entièrement la nôtre.

---

## 10. Deux sondes de santé distinctes

**Décision.** `/health/live` ne teste rien ; `/health/ready` teste PostgreSQL,
Redis et la mémoire.

**Pourquoi.** Ce sont deux questions différentes. Inclure la base dans la sonde
de vivacité serait une faute grave : une coupure PostgreSQL ferait redémarrer en
boucle des instances parfaitement saines, transformant une panne de base en
panne totale. La sonde de disponibilité, elle, retire l'instance du pool sans la
tuer, et elle y revient d'elle-même.

---

## 11. Salons Socket.IO par match

**Décision.** Chaque match a son salon `match:<id>` ; aucune diffusion globale.

**Pourquoi.** Diffuser à tous les sockets connectés et laisser le client filtrer
fonctionne à cent spectateurs et s'effondre à cent mille : chaque message
serait sérialisé et poussé sur chaque connexion.

**Dette assumée.** À plusieurs instances, l'adaptateur Redis sera indispensable —
sans lui, un message émis par une instance n'atteint pas les sockets des autres.
`RedisService` est prêt ; le branchement est prévu au Sprint 5.

---

## 12. Streaming : WebRTC **et** HLS

**Décision.** MediaMTX reçoit une ingestion RTMP unique et sert deux sorties.

**Pourquoi ce n'est pas une redondance.** WebRTC donne la latence sub-seconde
indispensable au chat et au Match Center — commenter une action déjà passée
depuis six secondes ruine l'expérience. HLS traverse les pare-feux
d'entreprise, passe par les CDN et fonctionne sur les téléviseurs connectés. Un
match amateur se regarde depuis les deux.

**En production.** Un serveur TURN devient obligatoire : sans lui, les
spectateurs derrière un NAT symétrique ne reçoivent aucun flux WebRTC.

---

## Décisions différées, et pourquoi

| Sujet                           | Sprint | Raison du report                                                                                                                                                                    |
| ------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content-Security-Policy         | 5      | Écrite avant de connaître les origines média (HLS, WebRTC, CDN), elle serait soit inutilement laxiste, soit corrigée dans l'urgence à chaque sprint. Introduction en `Report-Only`. |
| Limitation de débit dans Redis  | —      | Le compteur en mémoire suffit à une instance. À revoir dès la mise à l'échelle horizontale.                                                                                         |
| `typedRoutes` de Next           | 1      | Les types sont produits par `next build`, or Turborepo lance `typecheck` et `build` en parallèle : le typecheck échouerait de façon non déterministe.                               |
| Transcodage multi-qualité (ABR) | 5      | Le faire dans MediaMTX mettrait la CPU du serveur média sur le chemin critique de l'ingestion ; une seule diffusion dégraderait toutes les autres. Service FFmpeg dédié.            |
| Sentry / observabilité          | 1      | La frontière d'erreur est en place et journalise déjà ; le branchement du collecteur suit.                                                                                          |
