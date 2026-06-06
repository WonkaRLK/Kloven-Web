# Shipping Dinámico con Correo Argentino — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el fee fijo de envío por un cálculo dinámico en tiempo real usando el endpoint público del calculador web de Correo Argentino, con fallback automático al fee fijo si el servicio no responde.

**Architecture:** Una función server-side compartida (`shippingApi.ts`) con cache in-memory y fallback es usada tanto por la nueva API route `/api/shipping/calculate` como por el checkout route existente. El checkout page consulta el costo al escribir el CP (debounce 600ms) y bloquea el botón Pagar durante la consulta.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4

---

## PREREQUISITO — Spike: Descubrir endpoint de Correo Argentino

Este paso debe completarse ANTES de arrancar cualquier task. Si falla, no se puede implementar la integración y se usa el flat fee permanente.

- [ ] **Spike Step 1: Descubrir el endpoint**

Abrir https://www.correoargentino.com.ar/formularios/oca en un navegador con DevTools (pestaña Network). Completar:
- CP origen: `3260`
- CP destino: `1425`
- Peso: `500g`

Hacer submit y encontrar el request HTTP con el precio. Documentar:
- URL completa
- Método (GET/POST)
- Headers requeridos (especialmente: `Origin`, `Referer`, `Authorization`, cookies)
- Body (si POST)
- Estructura JSON de respuesta: qué campo tiene el precio (ej: `data.precio`, `tarifa`, etc.)

- [ ] **Spike Step 2: Verificar que es reproducible server-side**

```bash
# Ejemplo — ajustar URL, método y body según lo descubierto:
curl -X POST "<URL>" \
  -H "Content-Type: application/json" \
  -H "Referer: https://www.correoargentino.com.ar/" \
  -d '{"codigoPostalOrigen":"3260","codigoPostalDestino":"1425","pesoEnGramos":500}'
```

Expected: respuesta JSON con el precio. Si falla por CSRF/cookies, el endpoint no es usable server-side y hay que buscar una alternativa.

- [ ] **Spike Step 3: Documentar resultado en `.env.local`**

```env
CORREO_API_URL=<URL real>
CORREO_API_REFERER=https://www.correoargentino.com.ar/  # si se necesita
```

Y anotar el campo del precio para ajustar `parseCorreoCost` en Task 1.

**Criterio de aceptación:** se obtiene un número de precio en pesos desde la terminal sin navegador.

---

## Chunk 1: `shippingApi.ts` + API route `/api/shipping/calculate`

### Task 1: Crear `src/lib/shippingApi.ts`

**Files:**
- Create: `src/lib/shippingApi.ts`

- [ ] **Step 1: Crear el archivo**

```ts
import { FLAT_FEE } from "@/lib/shipping";

const ORIGIN_CP = process.env.SHIPPING_ORIGIN_CP ?? "3260";
const WEIGHT_GRAMS = parseInt(process.env.SHIPPING_WEIGHT_GRAMS ?? "500", 10);
const CORREO_API_URL =
  process.env.CORREO_API_URL ??
  "https://tarifa.correoargentino.com.ar/api/v1/tarifas/calculo";

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, { cost: number; expiresAt: number }>();

export async function fetchShippingCost(
  cpDestino: string
): Promise<{ cost: number; source: "correo_argentino" | "fallback" }> {
  if (!/^\d{4}$/.test(cpDestino)) {
    return { cost: FLAT_FEE, source: "fallback" };
  }

  const key = `${ORIGIN_CP}-${cpDestino}-${WEIGHT_GRAMS}`;
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return { cost: cached.cost, source: "correo_argentino" };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);

    // Adjust method, body, and headers based on Spike discovery
    const res = await fetch(CORREO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CORREO_API_REFERER
          ? { Referer: process.env.CORREO_API_REFERER }
          : {}),
      },
      body: JSON.stringify({
        codigoPostalOrigen: ORIGIN_CP,
        codigoPostalDestino: cpDestino,
        pesoEnGramos: WEIGHT_GRAMS,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) throw new Error(`Correo HTTP ${res.status}`);

    const data = await res.json();
    const cost = parseCorreoCost(data);
    cache.set(key, { cost, expiresAt: Date.now() + CACHE_TTL_MS });
    return { cost, source: "correo_argentino" };
  } catch (err) {
    console.error("[shipping] Correo Argentino API failed, using fallback:", err);
    return { cost: FLAT_FEE, source: "fallback" };
  }
}

// Adjust this based on the actual response shape found in the Spike
function parseCorreoCost(data: unknown): number {
  if (typeof data !== "object" || data === null)
    throw new Error("Unexpected shape");
  const d = data as Record<string, unknown>;
  for (const k of ["precio", "tarifa", "costo", "importe", "total"]) {
    const v = d[k];
    if (typeof v === "number") return Math.round(v);
    if (typeof v === "string" && !isNaN(parseFloat(v)))
      return Math.round(parseFloat(v));
  }
  throw new Error(`Unknown response: ${JSON.stringify(d)}`);
}
```

