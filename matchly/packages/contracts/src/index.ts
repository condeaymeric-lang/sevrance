/**
 * `@matchly/contracts` — source de vérité partagée entre `apps/web` et `apps/api`.
 *
 * Ce paquet ne contient aucune dépendance à React, à NestJS ni à Prisma : il est
 * consommable des deux côtés du réseau. C'est ce qui permet à un formulaire de
 * valider exactement ce que l'API validera, sans duplication de règles.
 *
 * Il ne doit contenir que des schémas, des types et des fonctions pures.
 */

export * from './auth';
export * from './enums';
export * from './errors';
export * from './pagination';
export * from './primitives';
