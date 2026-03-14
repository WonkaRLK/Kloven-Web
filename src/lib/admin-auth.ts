import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export function generateAdminToken(): string {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("ADMIN_PASSWORD no configurado");

  const timestamp = Date.now().toString();
  const signature = createHmac("sha256", adminPassword)
    .update(timestamp)
    .digest("hex");

  return `${timestamp}.${signature}`;
}

export function validateAdminAuth(request: NextRequest): NextResponse | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = auth.replace("Bearer ", "");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const timestamp = token.substring(0, dotIndex);
  const signature = token.substring(dotIndex + 1);

  // Check expiration
  const tokenAge = Date.now() - parseInt(timestamp, 10);
  if (isNaN(tokenAge) || tokenAge > TOKEN_EXPIRY_MS || tokenAge < 0) {
    return NextResponse.json({ error: "Token expirado" }, { status: 401 });
  }

  // Verify signature
  const expectedSignature = createHmac("sha256", adminPassword)
    .update(timestamp)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return null;
}
