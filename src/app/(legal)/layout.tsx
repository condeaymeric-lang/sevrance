import Link from "next/link";
import Footer from "@/components/Footer";
import { PRODUCT } from "@/lib/content";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <section className="border-b border-rule bg-paper">
        <div className="mx-auto w-full max-w-3xl px-6 pb-20 pt-14 sm:px-8 sm:pt-16">
          <Link href="/" className="font-serif text-xl tracking-tight">
            {PRODUCT.name}
          </Link>

          {/* À supprimer une fois les textes validés par un juriste. */}
          <p className="mt-12 border border-rule bg-ivory p-4 text-sm leading-relaxed text-muted">
            <strong className="font-medium text-ink">Modèle à faire valider.</strong> Ce texte est
            une trame de départ. Il doit être complété et vérifié par un professionnel du droit
            avant toute mise en ligne réelle.
          </p>

          <div className="legal-prose mt-10">{children}</div>
        </div>
      </section>

      <Footer narrow />
    </main>
  );
}
