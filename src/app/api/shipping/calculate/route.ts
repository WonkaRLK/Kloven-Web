import { NextRequest, NextResponse } from "next/server";
import { fetchShippingCost } from "@/lib/shippingApi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cp = typeof body?.cp_destino === "string" ? body.cp_destino.trim() : "";
    const result = fetchShippingCost(cp);
    return NextResponse.json(result);
  } catch {
    const { FLAT_FEE } = await import("@/lib/shipping");
    return NextResponse.json({ cost: FLAT_FEE, label: "Envío estándar", source: "fallback" });
  }
}
