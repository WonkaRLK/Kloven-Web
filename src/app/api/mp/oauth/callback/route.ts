import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const baseUrl = (process.env.NEXT_PUBLIC_URL || "http://localhost:3000").trim();
  const redirectUri = `${baseUrl}/api/mp/oauth/callback`;

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/admin/mp-connect?error=no_code`
    );
  }

  const appId = process.env.MP_APP_ID;
  const clientSecret = process.env.MP_CLIENT_SECRET;

  if (!appId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/admin/mp-connect?error=config`
    );
  }

  try {
    const response = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: appId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      console.error("MP OAuth error:", data);
      return NextResponse.redirect(
        `${baseUrl}/admin/mp-connect?error=oauth_failed`
      );
    }

    // Show tokens so admin can copy them to env vars
    // In production, store these in a secure DB or secrets manager
    const params = new URLSearchParams({
      success: "true",
      access_token: data.access_token,
      refresh_token: data.refresh_token || "",
      user_id: String(data.user_id || ""),
    });

    return NextResponse.redirect(
      `${baseUrl}/admin/mp-connect?${params.toString()}`
    );
  } catch (error) {
    console.error("MP OAuth callback error:", error);
    return NextResponse.redirect(
      `${baseUrl}/admin/mp-connect?error=server`
    );
  }
}
