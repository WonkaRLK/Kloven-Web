import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const authError = validateAdminAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { fileName, contentType } = body as {
      fileName: string;
      contentType: string;
    };

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "Faltan campos: fileName, contentType" },
        { status: 400 }
      );
    }

    const bucket = "productos";
    const supabase = getSupabaseAdmin();

    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucket);

    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(
        bucket,
        { public: true }
      );
      if (bucketError) {
        return NextResponse.json(
          { error: `Error creando bucket: ${bucketError.message}` },
          { status: 500 }
        );
      }
    }

    // Generate unique path
    const ext = fileName.split(".").pop();
    const timestamp = Date.now();
    const safeName = fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .substring(0, 50);
    const path = `${timestamp}-${safeName}.${ext}`;

    const { data, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (signError || !data) {
      return NextResponse.json(
        { error: `Error creando URL: ${signError?.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      publicUrl: urlData.publicUrl,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error inesperado" },
      { status: 500 }
    );
  }
}
