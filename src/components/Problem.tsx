import { PROBLEM } from "@/lib/content";

export default function Problem() {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
        <p className="eyebrow">{PROBLEM.eyebrow}</p>
        <h2 className="mt-5 max-w-2xl font-serif text-3xl leading-tight tracking-tight sm:text-5xl">
          {PROBLEM.title}
        </h2>

        <div className="mt-12 grid gap-10 sm:mt-16 sm:grid-cols-3 sm:gap-8">
          {PROBLEM.columns.map((column, index) => (
            <div key={column.title} className="rule-top pt-6">
              <span className="font-serif text-lg text-bronze">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-medium leading-snug">{column.title}</h3>
              <p className="mt-3 text-[0.975rem] leading-relaxed text-muted">{column.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
