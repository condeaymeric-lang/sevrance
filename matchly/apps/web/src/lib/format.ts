/**
 * Formatage des dates et des nombres.
 *
 * Toutes les fonctions figent explicitement la locale ET le fuseau horaire.
 * C'est indispensable en rendu serveur : sans fuseau imposé, le serveur formate
 * en UTC et le navigateur dans le fuseau de l'utilisateur, React détecte une
 * différence de balisage et l'hydratation échoue. Le symptôme — une heure qui
 * change au chargement — est déroutant à diagnostiquer.
 *
 * Europe/Paris est le fuseau de référence au lancement. L'internationalisation
 * viendra avec la préférence utilisateur, au Sprint 3.
 */

const LOCALE = 'fr-FR';
const TIME_ZONE = 'Europe/Paris';

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: TIME_ZONE,
});

const dayFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: TIME_ZONE,
});

/**
 * Heure d'un horodatage ISO, au format `14h30`.
 *
 * @param iso Horodatage ISO 8601.
 *
 * @example
 * formatTime('2026-08-04T13:00:00.000Z') // '15:00' (heure de Paris, été)
 */
export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/**
 * Jour d'un horodatage ISO, au format `mar. 4 août`.
 *
 * @param iso Horodatage ISO 8601.
 */
export function formatDay(iso: string): string {
  return dayFormatter.format(new Date(iso));
}

/**
 * Formate un grand nombre de façon compacte.
 *
 * Au-delà de quelques milliers, le chiffre exact n'apporte rien et déstabilise
 * la mise en page à chaque mise à jour temps réel.
 *
 * @example
 * formatCompact(1240)    // '1,2 k'
 * formatCompact(12400)   // '12 k'
 * formatCompact(1500000) // '1,5 M'
 */
export function formatCompact(value: number): string {
  if (value < 1_000) return String(value);

  if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(value < 10_000 ? 1 : 0)} k`.replace('.', ',');
  }

  return `${(value / 1_000_000).toFixed(1)} M`.replace('.', ',');
}
