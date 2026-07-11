import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateAdminAuth } from "@/lib/admin-auth";

export const maxDuration = 30;

// Hero images are full-bleed backgrounds → allow a larger long edge.
// Everything else (product photos) is shown far smaller.
const MAX_DIM_DEFAULT = 1200;
const MAX_DIM_HERO = 1920;
const WEBP_QUALITY = 82;

export async function POST(request: NextRequest) {
  try {
    const authError = validateAdminAuth(request);
    if (authError) return authError;

    const form = await request.formData();
    const file = form.get("file");
    const folder = (form.get("folder") as string | null) || undefined;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Falta el archivo (campo 'file')" },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const originalName = "name" in file ? (file as File).name : "image";

    // Compress + resize before it ever reaches Supabase Storage.
    // .rotate() bakes EXIF orientation so we don't ship sideways photos.
    const maxDim = folder === "hero" ? MAX_DIM_HERO : MAX_DIM_DEFAULT;
    let processedBuffer: Buffer;
    try {
      processedBuffer = await sharp(inputBuffer)
        .rotate()
        .resize(maxDim, maxDim, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
    } catch {
      return NextResponse.json(
        { error: "El archivo no es una imagen válida" },
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

    // Generate unique path — always .webp after compression
    const timestamp = Date.now();
    const safeName = originalName
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .substring(0, 50);
    const path = folder
      ? `${folder}/${timestamp}-${safeName}.webp`
      : `${timestamp}-${safeName}.webp`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, processedBuffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Error subiendo imagen: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
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
