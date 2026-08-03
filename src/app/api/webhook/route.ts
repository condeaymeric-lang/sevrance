import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { requireEnv, siteUrl } from "@/lib/env";
import { createDownloadToken, downloadUrl, TTL_EMAIL_SECONDS } from "@/lib/download-token";
import { sendDownloadEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Garde-fou d'idempotence, valable pour la durée de vie de l'instance.
 * Stripe rejoue un événement tant qu'il n'a pas reçu de 2xx ; sans base de
 * données, ceci suffit à absorber les rejeux rapprochés. Pour une garantie
 * stricte, persister les identifiants d'événements traités.
 */
const handledEvents = new Set<string>();
const HANDLED_EVENTS_MAX = 500;

function remember(eventId: string) {
  if (handledEvents.size >= HANDLED_EVENTS_MAX) handledEvents.clear();
  handledEvents.add(eventId);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature Stripe absente." }, { status: 400 });
  }

  // Le corps brut est indispensable : toute réécriture invalide la signature.
  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      requireEnv("STRIPE_WEBHOOK_SECRET"),
    );
  } catch (error) {
    console.error("[webhook] signature invalide", error);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  if (handledEvents.has(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, skipped: "paiement non confirmé" });
  }

  const email = session.customer_details?.email ?? session.customer_email;

  if (!email) {
    // Rien à faire de plus : l'acheteur a malgré tout son lien sur /merci.
    console.error(`[webhook] session ${session.id} sans adresse email`);
    return NextResponse.json({ received: true, skipped: "email absent" });
  }

  try {
    const token = createDownloadToken(session.id, TTL_EMAIL_SECONDS);

    await sendDownloadEmail({
      to: email,
      url: downloadUrl(siteUrl(), token),
      validForDays: Math.round(TTL_EMAIL_SECONDS / 86_400),
    });

    remember(event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`[webhook] envoi de l'email échoué pour ${session.id}`, error);

    // 500 volontaire : Stripe rejouera l'événement, l'acheteur finira par
    // recevoir son email sans intervention manuelle.
    return NextResponse.json({ error: "Envoi de l'email impossible." }, { status: 500 });
  }
}
