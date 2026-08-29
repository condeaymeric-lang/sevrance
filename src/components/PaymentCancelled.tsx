"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Message de retour après un paiement abandonné (cancel_url renvoie sur
 * /?paiement=annule#offre). Le paramètre est lu côté client, dans une
 * frontière Suspense : la page « / » reste ainsi prérendue statiquement.
 */
function Notice() {
  if (useSearchParams().get("paiement") !== "annule") return null;

  return (
    <p
      role="status"
      className="mb-10 border-l-2 border-bronze bg-paper py-3 pl-5 text-[0.975rem] leading-relaxed"
    >
      <span className="font-medium">Paiement interrompu — rien n&apos;a été débité.</span>{" "}
      <span className="text-muted">
        Votre commande vous attend ci-dessous si vous souhaitez reprendre.
      </span>
    </p>
  );
}

export default function PaymentCancelled() {
  return (
    <Suspense fallback={null}>
      <Notice />
    </Suspense>
  );
}
