import { NextResponse } from "next/server";

export function safeError(
  status: number,
  publicMessage: string,
  internalError?: unknown
): NextResponse {
  if (internalError) {
    console.error(`[API Error ${status}]`, internalError);
  }
  return NextResponse.json({ error: publicMessage }, { status });
}
