import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const authError = validateAdminAuth(request);
    if (authError) return authError;

    const { imageUrl } = (await request.json()) as { imageUrl: string };

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Falta el campo imageUrl" },
        { status: 400 }
      );
    }

    // Import lazy: @imgly arrastra sharp 0.32.6, que en Windows no puede
    // convivir con el sharp 0.34.x de /api/admin/upload si ambos cargan
    // durante el build (conflicto de DLLs de libvips).
    const { removeBackground } = await import("@imgly/background-removal-node");

    // Remove background using local ML model (full quality, transparent PNG)
    const blob = await removeBackground(imageUrl, {
      output: { format: "image/png" },
    });
    const processedBuffer = Buffer.from(await blob.arrayBuffer());

    // Upload processed image to Supabase
    const bucket = "productos";
    const supabase = getSupabaseAdmin();
    const timestamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 6);
    const path = `${timestamp}-${rand}-nobg.png`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, processedBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Error subiendo imagen procesada: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({ publicUrl: urlData.publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error inesperado" },
      { status: 500 }
    );
  }
}