- [ ] **Step 2: Verificar compilación**

```bash
cd "C:\Users\PC RYZEN\Desktop\kloven web"
npx tsc --noEmit 2>&1 | head -20
```

Expected: sin errores en `shippingApi.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/shippingApi.ts
git commit -m "feat: add shippingApi with Correo Argentino integration and in-memory cache"
```

---

### Task 2: Crear API route `POST /api/shipping/calculate`

**Files:**
- Create: `src/app/api/shipping/calculate/route.ts`

- [ ] **Step 1: Crear directorio**

```bash
mkdir -p "C:\Users\PC RYZEN\Desktop\kloven web\src\app\api\shipping\calculate"
```

- [ ] **Step 2: Crear el archivo**

```ts
import { NextRequest, NextResponse } from "next/server";
import { fetchShippingCost } from "@/lib/shippingApi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cp = typeof body?.cp_destino === "string" ? body.cp_destino.trim() : "";

    // Validate before hitting Correo Argentino
    if (!/^\d{4}$/.test(cp)) {
      const fallback = parseInt(process.env.NEXT_PUBLIC_SHIPPING_FLAT_FEE ?? "5000", 10);
      return NextResponse.json({ cost: fallback, label: "Envío estándar", source: "fallback" });
    }

    const { cost, source } = await fetchShippingCost(cp);
    return NextResponse.json({
      cost,
      label: source === "correo_argentino" ? "Correo Argentino" : "Envío estándar",
      source,
    });
  } catch {
    const fallback = parseInt(process.env.NEXT_PUBLIC_SHIPPING_FLAT_FEE ?? "5000", 10);
    return NextResponse.json({ cost: fallback, label: "Envío estándar", source: "fallback" });
  }
}
```

- [ ] **Step 3: Verificar compilación**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 4: Testear con curl (servidor corriendo con `npm run dev`)**

```bash
# CP válido:
curl -X POST http://localhost:3000/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{"cp_destino":"1425"}'
# Expected: {"cost":<número>,"label":"Correo Argentino","source":"correo_argentino"}
# o fallback si Correo no responde

# CP inválido:
curl -X POST http://localhost:3000/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{"cp_destino":"ABC1"}'
# Expected: {"cost":5000,"label":"Envío estándar","source":"fallback"}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/shipping/calculate/route.ts
git commit -m "feat: add /api/shipping/calculate route with input validation"
```

---

## Chunk 2: Actualizar checkout page (antes de simplificar shipping.ts)

### Task 3: Actualizar `checkout/page.tsx` con cálculo dinámico

**Files:**
- Modify: `src/app/(storefront)/checkout/page.tsx`

> **IMPORTANTE:** Este task va ANTES de simplificar `shipping.ts` para evitar errores de compilación intermedios.

- [ ] **Step 1: Actualizar el import de shipping**

Reemplazar:
```ts
import { getShippingInfo } from "@/lib/shipping";
```
Por:
```ts
import { FLAT_FEE } from "@/lib/shipping";
```

- [ ] **Step 2: Reemplazar los cálculos estáticos por estado dinámico**

Reemplazar (línea ~62):
```ts
const discountAmount = Math.round(subtotal * discount);
const afterDiscount = subtotal - discountAmount;
const shipping = getShippingInfo(afterDiscount);
const total = afterDiscount + shipping.cost;
```

Por:
```ts
const [shippingCost, setShippingCost] = useState(FLAT_FEE);
const [shippingLabel, setShippingLabel] = useState<string | null>(null);
const [calculatingShipping, setCalculatingShipping] = useState(false);

const discountAmount = Math.round(subtotal * discount);
const afterDiscount = subtotal - discountAmount;
const total = afterDiscount + shippingCost;
```

- [ ] **Step 3: Agregar useEffect para el cálculo dinámico**

Agregar después de los `useEffect` existentes (línea ~60):

