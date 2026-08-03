import Link from "next/link";
import BuyButton from "./BuyButton";
import { HERO, PRODUCT } from "@/lib/content";

export default function Hero() {
  return (
    <header className="border-b border-rule bg-paper">
      <div className="mx-auto w-full max-w-5xl px-6 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
        <span className="font-serif text-xl tracking-tight sm:text-2xl">{PRODUCT.name}</span>

        <div className="mt-10 max-w-3xl sm:mt-20">
          <p className="eyebrow">{HERO.eyebrow}</p>

          <h1 className="mt-6 font-serif text-[2.5rem] leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            {HERO.title}
          </h1>

          <p className="mt-7 max-w-prose text-lg leading-relaxed text-muted sm:text-xl">
            {HERO.subtitle}
          </p>

          <div className="mt-10">
            <BuyButton source="hero" />
            <p className="mt-4 text-sm text-muted">{HERO.reassurance}</p>
            <p className="mt-2 text-sm text-muted">
              <Link href="/remboursement" className="underline underline-offset-4 hover:text-ink">
                Politique de remboursement
              </Link>{" "}
              consultable avant l&apos;achat.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
