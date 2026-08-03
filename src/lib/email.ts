import { Resend } from "resend";
import { optionalEnv, requireEnv } from "./env";
import { CONTACT, LEGAL_DISCLAIMER, PRODUCT } from "./content";

let client: Resend | null = null;

function getResend(): Resend {
  if (!client) client = new Resend(requireEnv("RESEND_API_KEY"));
  return client;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type DownloadEmail = {
  to: string;
  url: string;
  /** Nombre de jours de validité du lien, affiché dans le message. */
  validForDays: number;
};

/** Email sobre, sans image ni tracking : il doit arriver, pas impressionner. */
function renderHtml({ url, validForDays }: DownloadEmail): string {
  const safeUrl = escapeHtml(url);

  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;background:#FBFAF7;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#12110F;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E2DED4;">
      <tr>
        <td style="padding:40px;">
          <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#8A6A34;">${escapeHtml(PRODUCT.name)}</p>

          <h1 style="margin:24px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;font-weight:400;">
            Votre exemplaire est prêt.
          </h1>

          <p style="margin:20px 0 0;font-size:16px;line-height:1.6;color:#5C574E;">
            Merci pour votre commande. Le PDF de ${PRODUCT.pages} pages se télécharge ici :
          </p>

          <p style="margin:28px 0 0;">
            <a href="${safeUrl}" style="display:inline-block;background:#8A6A34;color:#FBFAF7;text-decoration:none;padding:14px 28px;font-size:16px;">
              Télécharger ${escapeHtml(PRODUCT.name)} (${PRODUCT.format})
            </a>
          </p>

          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#5C574E;">
            Ce lien reste valable ${validForDays} jours. Enregistrez le fichier sur votre
            appareil dès le téléchargement — vous n'aurez plus besoin du lien ensuite.
          </p>

          <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#5C574E;">
            Une question, un lien expiré, ou une demande de remboursement dans les
            ${PRODUCT.guaranteeDays} jours : répondez simplement à cet email.
          </p>

          <hr style="border:none;border-top:1px solid #E2DED4;margin:32px 0 0;" />

          <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#5C574E;">
            ${escapeHtml(LEGAL_DISCLAIMER)}
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText({ url, validForDays }: DownloadEmail): string {
  return [
    `${PRODUCT.name} — votre exemplaire est prêt.`,
    "",
    `Merci pour votre commande. Téléchargez le PDF de ${PRODUCT.pages} pages ici :`,
    url,
    "",
    `Ce lien reste valable ${validForDays} jours. Enregistrez le fichier sur votre appareil dès le téléchargement.`,
    "",
    `Une question, un lien expiré, ou une demande de remboursement dans les ${PRODUCT.guaranteeDays} jours : répondez à cet email.`,
    "",
    LEGAL_DISCLAIMER,
  ].join("\n");
}

export async function sendDownloadEmail(params: DownloadEmail): Promise<void> {
  const from = optionalEnv("RESEND_FROM_EMAIL") ?? `${PRODUCT.name} <${CONTACT.email}>`;

  const { error } = await getResend().emails.send({
    from,
    to: params.to,
    replyTo: CONTACT.email,
    subject: `Votre exemplaire de ${PRODUCT.name}`,
    html: renderHtml(params),
    text: renderText(params),
  });

  if (error) {
    throw new Error(`Resend a refusé l'envoi : ${error.message}`);
  }
}
