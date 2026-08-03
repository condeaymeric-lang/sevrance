import type { Metadata } from "next";
import { CONTACT, PRICE_LABEL, PRODUCT } from "@/lib/content";

export const metadata: Metadata = {
  title: `Politique de remboursement — ${PRODUCT.name}`,
  description: `Conditions de remboursement de l'ebook ${PRODUCT.name}, garantie ${PRODUCT.guaranteeDays} jours.`,
};

export default function RemboursementPage() {
  return (
    <>
      <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        Politique de remboursement
      </h1>

      <h2>Garantie {PRODUCT.guaranteeDays} jours</h2>
      <p>
        Si {PRODUCT.name} ne vous apporte rien, vous êtes remboursé intégralement — soit{" "}
        {PRICE_LABEL} — sur simple demande envoyée dans les {PRODUCT.guaranteeDays} jours suivant
        l&apos;achat. Aucune justification n&apos;est demandée.
      </p>

      <h2>Comment demander le remboursement</h2>
      <p>
        Écrivez à <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> depuis l&apos;adresse
        utilisée lors de l&apos;achat, ou répondez simplement à votre email de confirmation.
        Précisez la date d&apos;achat si vous l&apos;avez sous la main : cela accélère le
        traitement.
      </p>

      <h2>Délai de traitement</h2>
      <p>
        Le remboursement est déclenché sous 5 jours ouvrés après réception de votre demande. Le
        crédit apparaît ensuite sur votre relevé selon les délais de votre banque, généralement
        sous 5 à 10 jours ouvrés. Le remboursement est effectué sur le moyen de paiement utilisé
        lors de l&apos;achat.
      </p>

      <h2>Après le remboursement</h2>
      <p>
        Le lien de téléchargement est désactivé. Nous vous demandons de supprimer les copies du
        fichier en votre possession.
      </p>

      <h2>Droit de rétractation sur les contenus numériques</h2>
      <p>
        S&apos;agissant d&apos;un contenu numérique fourni immédiatement, le droit de rétractation
        légal de 14 jours ne s&apos;applique pas dès lors que vous avez expressément consenti à
        l&apos;exécution immédiate et renoncé à ce droit au moment de la commande (article L221-28
        du Code de la consommation).{" "}
        <strong>
          La garantie commerciale décrite ci-dessus vous est accordée volontairement, en plus de
          vos droits légaux.
        </strong>
      </p>
    </>
  );
}
