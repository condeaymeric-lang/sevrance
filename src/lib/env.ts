/**
 * Accès centralisé aux variables d'environnement.
 * Rien n'est lu au moment du build : les routes appellent ces helpers à la
 * requête, ce qui permet de builder l'application sans clés configurées.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Voir .env.example.`,
    );
  }

  return value;
}

export function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

/**
 * URL publique du site, utilisée pour les redirections Stripe et les liens
 * contenus dans l'email. Vercel expose VERCEL_URL sans protocole.
 */
export function siteUrl(): string {
  const explicit = optionalEnv("NEXT_PUBLIC_SITE_URL");
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = optionalEnv("VERCEL_URL");
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