```ts
useEffect(() => {
  if (!/^\d{4}$/.test(zip)) {
    setShippingCost(FLAT_FEE);
    setShippingLabel(null);
    return;
  }

  const cpAtTrigger = zip;
  setCalculatingShipping(true);

  const timer = setTimeout(async () => {
    try {
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cp_destino: cpAtTrigger }),
      });
      const data = await res.json();

      // Discard stale response if zip changed while waiting
      setZip((currentZip) => {
        if (currentZip === cpAtTrigger) {
          setShippingCost(data.cost);
          setShippingLabel(data.label ?? null);
        }
        return currentZip;
      });
    } catch {
      // Silent fallback — shippingCost stays at FLAT_FEE
    } finally {
      setCalculatingShipping(false);
    }
  }, 600);

  return () => clearTimeout(timer);
}, [zip]); // eslint-disable-line react-hooks/exhaustive-deps
```

- [ ] **Step 4: Actualizar el input de CP**

Localizar el `<input>` del campo zip y agregar atributos:

```tsx
<input
  required
  type="text"
  value={zip}
  onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
  className={inputClasses}
  placeholder="CP"
  maxLength={4}
  inputMode="numeric"
/>
```

> El `replace(/\D/g, "")` en el onChange impide letras directamente, sin depender solo de `pattern`.

- [ ] **Step 5: Actualizar la sección de envío en el resumen**

Localizar el div de "Envio" en el resumen (lado derecho) y reemplazar:
```tsx
<div className="flex justify-between text-kloven-ash">
  <span>Envio</span>
  <span>${shipping.cost.toLocaleString("es-AR")}</span>
</div>
```

Por:
```tsx
<div className="flex justify-between text-kloven-ash">
  <span>Envio</span>
  <div className="text-right">
    {calculatingShipping ? (
      <span className="text-xs animate-pulse">Calculando...</span>
    ) : (
      <>
        <span>${shippingCost.toLocaleString("es-AR")}</span>
        {shippingLabel && (
          <span className="block text-[10px] text-kloven-ash/60">
            {shippingLabel}
          </span>
        )}
      </>
    )}
  </div>
</div>
```

- [ ] **Step 6: Bloquear el botón Pagar durante el cálculo**

Buscar el botón de submit que tiene `disabled={submitting}` y cambiar a:
```tsx
disabled={submitting || calculatingShipping}
```

- [ ] **Step 7: Verificar compilación**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: sin errores en `checkout/page.tsx`. Puede haber errores en `api/checkout/route.ts` por `calculateShipping` — se resuelven en Task 4.

- [ ] **Step 8: Commit**

```bash
git add src/app/(storefront)/checkout/page.tsx
git commit -m "feat: dynamic shipping in checkout — debounce + race condition guard"
```

---

### Task 4: Actualizar `CartDrawer.tsx` y simplificar `src/lib/shipping.ts`

**Files:**
- Modify: `src/components/CartDrawer.tsx`
- Modify: `src/lib/shipping.ts`

> Este task va DESPUÉS de actualizar el checkout page para evitar errores de compilación.
> `CartDrawer.tsx` también usa `getShippingInfo` (líneas 8, 42-43, 277) y se rompe cuando se elimina esa función.

- [ ] **Step 1: Actualizar `CartDrawer.tsx`**

Reemplazar el import:
```ts
import { getShippingInfo } from "@/lib/shipping";
```
Por:
```ts
import { FLAT_FEE } from "@/lib/shipping";
```

Reemplazar los cálculos (líneas ~42-43):
```ts
const shipping = getShippingInfo(afterDiscount);
const total = afterDiscount + shipping.cost;
```
Por:
```ts
const total = afterDiscount + FLAT_FEE;
```

Reemplazar el uso en JSX (línea ~277):
```tsx
<span>${shipping.cost.toLocaleString("es-AR")}</span>
```
Por:
```tsx
<span>${FLAT_FEE.toLocaleString("es-AR")}</span>
```

> Nota: el CartDrawer siempre muestra el flat fee — el cálculo dinámico solo ocurre en el checkout donde el usuario ingresa el CP.

- [ ] **Step 3: Reemplazar el contenido completo de `src/lib/shipping.ts`**

```ts
export const FLAT_FEE = parseInt(
  process.env.NEXT_PUBLIC_SHIPPING_FLAT_FEE ?? "5000",
  10
);
```

- [ ] **Step 4: Verificar compilación**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Los únicos errores esperados son en `api/checkout/route.ts` (aún usa `calculateShipping`) — se resuelven en Task 5.

- [ ] **Step 5: Commit**

```bash
git add src/lib/shipping.ts src/components/CartDrawer.tsx
git commit -m "refactor: simplify shipping.ts + update CartDrawer to use FLAT_FEE"
```

---

## Chunk 3: Actualizar API de checkout y limpiar referencias

### Task 5: Actualizar `/api/checkout/route.ts`

