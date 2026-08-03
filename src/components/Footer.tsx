import Link from "next/link";
import { CONTACT, LEGAL_DISCLAIMER, PRODUCT } from "@/lib/content";

const LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "Conditions générales de vente" },
  { href: "/remboursement", label: "Politique de remboursement" },
  { href: "/confidentialite", label: "Confidentialité" },
];

/**
 * `narrow` aligne le pied de page sur les gabarits étroits (/merci, pages
 * légales), qui utilisent max-w-3xl au lieu de max-w-5xl.
 */
export default function Footer({ narrow = false }: { narrow?: boolean }) {
  return (
    <footer
      className={`mx-auto w-full px-6 py-14 sm:px-8 ${narrow ? "max-w-3xl" : "max-w-5xl"}`}
    >
      {/* Mention obligatoire — ne pas retirer. */}
      <p className="max-w-prose font-serif text-lg leading-snug">{LEGAL_DISCLAIMER}</p>

      <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="underline underline-offset-4 hover:text-ink">
            {link.label}
          </Link>
        ))}
        <a
          href={`mailto:${CONTACT.email}`}
          className="underline underline-offset-4 hover:text-ink"
        >
          {CONTACT.email}
        </a>
      </nav>

      <p className="mt-8 text-sm text-muted">
        © {new Date().getFullYear()} {PRODUCT.name}. Tous droits réservés.
      </p>
    </footer>
  );
}
