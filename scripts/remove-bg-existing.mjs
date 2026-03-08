/**
 * One-time script: remove background from all existing product images.
 * Uses local ML model — full resolution, transparent PNG output.
 * Run with: node scripts/remove-bg-existing.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { removeBackground } from "@imgly/background-removal-node";

const SUPABASE_URL = "https://dujbmznsayhiatuosibo.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1amJtem5zYXloaWF0dW9zaWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU0MjQ1OCwiZXhwIjoyMDg3MTE4NDU4fQ.mf36mewUiej5a4JscVR7fdHWKO1QyorBzOE90-rbb8k";
const BUCKET = "productos";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function processImage(imageUrl) {
  const blob = await removeBackground(imageUrl, {
    output: { format: "image/png" },
  });
  return Buffer.from(await blob.arrayBuffer());
}

async function uploadToSupabase(buffer) {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 6);
  const path = `${timestamp}-${rand}-nobg.png`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: "image/png", upsert: true });

  if (error) throw new Error(`Upload error: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, image_url, images")
    .eq("active", true);

  if (error) {
    console.error("Error fetching products:", error.message);
    process.exit(1);
  }

  let totalImages = 0;
  for (const p of products) {
    const imgs = p.images?.length ? p.images : p.image_url ? [p.image_url] : [];
    totalImages += imgs.length;
  }

  console.log(`\nProductos: ${products.length}`);
  console.log(`Imagenes totales: ${totalImages}`);
  console.log(`Procesando (PNG transparente, calidad completa)...\n`);

  for (const product of products) {
    const imgs = product.images?.length
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

    if (imgs.length === 0) {
      console.log(`[SKIP] ${product.name} — sin imagenes`);
      continue;
    }

    console.log(`[PROCESSING] ${product.name} (${imgs.length} imgs)...`);

    const newImages = [];
    for (let i = 0; i < imgs.length; i++) {
      const url = imgs[i];
      try {
        console.log(`  img ${i + 1}/${imgs.length}: quitando fondo...`);
        const buffer = await processImage(url);
        const newUrl = await uploadToSupabase(buffer);
        newImages.push(newUrl);
        console.log(`  img ${i + 1}/${imgs.length}: OK`);
      } catch (err) {
        console.error(`  img ${i + 1}/${imgs.length}: ERROR — ${err.message}`);
        newImages.push(url);
      }
    }

    const { error: updateError } = await supabase
      .from("products")
      .update({
        images: newImages,
        image_url: newImages[0],
      })
      .eq("id", product.id);

    if (updateError) {
      console.error(`  [DB ERROR] ${updateError.message}`);
    } else {
      console.log(`  [UPDATED] ${product.name}\n`);
    }
  }

  console.log("\nListo!");
}

main();
