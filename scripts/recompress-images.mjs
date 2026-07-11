// One-shot: recomprime imágenes ya subidas al bucket "productos" de Supabase.
//
// Descarga cada archivo, lo pasa por sharp (resize máx 1200/1920px + WebP q82)
// y lo vuelve a subir AL MISMO PATH (upsert). Como la URL no cambia, ninguna
// referencia en la DB (products.images, image_url, hero config) se rompe.
//
// Uso:
//   node scripts/recompress-images.mjs            -> dry-run (solo reporta, no escribe)
//   node scripts/recompress-images.mjs --apply    -> aplica los cambios
//
// Requiere en .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- cargar .env.local sin dependencias ---
function loadEnv() {
  const envPath = join(__dirname, "..", ".env.local");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(m[1] in process.env)) process.env[m[1]] = val;
  }
}
loadEnv();

const APPLY = process.argv.includes("--apply");
const BUCKET = "productos";
const MAX_DIM_DEFAULT = 1200;
const MAX_DIM_HERO = 1920;
const WEBP_QUALITY = 82;
// Solo re-subimos si ahorramos al menos este % respecto del original.
const MIN_SAVINGS = 0.1;
// Cache de 1 año: navegador + CDN de Supabase cachean fuerte -> menos egress.
const CACHE_CONTROL = "31536000";
// Si el header ya tiene un max-age largo (>=100000s) no hace falta re-tocarlo.
const GOOD_CACHE_RE = /max-age=\d{6,}/i;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}
const supabase = createClient(url, key);

const fmtKB = (b) => (b / 1024).toFixed(1) + " KB";
const publicUrl = (path) =>
  `${url}/storage/v1/object/public/${BUCKET}/${path}`;

// Lee el Cache-Control actual del objeto público.
// OJO: ni HEAD ni GET con Range reflejan el header real (Cloudflare cachea
// variantes distintas y devuelve no-cache / max-age=3600). Solo el GET
// completo devuelve lo que ve el navegador. Descartamos el body.
async function currentCacheControl(path) {
  try {
    const res = await fetch(publicUrl(path));
    const cc = res.headers.get("cache-control") || "";
    res.body?.cancel?.();
    return cc;
  } catch {
    return "";
  }
}

// Lista recursiva de todos los archivos del bucket.
async function listAllFiles(prefix = "") {
  const out = [];
  const pageSize = 1000;
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: pageSize, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`list("${prefix}"): ${error.message}`);
    if (!data || data.length === 0) break;

    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      // Las carpetas vienen con id === null.
      if (item.id === null) {
        out.push(...(await listAllFiles(path)));
      } else {
        out.push({ path, size: item.metadata?.size ?? null });
      }
    }
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

async function main() {
  console.log(`Modo: ${APPLY ? "APPLY (escribe cambios)" : "DRY-RUN (no escribe)"}\n`);

  const files = await listAllFiles();
  console.log(`Archivos en bucket "${BUCKET}": ${files.length}\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let recompressed = 0;
  let cacheFixed = 0;
  let skipped = 0;
  let failed = 0;

  for (const f of files) {
    const maxDim = f.path.startsWith("hero/") ? MAX_DIM_HERO : MAX_DIM_DEFAULT;
    try {
      const hasGoodCache = GOOD_CACHE_RE.test(await currentCacheControl(f.path));

      const { data: blob, error: dlErr } = await supabase.storage
        .from(BUCKET)
        .download(f.path);
      if (dlErr || !blob) throw new Error(dlErr?.message || "sin datos");

      const input = Buffer.from(await blob.arrayBuffer());
      const meta = await sharp(input).metadata();
      const alreadyOptimized =
        meta.format === "webp" && (meta.width ?? 0) <= maxDim;

      // Ya es WebP dentro del límite y ya tiene cache largo -> nada que hacer.
      if (alreadyOptimized && hasGoodCache) {
        skipped++;
        totalBefore += input.length;
        totalAfter += input.length;
        continue;
      }

      // Ya optimizada pero le falta el cache largo -> re-subir mismos bytes.
      if (alreadyOptimized) {
        cacheFixed++;
        totalBefore += input.length;
        totalAfter += input.length;
        console.log(`  ${APPLY ? "cache" : "would"} ${f.path}  (set cache-control)`);
        if (APPLY) {
          const { error: upErr } = await supabase.storage
            .from(BUCKET)
            .upload(f.path, input, {
              contentType: "image/webp",
              cacheControl: CACHE_CONTROL,
              upsert: true,
            });
          if (upErr) throw new Error(`upload: ${upErr.message}`);
        }
        continue;
      }

      const output = await sharp(input)
        .rotate()
        .resize(maxDim, maxDim, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      totalBefore += input.length;

      // Si no ahorramos lo suficiente, dejamos el original (pero igual arreglamos cache).
      if (output.length >= input.length * (1 - MIN_SAVINGS)) {
        totalAfter += input.length;
        if (hasGoodCache) {
          skipped++;
          console.log(`  skip  ${f.path}  (${fmtKB(input.length)} — sin ahorro)`);
        } else {
          cacheFixed++;
          console.log(`  ${APPLY ? "cache" : "would"} ${f.path}  (sin ahorro, set cache-control)`);
          if (APPLY) {
            const { error: upErr } = await supabase.storage
              .from(BUCKET)
              .upload(f.path, input, { cacheControl: CACHE_CONTROL, upsert: true });
            if (upErr) throw new Error(`upload: ${upErr.message}`);
          }
        }
        continue;
      }

      totalAfter += output.length;
      recompressed++;
      const pct = (100 * (1 - output.length / input.length)).toFixed(0);
      console.log(
        `  ${APPLY ? "OK   " : "would"} ${f.path}  ${fmtKB(input.length)} -> ${fmtKB(output.length)}  (-${pct}%)`
      );

      if (APPLY) {
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(f.path, output, {
            contentType: "image/webp",
            cacheControl: CACHE_CONTROL,
            upsert: true,
          });
        if (upErr) throw new Error(`upload: ${upErr.message}`);
      }
    } catch (err) {
      failed++;
      console.warn(`  FAIL ${f.path}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("\n--- Resumen ---");
  console.log(`Recomprimidas: ${recompressed}`);
  console.log(`Cache fix:     ${cacheFixed}`);
  console.log(`Saltadas:      ${skipped}`);
  console.log(`Fallidas:      ${failed}`);
  console.log(`Total antes:   ${fmtKB(totalBefore)}`);
  console.log(`Total después: ${fmtKB(totalAfter)}`);
  if (totalBefore > 0) {
    console.log(`Ahorro:        ${(100 * (1 - totalAfter / totalBefore)).toFixed(1)}%`);
  }
  if (!APPLY) console.log("\n(DRY-RUN — re-ejecutá con --apply para escribir)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
