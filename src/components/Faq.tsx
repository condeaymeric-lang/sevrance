import { FAQ } from "@/lib/content";

export default function Faq() {
  return (
    <section className="border-b border-rule bg-paper">
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">{FAQ.eyebrow}</p>
        <h2 className="mt-5 font-serif text-3xl leading-tight tracking-tight sm:text-5xl">
          {FAQ.title}
        </h2>

        <dl className="mt-12 sm:mt-16">
          {FAQ.items.map((item) => (
            <div
              key={item.q}
              className="rule-top grid gap-x-10 gap-y-3 py-7 lg:grid-cols-[22rem_1fr]"
            >
              <dt className="font-serif text-xl leading-snug tracking-tight sm:text-2xl">
                {item.q}
              </dt>
              <dd className="max-w-prose text-[0.975rem] leading-relaxed text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
