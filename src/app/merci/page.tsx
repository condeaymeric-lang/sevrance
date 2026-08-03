import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/lib/env";
import { createDownloadToken, downloadUrl, TTL_PAGE_SECONDS } from "@/lib/download-token";
import { CONTACT, PRODUCT } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Merci — ${PRODUCT.name}`,
  robots: { index: false, follow: false },
};

type Status =
  | { state: "ready"; url: string; email: string | null }
  | { state: "pending" }
  | { state: "error"; message: string };

async function resolveStatus(sessionId: string | undefined): Promise<Status> {
  if (!sessionId) {
    return {
      state: "error",
      message:
        "Cette page s'ouvre normalement juste après le paiement. Si vous avez déjà commandé, votre lien de téléchargement se trouve dans l'email de confirmation.",
    };
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") return { state: "pending" };

    return {
      state: "ready",
      url: downloadUrl(siteUrl(), createDownloadToken(session.id, TTL_PAGE_SECONDS)),
      email: session.customer_details?.email ?? null,
    };
  } catch (error) {
    console.error("[merci] session Stripe illisible", error);

    return {
      state: "error",
      message:
        "Nous n'arrivons pas à retrouver cette commande. Si le paiement a bien été débité, écrivez-nous : nous vous envoyons le PDF directement.",
    };
  }
}

export default async function MerciPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const status = await resolveStatus(searchParams.session_id);

  return (
    <main>
      <section className="border-b border-rule bg-paper">
        <div className="mx-auto w-full max-w-3xl px-6 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
          <Link href="/" className="font-serif text-xl tracking-tight">
            {PRODUCT.name}
          </Link>

          {status.state === "ready" ? (
            <>
              <p className="eyebrow mt-16">Paiement confirmé</p>
              <h1 className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight sm:text-6xl">
                Votre exemplaire est prêt.
              </h1>
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted">
                Téléchargez le PDF maintenant et enregistrez-le sur votre appareil.
                {status.email ? (
                  <>
                    {" "}
                    Le même lien part par email à <strong className="text-ink">{status.email}</strong>.
                  </>
                ) : (
                  " Le même lien vous est envoyé par email."
                )}
              </p>

              <div className="mt-10">
                <a href={status.url} className="btn-primary">
                  Télécharger {PRODUCT.name} ({PRODUCT.format}, {PRODUCT.pages} pages)
                </a>
                <p className="mt-4 text-sm text-muted">
                  Ce lien est personnel et expire dans {Math.round(TTL_PAGE_SECONDS / 3600)} heures.
                  Celui de l&apos;email reste valable une semaine.
                </p>
              </div>
            </>
          ) : null}

          {status.state === "pending" ? (
            <>
              <p className="eyebrow mt-16">Paiement en cours de validation</p>
              <h1 className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
                Encore quelques instants.
              </h1>
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted">
                Votre banque n&apos;a pas encore confirmé le paiement. Rafraîchissez cette page
                dans une minute : dès la confirmation, le lien de téléchargement apparaît ici et
                part par email.
              </p>
            </>
          ) : null}

          {status.state === "error" ? (
            <>
              <p className="eyebrow mt-16">Commande introuvable</p>
              <h1 className="mt-6 font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
                Nous allons régler ça.
              </h1>
              <p className="mt-6 max-w-prose text-lg leading-relaxed text-muted">{status.message}</p>
              <p className="mt-6">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="underline underline-offset-4 hover:text-bronze"
                >
                  {CONTACT.email}
                </a>
              </p>
            </>
          ) : null}
        </div>
      </section>

      {/* Bloc « pour aller plus loin » — structure en place, offre à venir.
          Volontairement sans bouton d'achat : rien à vendre aujourd'hui. */}
      <section className="border-b border-rule">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-20">
          <p className="eyebrow">Pour aller plus loin</p>
          <h2 className="mt-5 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">
            L&apos;accompagnement {PRODUCT.name}
          </h2>
          <p className="mt-5 max-w-prose leading-relaxed text-muted">
            Certains préfèrent dérouler le protocole seuls — c&apos;est pour cela que le livre
            existe. Nous préparons un accompagnement individuel pour ceux qui veulent un cadre
            et un interlocuteur pendant les six étapes. Il n&apos;est pas encore ouvert.
          </p>
          <p className="mt-5 max-w-prose leading-relaxed text-muted">
            Commencez par lire le livre. Si vous souhaitez être prévenu de l&apos;ouverture,
            écrivez-nous — aucune liste automatique, aucune relance.
          </p>
          <p className="mt-6">
            <a
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Accompagnement Sevrance")}`}
              className="underline underline-offset-4 hover:text-bronze"
            >
              Être prévenu de l&apos;ouverture
            </a>
          </p>
        </div>
      </section>

      <Footer narrow />
    </main>
  );
}
