import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Paths that are always accessible regardless of drop mode
const BYPASS_PREFIXES = ["/drop", "/admin", "/api", "/_next", "/fonts"];
const BYPASS_EXACT = ["/favicon.ico", "/icon.png"];

interface StoreConfig {
  drop_mode_active: boolean;
  drop_opens_at: string | null;
}

async function getStoreConfig(): Promise<StoreConfig | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/store_config?select=drop_mode_active,drop_opens_at&id=eq.1&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) return null;
    const data: StoreConfig[] = await res.json();
    return data[0] ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    BYPASS_EXACT.includes(pathname) ||
    BYPASS_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const config = await getStoreConfig();
  if (!config?.drop_mode_active) return NextResponse.next();

  // If countdown is set and already passed, store auto-opens
  if (config.drop_opens_at && new Date(config.drop_opens_at) <= new Date()) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/drop", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|fonts).*)"],
};
