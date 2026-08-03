import { MECHANISM } from "@/lib/content";

export default function Mechanism() {
  return (
    <section className="border-b border-rule bg-paper">
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">{MECHANISM.eyebrow}</p>
        <h2 className="mt-5 max-w-2xl font-serif text-3xl leading-tight tracking-tight sm:text-5xl">
          {MECHANISM.title}
        </h2>
        <p className="mt-6 max-w-prose leading-relaxed text-muted">{MECHANISM.intro}</p>

        <ol className="mt-12 sm:mt-16">
          {MECHANISM.steps.map((step, index) => (
            <li
              key={step.name}
              className="rule-top grid gap-x-6 gap-y-2 py-6 sm:grid-cols-[4rem_14rem_1fr] sm:py-7"
            >
              <span className="font-serif text-lg text-bronze sm:text-xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-2xl leading-none tracking-tight sm:text-[1.75rem]">
                {step.name}
              </h3>
              <p className="text-[0.975rem] leading-relaxed text-muted">{step.benefit}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
