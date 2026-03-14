import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken } from "@/lib/admin-auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { safeError } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`admin-auth:${ip}`, { maxTokens: 5, refillRate: 5 / 60 })) {
    return safeError(429, "Demasiados intentos. Intenta de nuevo en un minuto.");
  }

  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return safeError(500, "Error de configuracion del servidor");
  }

  if (password !== adminPassword) {
    return NextResponse.json(
      { error: "Password incorrecta" },
      { status: 401 }
    );
  }

  return NextResponse.json({ token: generateAdminToken() });
}
