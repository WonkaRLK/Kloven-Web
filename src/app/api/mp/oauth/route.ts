import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.MP_APP_ID;
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "http://localhost:3000").trim();
  const redirectUri = `${baseUrl}/api/mp/oauth/callback`;

  if (!appId) {
    return NextResponse.json(
      { error: "MP_APP_ID no configurado" },
      { status: 500 }
    );
  }

  const authUrl = new URL("https://auth.mercadopago.com.ar/authorization");
  authUrl.searchParams.set("client_id", appId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("platform_id", "mp");
  authUrl.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(authUrl.toString());
}
