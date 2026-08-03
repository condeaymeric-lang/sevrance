import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { verifyDownloadToken } from "@/lib/download-token";
import { optionalEnv } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { PRODUCT } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILENAME = "Sevrance.pdf";

function refuse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Délivre le PDF contre un jeton signé non expiré.
 *
 * Deux vérifications successives : la signature du jeton, puis l'état réel
 * du paiement côté Stripe. La seconde protège même si le secret de
 * signature venait à fuiter.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");

  if (!token) {
    return refuse("Lien de téléchargement incomplet.", 400);
  }

  const verified = verifyDownloadToken(token);

  if (!verified.ok) {
    return verified.reason === "expired"
      ? refuse(
          "Ce lien de téléchargement a expiré. Répondez à votre email de confirmation pour en recevoir un nouveau.",
          410,
        )
      : refuse("Lien de téléchargement invalide.", 403);
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(verified.sessionId);

    if (session.payment_status !== "paid") {
      return refuse("Aucun paiement confirmé pour ce lien.", 403);
    }
  } catch (error) {
    console.error("[download] vérification Stripe impossible", error);
    return refuse("Vérification du paiement impossible pour le moment.", 502);
  }

  const headers = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${FILENAME}"`,
    // Un lien signé ne doit jamais être mis en cache par un intermédiaire.
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  };

  // Option 1 — le PDF est hébergé ailleurs (S3, R2, Bunny…). On le relaie
  // sans jamais exposer son URL réelle au navigateur.
  const remote = optionalEnv("PDF_SOURCE_URL");

  if (remote) {
    const upstream = await fetch(remote, { cache: "no-store" });

    if (!upstream.ok || !upstream.body) {
      console.error("[download] source distante indisponible", upstream.status);
      return refuse("Le fichier est momentanément indisponible.", 502);
    }

    return new Response(upstream.body, { headers });
  }

  // Option 2 — le PDF est sur le disque du serveur, hors du dossier public.
  const filePath = path.join(process.cwd(), optionalEnv("PDF_FILE_PATH") ?? "private/sevrance.pdf");

  try {
    const file = await readFile(filePath);
    return new Response(new Uint8Array(file), { headers });
  } catch (error) {
    console.error(`[download] fichier introuvable : ${filePath}`, error);
    return refuse(
      `Le fichier ${PRODUCT.name} est momentanément indisponible. Écrivez-nous, nous vous l'envoyons directement.`,
      500,
    );
  }
}