**Files:**
- Modify: `src/app/api/checkout/route.ts`

- [ ] **Step 1: Actualizar el import**

Reemplazar:
```ts
import { calculateShipping } from "@/lib/shipping";
```
Por:
```ts
import { fetchShippingCost } from "@/lib/shippingApi";
```

- [ ] **Step 2: Verificar que `zip` está disponible en el scope correcto**

Buscar dónde se desestructura el body del request (línea ~60 aprox). Confirmar que `zip` está en la desestructuración junto con `address`, `city`, etc. Si no está, agregarlo.

- [ ] **Step 3: Reemplazar el cálculo de shipping**

Localizar (línea ~251):
```ts
const shippingCost = calculateShipping(afterDiscount);
```

Reemplazar por:
```ts
const { cost: shippingCost } = await fetchShippingCost(zip);
```

> `fetchShippingCost` devuelve `{ cost, source }` — solo se usa `cost` aquí. El `await` es necesario ya que la función es async.

- [ ] **Step 4: Verificar que la función que llama también es async**

La función `POST` en `route.ts` ya es `async` (línea 30). Sin cambios adicionales.

- [ ] **Step 5: Verificar compilación limpia**

```bash
npx tsc --noEmit 2>&1
```

Expected: **0 errores**.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "feat: recalculate shipping server-side with Correo Argentino in checkout API"
```

---

### Task 6: Limpiar referencias residuales de `shipping_cost === 0`

**Files:**
- Modify: `src/lib/email.ts` (línea 90)
- Modify: `src/app/(storefront)/compra/exito/page.tsx` (línea ~155)
- Modify: `src/app/(storefront)/mi-pedido/[token]/page.tsx` (línea ~222)
- Modify: `src/app/admin/pedidos/[id]/page.tsx` (línea ~229)

- [ ] **Step 1: Buscar todos los patrones**

```bash
grep -rn "shipping_cost === 0\|isFree\|freeThreshold" src/ --include="*.ts" --include="*.tsx"
```

- [ ] **Step 2: En cada archivo encontrado, reemplazar el ternario**

```tsx
// Antes:
{order.shipping_cost === 0 ? "Gratis" : `$${order.shipping_cost.toLocaleString("es-AR")}`}

// Después:
${order.shipping_cost.toLocaleString("es-AR")}
```

Para `email.ts` el patrón puede ser un template string — ajustar en consecuencia.

- [ ] **Step 3: Verificar compilación**

```bash
npx tsc --noEmit 2>&1
```

Expected: 0 errores.

- [ ] **Step 4: Commit**

```bash
git add src/lib/email.ts src/app/\(storefront\)/compra/exito/page.tsx src/app/\(storefront\)/mi-pedido src/app/admin/pedidos
git commit -m "cleanup: remove shipping_cost === 0 checks — shipping is always charged"
```

---

### Task 7: Agregar variables de entorno y prueba de integración

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Agregar variables server-side a `.env.local`**

```env
SHIPPING_ORIGIN_CP=3260
SHIPPING_WEIGHT_GRAMS=500
CORREO_API_URL=<URL del spike>
# CORREO_API_REFERER=https://www.correoargentino.com.ar/  # si fue necesario
```

- [ ] **Step 2: Probar el flujo completo en el navegador**

Con `npm run dev`:

1. Ir a `/tienda`, agregar un producto, ir a `/checkout`
2. **Estado inicial:** verificar que el envío muestra `$5.000` (flat fee) antes de escribir CP
3. **CP válido (Buenos Aires):** escribir `1425` → esperar ~600ms → verificar que el costo actualiza y aparece "Correo Argentino" debajo
4. **CP válido (otra ciudad):** escribir `3000` (Santa Fe) → verificar que el costo es diferente
5. **Borrar CP:** verificar que vuelve a `$5.000` y el label desaparece
6. **CP inválido:** escribir `ABC` → verificar que no dispara la consulta (intenta escribir letras y el campo las rechaza)
7. **Botón bloqueado:** verificar que durante el ~600ms de cálculo el botón "Pagar" está deshabilitado
8. **Total correcto:** verificar que el total se recalcula correctamente con el costo de Correo

- [ ] **Step 3: Verificar en consola del servidor**

Con un CP válido: confirmar que NO aparece `[shipping] Correo Argentino API failed`.  
Con CORREO_API_URL inválida temporalmente: confirmar que SÍ aparece y el fallback funciona.

- [ ] **Step 4: Commit final**

```bash
git add .env.local
git commit -m "feat: complete Correo Argentino dynamic shipping — env vars configured"
```
