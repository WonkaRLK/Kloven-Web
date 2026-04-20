import { createHmac } from "crypto";

export function verifyMPWebhook(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;

  // If the secret is not configured, we can't verify. We log loudly so the
  // admin sees in Vercel logs that webhooks are running unverified, but we
  // still accept the payload — otherwise the whole payment flow breaks.
  // As soon as MP_WEBHOOK_SECRET is set (env var + MP panel), verification
  // becomes strict automatically.
  if (!secret) {
    console.warn(
      "[MP WEBHOOK] WARNING: MP_WEBHOOK_SECRET not configured — accepting webhook WITHOUT signature verification. Set the env var and configure the secret in Mercado Pago panel ASAP."
    );
    return true;
  }

  if (!xSignature || !xRequestId) return false;

  const parts = xSignature.split(",");
  let ts = "";
  let hash = "";

  for (const part of parts) {
    const [key, value] = part.trim().split("=");
    if (key === "ts") ts = value;
    if (key === "v1") hash = value;
  }

  if (!ts || !hash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  return expected === hash;
}
