import Link from "next/link";
import BuyButton from "./BuyButton";
import PaymentCancelled from "./PaymentCancelled";
import { FINAL_CTA, HERO, OFFER, PRODUCT } from "@/lib/content";

export default function Offer() {
  return (
    <section id="offre" className="scroll-mt-8 border-b border-rule">
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
        <PaymentCancelled />

        <p className="eyebrow">{OFFER.eyebrow}</p>
        <h2 className="mt-5 max-w-2xl font-serif text-3xl leading-tight tracking-tight sm:text-5xl">
          {OFFER.title}
        </h2>

        <div className="mt-12 grid gap-12 sm:mt-16 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div>
            <ul className="space-y-4">
              {OFFER.includes.map((item) => (
                <li key={item} className="flex gap-4 text-[0.975rem] leading-relaxed">
                  <span aria-hidden className="mt-[0.55rem] h-px w-5 shrink-0 bg-bronze" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 border-l-2 border-bronze pl-5">
              <h3 className="font-serif text-2xl tracking-tight">{OFFER.guarantee.title}</h3>
              <p className="mt-2 max-w-prose text-[0.975rem] leading-relaxed text-muted">
                {OFFER.guarantee.body}{" "}
                <Link
                  href="/remboursement"
                  className="underline underline-offset-4 hover:text-ink"
                >
                  Lire la politique complète
                </Link>
                .
              </p>
            </div>
          </div>

          <aside className="border border-rule bg-paper p-8 lg:w-80">
            <p className="eyebrow">{PRODUCT.name} · {PRODUCT.format}</p>
            <p className="mt-4 font-serif text-5xl tracking-tight">{OFFER.price.amount}</p>
            <p className="mt-2 text-sm text-muted">{OFFER.price.note}</p>

            <div className="mt-8">
              {/* Libellé court : la carte est étroite, le prix est juste au-dessus. */}
              <BuyButton source="offer" label={`Commander — ${OFFER.price.amount}`} />
            </div>
            <p className="mt-4 text-sm text-muted">{HERO.reassurance}</p>
          </aside>
        </div>

        <div className="mt-16 max-w-2xl sm:mt-20">
          <h3 className="font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            {FINAL_CTA.title}
          </h3>
          <p className="mt-4 text-lg text-muted">{FINAL_CTA.body}</p>
        </div>
      </div>
    </section>
  );
}
