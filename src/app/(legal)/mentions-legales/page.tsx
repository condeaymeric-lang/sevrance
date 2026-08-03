import type { Metadata } from "next";
import { CONTACT, PRODUCT } from "@/lib/content";

export const metadata: Metadata = {
  title: `Mentions légales — ${PRODUCT.name}`,
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        Mentions légales
      </h1>

      <h2>Éditeur du site</h2>
      <ul>
        <li>Dénomination sociale : [à compléter]</li>
        <li>Forme juridique et capital social : [à compléter]</li>
        <li>Siège social : [adresse à compléter]</li>
        <li>Numéro SIREN / SIRET : [à compléter]</li>
        <li>Numéro de TVA intracommunautaire : [à compléter]</li>
        <li>Directeur de la publication : [à compléter]</li>
        <li>
          Contact : <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </li>
      </ul>

      <h2>Hébergement</h2>
      <ul>
        <li>Hébergeur : [nom à compléter]</li>
        <li>Adresse : [adresse à compléter]</li>
      </ul>

      <h2>Paiement</h2>
      <p>
        Les paiements sont traités par Stripe Payments Europe, Ltd. Aucune donnée de carte
        bancaire ne transite par ce site ni n&apos;y est stockée.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        L&apos;ebook {PRODUCT.name}, les textes et l&apos;identité visuelle de ce site sont
        protégés par le droit d&apos;auteur. L&apos;achat donne un droit d&apos;usage personnel :
        toute rediffusion, revente ou mise à disposition publique du fichier est interdite.
      </p>

      <h2>Avertissement</h2>
      <p>
        {PRODUCT.name} est un outil d&apos;accompagnement personnel et ne remplace pas un avis
        médical. En cas de dépendance sévère, de traitement en cours ou de pathologie associée,
        parlez-en à votre médecin.
      </p>
    </>
  );
}
