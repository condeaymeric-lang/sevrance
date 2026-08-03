import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { createDownloadToken, downloadUrl, verifyDownloadToken } from "./download-token";

// Le secret est lu à l'appel, jamais au chargement du module : le définir
// ici, après les imports, suffit.
process.env.DOWNLOAD_TOKEN_SECRET = "secret-de-test-suffisamment-long-pour-hmac";

const SESSION = "cs_test_a1B2c3D4e5";

describe("jeton de téléchargement", () => {
  it("accepte un jeton valide et restitue la session", () => {
    const result = verifyDownloadToken(createDownloadToken(SESSION, 3600));

    assert.equal(result.ok, true);
    assert.equal(result.ok && result.sessionId, SESSION);
  });

  it("rejette un jeton expiré", () => {
    // TTL négatif : la date d'expiration est déjà passée.
    const result = verifyDownloadToken(createDownloadToken(SESSION, -1));

    assert.deepEqual(result, { ok: false, reason: "expired" });
  });

  it("rejette une signature falsifiée", () => {
    const token = createDownloadToken(SESSION, 3600);
    const [payload, expiry] = token.split(".");
    const forged = `${payload}.${expiry}.${"a".repeat(43)}`;

    assert.deepEqual(verifyDownloadToken(forged), { ok: false, reason: "invalid" });
  });

  it("rejette une date d'expiration repoussée à la main", () => {
    const token = createDownloadToken(SESSION, -1);
    const [payload, , signature] = token.split(".");
    const extended = `${payload}.${Math.floor(Date.now() / 1000) + 9999}.${signature}`;

    assert.deepEqual(verifyDownloadToken(extended), { ok: false, reason: "invalid" });
  });

  it("rejette une session substituée", () => {
    const mine = createDownloadToken(SESSION, 3600);
    const other = createDownloadToken("cs_test_autre_client", 3600);
    const [, expiry, signature] = mine.split(".");
    const [otherPayload] = other.split(".");

    assert.deepEqual(verifyDownloadToken(`${otherPayload}.${expiry}.${signature}`), {
      ok: false,
      reason: "invalid",
    });
  });

  it("rejette un jeton mal formé", () => {
    for (const bad of ["", "abc", "a.b", "a.b.c.d"]) {
      const result = verifyDownloadToken(bad);
      assert.equal(result.ok, false, `« ${bad} » aurait dû être rejeté`);
    }
  });

  it("rejette un jeton signé avec un autre secret", async () => {
    const token = createDownloadToken(SESSION, 3600);

    process.env.DOWNLOAD_TOKEN_SECRET = "un-tout-autre-secret-de-signature";
    // Le secret est lu à chaque appel, pas mis en cache au chargement.
    const result = verifyDownloadToken(token);
    process.env.DOWNLOAD_TOKEN_SECRET = "secret-de-test-suffisamment-long-pour-hmac";

    assert.deepEqual(result, { ok: false, reason: "invalid" });
  });

  it("encode le jeton dans l'URL de téléchargement", () => {
    const token = createDownloadToken(SESSION, 3600);
    const url = downloadUrl("https://sevrance.fr", token);

    assert.equal(url, `https://sevrance.fr/api/download?token=${encodeURIComponent(token)}`);
  });
});

describe("secret absent", () => {
  let saved: string | undefined;

  before(() => {
    saved = process.env.DOWNLOAD_TOKEN_SECRET;
    delete process.env.DOWNLOAD_TOKEN_SECRET;
  });

  after(() => {
    process.env.DOWNLOAD_TOKEN_SECRET = saved;
  });

  it("échoue bruyamment plutôt que de signer avec une valeur vide", () => {
    assert.throws(() => createDownloadToken(SESSION, 3600), /DOWNLOAD_TOKEN_SECRET/);
  });
});
