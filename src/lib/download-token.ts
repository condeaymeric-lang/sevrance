import { createHmac, timingSafeEqual } from "node:crypto";
import { requireEnv } from "./env";

/**
 * Jeton de téléchargement signé, à expiration.
 *
 * Objectif : limiter le partage du PDF sans imposer de compte utilisateur.
 * Le jeton est autoportant (aucun stockage côté serveur) — il contient
 * l'identifiant de la session Stripe et une date d'expiration, le tout
 * couvert par un HMAC-SHA256.
 */

/** Lien affiché sur /merci : court, l'acheteur est devant son écran. */
export const TTL_PAGE_SECONDS = 60 * 60 * 2; // 2 heures

/** Lien envoyé par email : plus long, l'acheteur peut lire plus tard. */
export const TTL_EMAIL_SECONDS = 60 * 60 * 24 * 7; // 7 jours

function secret(): Buffer {
  return Buffer.from(requireEnv("DOWNLOAD_TOKEN_SECRET"), "utf8");
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createDownloadToken(sessionId: string, ttlSeconds: number): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${b64url(sessionId)}.${expiresAt}`;

  return `${payload}.${sign(payload)}`;
}

export type TokenResult =
  | { ok: true; sessionId: string }
  | { ok: false; reason: "malformed" | "invalid" | "expired" };

export function verifyDownloadToken(token: string): TokenResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };

  const [encodedSessionId, rawExpiry, signature] = parts;
  const payload = `${encodedSessionId}.${rawExpiry}`;

  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);

  // Comparaison à temps constant. timingSafeEqual exige des longueurs
  // égales, d'où le test préalable.
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: "invalid" };
  }

  const expiresAt = Number.parseInt(rawExpiry, 10);
  if (!Number.isFinite(expiresAt)) return { ok: false, reason: "malformed" };
  if (expiresAt < Math.floor(Date.now() / 1000)) return { ok: false, reason: "expired" };

  const sessionId = Buffer.from(encodedSessionId, "base64url").toString("utf8");
  if (!sessionId) return { ok: false, reason: "malformed" };

  return { ok: true, sessionId };
}

export function downloadUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/api/download?token=${encodeURIComponent(token)}`;
}
