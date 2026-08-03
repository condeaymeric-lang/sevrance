import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { optionalEnv, siteUrl } from "@/lib/env";
import { PRICE_EUR, PRODUCT } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Crée une session Stripe Checkout en paiement unique.
 * Le montant est fixé côté serveur : le client n'envoie que la provenance
 * du clic, jamais un prix.
 */
export async function POST(request: Request) {
  let source = "inconnu";

  try {
    const body = (await request.json().catch(() => ({}))) as { source?: unknown };
    if (typeof body.source === "string") source = body.source.slice(0, 40);
  } catch {
    // Corps absent ou illisible : la provenance n'est qu'indicative.
  }

  try {
    const stripe = getStripe();
    const base = siteUrl();
    const priceId = optionalEnv("STRIPE_PRICE_ID");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      // Un Price Stripe est préférable en production (TVA, comptabilité).
      // À défaut, le prix est défini ici pour rester démarrable sans setup.
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: Math.round(PRICE_EUR * 100),
                product_data: {
                  name: `${PRODUCT.name} — ebook ${PRODUCT.pages} pages`,
                  description: PRODUCT.tagline,
                },
              },
            },
      ],
      success_url: `${base}/merci?session_id={CHECKOUT_SESSION_ID}`,
      // Retour direct au bloc offre plutôt qu'en haut de page : l'acheteur
      // qui abandonne le paiement n'a pas à re-scroller toute la page.
      cancel_url: `${base}/?paiement=annule#offre`,
      // Indispensable : c'est cette adresse qui reçoit le lien de téléchargement.
      customer_creation: "always",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: { product: PRODUCT.name, source },
    });

    if (!session.url) {
      throw new Error("Stripe n'a pas renvoyé d'URL de paiement.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout] échec de création de session", error);

    return NextResponse.json(
      { error: "Le paiement est momentanément indisponible. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
