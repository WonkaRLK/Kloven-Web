import { NextRequest, NextResponse } from "next/server";

export function validateAdminAuth(request: NextRequest): NextResponse | null {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = auth.replace("Bearer ", "");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || token !== adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return null;
}
