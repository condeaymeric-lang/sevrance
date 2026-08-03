import Stripe from "stripe";
import { requireEnv } from "./env";

let client: Stripe | null = null;

/**
 * Instancié paresseusement : sans cela, un build sans STRIPE_SECRET_KEY
 * échouerait au moment de la collecte des routes.
 */
export function getStripe(): Stripe {
  if (!client) {
    client = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
    });
  }

  return client;
}
