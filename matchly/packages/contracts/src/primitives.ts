import { z } from 'zod';

/**
 * Primitives partagées entre le web et l'API.
 *
 * Ces schémas sont la seule définition autorisée de ce qu'est un identifiant,
 * un slug ou un email chez Matchly. Toute validation ailleurs dans le code doit
 * les réutiliser plutôt que de redéfinir sa propre expression régulière : c'est
 * ce qui garantit que le frontend refuse exactement ce que le backend refuse.
 */

/** Identifiant technique de toute entité persistée (UUID v4). */
export const idSchema = z.uuid();
export type Id = z.infer<typeof idSchema>;

/**
 * Slug lisible utilisé dans les URLs publiques (`/clubs/fc-saint-denis`).
 *
 * Contraint à l'ASCII minuscule : les URLs Matchly doivent rester stables,
 * partageables et indexables quel que soit l'alphabet du nom d'origine.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const slugSchema = z
  .string()
  .min(2, 'Un slug fait au moins 2 caractères.')
  .max(80, 'Un slug fait au plus 80 caractères.')
  .regex(SLUG_PATTERN, 'Un slug ne contient que des minuscules, des chiffres et des tirets.');
export type Slug = z.infer<typeof slugSchema>;

/** Adresse email, normalisée en minuscules pour rendre l'unicité fiable. */
export const emailSchema = z
  .email('Adresse email invalide.')
  .max(254, 'Adresse email trop longue.')
  .transform((value) => value.toLowerCase());
export type Email = z.infer<typeof emailSchema>;

/** URL absolue (http/https uniquement). */
export const urlSchema = z.url('URL invalide.');
export type Url = z.infer<typeof urlSchema>;

/** Horodatage ISO 8601 avec fuseau. Matchly stocke et transporte tout en UTC. */
export const isoDateTimeSchema = z.iso.datetime({ offset: true });
export type IsoDateTime = z.infer<typeof isoDateTimeSchema>;

/** Code pays ISO 3166-1 alpha-2, en majuscules. */
export const countryCodeSchema = z
  .string()
  .length(2, 'Un code pays fait exactement 2 lettres.')
  .regex(/^[A-Za-z]{2}$/, 'Code pays invalide.')
  .transform((value) => value.toUpperCase());
export type CountryCode = z.infer<typeof countryCodeSchema>;

/** Nom affiché d'une personne, d'un club ou d'une équipe. */
export const displayNameSchema = z
  .string()
  .trim()
  .min(2, 'Ce nom fait au moins 2 caractères.')
  .max(80, 'Ce nom fait au plus 80 caractères.');
export type DisplayName = z.infer<typeof displayNameSchema>;

/**
 * Convertit un texte libre en slug conforme à {@link slugSchema}.
 *
 * La normalisation NFD suivie du retrait des marques diacritiques transforme
 * « Béziers » en « beziers » plutôt qu'en « b-ziers » : les clubs français,
 * espagnols ou portugais obtiennent une URL lisible sans intervention manuelle.
 *
 * @param input Texte d'origine, par exemple le nom saisi d'un club.
 * @returns Un slug, ou une chaîne vide si l'entrée ne contient aucun caractère
 *          exploitable — l'appelant décide alors du repli (identifiant, refus).
 *
 * @example
 * slugify('FC Saint-Denis  Olympique !') // 'fc-saint-denis-olympique'
 * slugify('Béziers Rugby')               // 'beziers-rugby'
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}
