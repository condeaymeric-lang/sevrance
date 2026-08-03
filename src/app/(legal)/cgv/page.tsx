import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT, PRICE_LABEL, PRODUCT } from "@/lib/content";

export const metadata: Metadata = {
  title: `Conditions générales de vente — ${PRODUCT.name}`,
  robots: { index: false, follow: true },
};

export default function CgvPage() {
  return (
    <>
      <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
        Conditions générales de vente
      </h1>

      <h2>1. Objet</h2>
      <p>
        Les présentes conditions régissent la vente de l&apos;ebook {PRODUCT.name}, contenu
        numérique de {PRODUCT.pages} pages au format {PRODUCT.format}, par [dénomination sociale à
        compléter] à toute personne effectuant un achat sur ce site.
      </p>

      <h2>2. Produit et prix</h2>
      <p>
        Le produit vendu est un fichier numérique téléchargeable. Aucun exemplaire papier
        n&apos;est expédié. Le prix est de {PRICE_LABEL} toutes taxes comprises, en paiement
        unique. Il ne s&apos;agit pas d&apos;un abonnement : aucun prélèvement récurrent
        n&apos;est mis en place.
      </p>

      <h2>3. Commande et paiement</h2>
      <p>
        La commande est validée par le paiement, effectué via Stripe. La vente est réputée conclue
        à la confirmation du paiement par le prestataire.
      </p>

      <h2>4. Livraison</h2>
      <p>
        La livraison est immédiate : un lien de téléchargement personnel s&apos;affiche après le
        paiement et est envoyé à l&apos;adresse email renseignée lors de la commande. Ce lien a
        une durée de validité limitée. En cas de non-réception ou de lien expiré, écrivez à{" "}
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> : un nouveau lien vous est envoyé
        sans frais.
      </p>

      <h2>5. Droit de rétractation</h2>
      <p>
        Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation
        ne s&apos;applique pas aux contenus numériques fournis immédiatement lorsque
        l&apos;acheteur a donné son accord exprès et renoncé à ce droit. Indépendamment de ce
        point, une garantie commerciale de {PRODUCT.guaranteeDays} jours est accordée : voir la{" "}
        <Link href="/remboursement">politique de remboursement</Link>.
      </p>

      <h2>6. Licence d&apos;utilisation</h2>
      <p>
        L&apos;achat confère un droit d&apos;usage personnel et non exclusif. La revente, le
        partage, la diffusion publique ou la reproduction du fichier, en tout ou partie, sont
        interdits.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        {PRODUCT.name} est un outil d&apos;accompagnement personnel et ne remplace pas un avis
        médical. Aucun résultat n&apos;est garanti : l&apos;arrêt du tabac dépend de facteurs
        individuels. L&apos;éditeur ne saurait être tenu responsable des conséquences de
        l&apos;usage fait du contenu.
      </p>

      <h2>8. Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la{" "}
        <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>9. Réclamations et litiges</h2>
      <p>
        Toute réclamation est à adresser à <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
        À défaut d&apos;accord amiable, le consommateur peut recourir gratuitement à un médiateur
        de la consommation, ou saisir la plateforme européenne de règlement en ligne des litiges.
        Les présentes conditions sont soumises au droit français.
      </p>

      <p>Dernière mise à jour : [date à compléter].</p>
    </>
  );
}
