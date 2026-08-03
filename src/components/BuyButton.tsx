"use client";

import { useState } from "react";
import { HERO } from "@/lib/content";

export default function BuyButton({
  source,
  label = HERO.cta,
}: {
  source: string;
  /** Libellé raccourci pour les emplacements étroits (carte prix). */
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Impossible d'ouvrir le paiement.");
      }

      window.location.assign(data.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'ouvrir le paiement. Réessayez dans un instant.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-primary"
        aria-busy={loading}
      >
        {loading ? "Ouverture du paiement…" : label}
      </button>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-bronze-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}
