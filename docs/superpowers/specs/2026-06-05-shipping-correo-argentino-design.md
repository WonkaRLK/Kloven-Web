# Diseño: Cálculo de envío dinámico con Correo Argentino

**Fecha:** 2026-06-05  
**Proyecto:** Kloven Streetwear  
**Estado:** Aprobado (v2)

---

## Contexto

El sistema de envío actual usa un fee fijo (`NEXT_PUBLIC_SHIPPING_FLAT_FEE`, default $5000). El objetivo es reemplazarlo con un cálculo dinámico basado en el CP del comprador usando el endpoint público del calculador web de Correo Argentino, con fallback automático al fee fijo si el servicio no responde.

---

## Parámetros fijos

| Parámetro | Valor | Variable de entorno |
|-----------|-------|---------------------|
| CP origen | `3260` | `SHIPPING_ORIGIN_CP` |
| Peso fijo | `500g` por orden | `SHIPPING_WEIGHT_GRAMS` |
| Timeout API | 3 segundos | — |
| Cache TTL | 15 minutos | — |
| Fallback | Fee fijo | `NEXT_PUBLIC_SHIPPING_FLAT_FEE` |

---

## Integración con Correo Argentino

### Endpoint

Se usará el endpoint HTTP que alimenta el calculador web de Correo Argentino en `https://www.correoargentino.com.ar/formularios/oca`. Este endpoint se descubre inspeccionando las network requests del calculador web antes de implementar (puede variar entre versiones; el discovery se hace una sola vez y se documenta en el código).

El request típico es un `GET` o `POST` con parámetros:
- `codigoPostalOrigen` / `cpOrigen`
- `codigoPostalDestino` / `cpDestino`
- `peso` (en gramos)

La respuesta es JSON con el precio de la encomienda estándar.

**Si el endpoint cambia:** el fallback silencioso garantiza que el checkout nunca se rompa. Al detectar la rotura (loguear en consola server-side), se actualiza la URL.

---

## Arquitectura

### 1. `src/lib/shippingApi.ts` (nuevo archivo)

Función compartida usada tanto por la API route como por el checkout server-side:

```ts
export async function fetchShippingCost(cpDestino: string): Promise<number>
```

- Valida que `cpDestino` sean exactamente 4 dígitos numéricos
- Cache en memoria: `Map<string, { cost: number; ts: number }>` con TTL de 15 min
- Llama al endpoint de Correo con `AbortController` timeout de 3s
- Parsea la respuesta y retorna el costo en pesos
- Si falla por cualquier motivo → retorna `FLAT_FEE` (fallback)
- Loguea en consola server-side si Correo falla (para detectar roturas)

### 2. `src/app/api/shipping/calculate/route.ts` (nuevo)

```
POST /api/shipping/calculate
Body:  { cp_destino: string }
Response: { cost: number, label: string, source: "correo_argentino" | "fallback" }
```

- Llama a `fetchShippingCost`
- `label`: `"Correo Argentino"` o `"Envío estándar"` según `source`
- No expone errores internos

### 3. `src/lib/shipping.ts` (actualizar)

Simplificar: solo exportar la constante `FLAT_FEE`. Las funciones de cálculo dinámico viven en `shippingApi.ts`.

### 4. `src/app/(storefront)/checkout/page.tsx` (actualizar)

**Nuevo estado:**
```ts
const [shippingCost, setShippingCost] = useState(FLAT_FEE)
const [shippingLabel, setShippingLabel] = useState("Envío estándar")
const [calculatingShipping, setCalculatingShipping] = useState(false)
```

**Trigger:** cuando `zip` cambia a exactamente 4 dígitos numéricos → debounce 600ms → `POST /api/shipping/calculate`

**Validación del CP:** `zip.length === 4 && /^\d{4}$/.test(zip)`

**Race condition:** al recibir la respuesta, comparar el CP que se envió con el `zip` del estado actual. Si difieren (el usuario cambió el CP mientras esperaba), descartar la respuesta.

**Cuando zip < 4 dígitos:** resetear `shippingCost` a `FLAT_FEE` y `shippingLabel` a `"Envío estándar"`.

**Bloqueo del botón Pagar:** deshabilitado mientras `calculatingShipping === true`

**UI del resumen:**
```
Envío                    $8.500
                         Correo Argentino   ← xs gris debajo del monto
```
Mientras calcula: spinner + "Calculando..."

### 5. `src/app/api/checkout/route.ts` (actualizar)

Reemplazar la llamada a `calculateShipping(afterDiscount)` por `await fetchShippingCost(zip)`. El servidor recalcula de forma independiente — nunca usa el valor enviado por el cliente.

Si hay diferencia entre lo que vio el cliente y lo que calculó el servidor (raro, solo si Correo falló en uno de los dos), la orden se crea con el valor del servidor (que es el correcto). El usuario pagará el monto que muestra MercadoPago, que incluye el costo recalculado.

---

## Validación de CP

- Solo se acepta formato de **4 dígitos numéricos** (ej: `3260`, `1425`)
- CPA de 8 caracteres (ej: `B1900ABA`) queda fuera de scope — si el usuario ingresa ese formato, se usa fallback silenciosamente
- El input `zip` existente en `checkout/page.tsx` recibe: `maxLength={4}`, `inputMode="numeric"`, `pattern="\d{4}"`

---

## Manejo de errores

| Escenario | Comportamiento |
|-----------|----------------|
| CP < 4 dígitos | No se llama, se mantiene flat fee |
| CP con letras | No se llama, se mantiene flat fee |
| Correo timeout (>3s) | Fallback silencioso + log server |
| CP no encontrado en Correo | Fallback silencioso + log server |
| Error de red server-side | Fallback silencioso + log server |
| Checkout con shipping en recálculo | Botón "Pagar" bloqueado hasta resolverse |

---

## Variables de entorno a agregar

```env
# Server-side only
SHIPPING_ORIGIN_CP=3260
SHIPPING_WEIGHT_GRAMS=500
```

`NEXT_PUBLIC_SHIPPING_FLAT_FEE` se mantiene como fallback (visible en cliente para el estado inicial).

---

## Archivos a modificar/crear

| Archivo | Acción |
|---------|--------|
| `src/lib/shippingApi.ts` | Crear — lógica compartida + cache |
| `src/app/api/shipping/calculate/route.ts` | Crear |
| `src/lib/shipping.ts` | Simplificar |
| `src/app/(storefront)/checkout/page.tsx` | Actualizar |
| `src/app/api/checkout/route.ts` | Actualizar |
| `.env.local` | Agregar variables server-side |
