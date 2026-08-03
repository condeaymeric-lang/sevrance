import type { Metadata } from "next";
import { CONTACT, PRODUCT } from "@/lib/content";

export const metadata: Metadata = {
  title: `Politique de confidentialité — ${PRODUCT.name}`,
  robots: { index: false, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <>
      <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        Politique de confidentialité
      </h1>

      <h2>Données collectées</h2>
      <p>
        Ce site ne crée pas de compte utilisateur. Les seules données traitées lors d&apos;un achat
        sont votre adresse email et les informations de facturation transmises à Stripe.
      </p>

      <h2>Finalités</h2>
      <ul>
        <li>Traiter le paiement et établir la facture (Stripe).</li>
        <li>Vous envoyer le lien de téléchargement de votre exemplaire (Resend).</li>
        <li>Répondre à vos demandes et traiter les remboursements éventuels.</li>
      </ul>
      <p>
        Aucune donnée n&apos;est revendue. Aucune inscription à une liste de diffusion n&apos;est
        effectuée sans votre demande explicite.
      </p>

      <h2>Sous-traitants</h2>
      <ul>
        <li>Stripe Payments Europe, Ltd. — traitement des paiements.</li>
        <li>Resend — acheminement des emails transactionnels.</li>
        <li>[Hébergeur à compléter] — hébergement du site.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Ce site ne dépose aucun cookie de mesure d&apos;audience ni de publicité. Stripe peut
        déposer des cookies techniques sur ses propres pages de paiement, nécessaires à la
        sécurité de la transaction.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Les données de facturation sont conservées pendant la durée légale applicable en matière
        comptable. Les emails de support sont conservés le temps nécessaire au traitement de la
        demande.
      </p>

      <h2>Vos droits</h2>
      <p>
        Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement,
        d&apos;opposition et de portabilité. Pour l&apos;exercer, écrivez à{" "}
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. Vous pouvez également introduire
        une réclamation auprès de la CNIL.
      </p>
    </>
  );
}
