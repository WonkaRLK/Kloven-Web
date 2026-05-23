# Spec: Sold Out Toggle para Productos — Kloven Streetwear

**Fecha:** 2026-05-22  
**Estado:** Aprobado por usuario

---

## Contexto

Kloven Streetwear es un e-commerce Next.js 16 + Supabase + Tailwind CSS 4. Los productos tienen variantes (talle/color/stock). El admin necesita poder marcar un producto entero como "agotado" con una sola acción — que se siga viendo en la web pero sin poder comprarlo.

---

## Objetivo

Agregar un flag `sold_out` a nivel producto que:
- El admin activa/desactiva con un toggle rápido desde la lista de productos.
- Muestra badge "AGOTADO" en la card y página de producto del storefront.
- Deshabilita el botón de carrito en la página de detalle.
- **El servidor bloquea el checkout si el producto está agotado** (la UI es decorativa, el API es el guardián real).
- No oculta el producto de la web (a diferencia del campo `active`).

---

## Base de datos

```sql
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sold_out BOOLEAN NOT NULL DEFAULT false;
```

Sin migraciones complejas. El default `false` mantiene todos los productos existentes disponibles.

---

## Tipos (`src/lib/types.ts`)

Agregar `sold_out: boolean` a la interfaz `Product`:

```ts
export interface Product {
  // ...campos existentes...
  sold_out: boolean;
}
```

`ProductWithVariants extends Product`, `RegularCartItem` y `ComboCartItem` reciben el campo automáticamente — no hay otras interfaces que tocar.

---

## API

### `PATCH /api/admin/products/[id]/sold-out` (nuevo)

Endpoint liviano exclusivo para el toggle rápido desde la lista de productos. No requiere el body completo del producto.

```ts
// Body: { sold_out: boolean }
// Actualiza solo sold_out y updated_at
// Requiere validateAdminAuth
// Respuesta: objeto producto (solo campos de la tabla products, sin variants)
```

Justificación: el `PUT` existente requiere el producto completo + variantes. Enviar todo eso solo para cambiar un boolean es innecesario.

### `PUT /api/admin/products/[id]`

Agregar `sold_out` al objeto de update:

```ts
sold_out: body.sold_out ?? false,
```

**Importante:** el formulario de edición DEBE leer y enviar el valor actual de `sold_out` en el body. Si el form no lo incluye, `?? false` lo resetea silenciosamente. El `ProductForm` y la página de edición deben inicializar el campo con el valor del producto y enviarlo en cada PUT.

### `POST /api/checkout`

**Agregar validación server-side de `sold_out`** en el loop de validación de items, después de resolver el producto desde la DB:

```ts
// En la query de productos, agregar sold_out al select
// Después de obtener el producto:
if (product.sold_out) {
  return NextResponse.json(
    { error: `El producto "${product.name}" está agotado` },
    { status: 400 }
  );
}
```

Esto es la guarda autoritativa real. La UI (botón deshabilitado) es solo decorativa — un usuario con el producto ya en el carrito antes de que se marcara como agotado podría llegar al checkout si solo bloqueamos en el frontend. El servidor es el único guardián confiable.

### `GET /api/products` y `GET /api/products/[slug]`

Sin cambios — el campo `sold_out` llega automáticamente porque la query ya hace `select("*")`.

---

## Admin

### Lista de productos (`/admin/productos`)

**Columna Estado:** Junto al badge "Activo/Inactivo", mostrar badge naranja "Agotado" cuando `sold_out === true`.

**Toggle rápido:** Botón con ícono `PackageX` (agotado) / `Package` (disponible) junto a los botones de editar/eliminar. Al clickear:
1. Llama a `PATCH /api/admin/products/[id]/sold-out` con el valor invertido.
2. Actualiza el estado local de la lista (`setProducts(...)`) sin recargar.
3. Muestra feedback visual durante el loading (ícono de spinner).

### Formulario de edición (`/admin/productos/[id]`)

Toggle "Marcar como agotado" en la sección de configuración. Mismo estilo visual que otros toggles del admin (inline-flex, rounded-full). 

**Requisito crítico:** el form debe inicializar este campo con `product.sold_out` al cargar y enviarlo en el PUT body para evitar el reseteo accidental.

---

## Storefront

### ProductCard (`src/components/ProductCard.tsx`)

**Badge "AGOTADO":**

La card ya tiene hasta dos badges posibles:
- `top-2 left-2` — descuento "% OFF" (rojo)
- `top-2 right-2` — "COMBO" (violeta)

Regla de posicionamiento para evitar colisiones:

| Situación | Badge AGOTADO |
|---|---|
| Solo sold_out | `top-2 left-2` |
| sold_out + descuento | `top-2 right-2` (debajo de COMBO si es combo, en right si no) |
| sold_out + combo | Stacking vertical: COMBO en `top-2 right-2`, AGOTADO en `top-10 right-2` |
| sold_out + descuento + combo | COMBO `top-2 right-2`, AGOTADO `top-10 right-2`, descuento `top-2 left-2` |

Estilo badge: `bg-gray-900 text-white`, mismo tamaño que el de descuento.

**Overlay hover:**

La card es un `<Link>` — el usuario PUEDE seguir clickeando para ir a la página del producto (deseable: puede ver fotos y esperar restock). Lo que cambia es solo el texto del overlay:
- Si `sold_out`: overlay muestra "Sin Stock" en gris, sin ícono de bolsa, sin cursor especial.
- Si no `sold_out`: comportamiento actual sin cambios.

### Página de producto (`/producto/[slug]`)

**Botón principal:**

```tsx
{product.sold_out ? (
  <button
    disabled
    className="w-full py-4 bg-gray-700 text-gray-400 font-bold uppercase tracking-widest cursor-not-allowed opacity-70"
  >
    Sin Stock
  </button>
) : (
  // botón actual de agregar al carrito
)}
```

La selección de talle/color se sigue mostrando (el usuario puede ver qué talles existían). El botón de agregar al carrito está deshabilitado independientemente de la selección.

**Combo products:** Si el combo en sí tiene `sold_out === true`, aplica la misma lógica (botón deshabilitado). La flag `sold_out` de los sub-productos de un combo es ignorada — solo importa el flag del combo como unidad.

---

## CartContext y carrito existente

El CartContext guarda un snapshot del producto al momento de agregarlo. Si el producto se marca como agotado después de que el usuario lo agregó al carrito, la UI del carrito no lo detecta automáticamente. **El server-side check en `/api/checkout` es el guardián autoritativo** — el checkout fallará con 400 si se intenta comprar un producto agotado, sin importar el estado del carrito del cliente.

---

## Flujo completo

1. Admin entra a `/admin/productos`.
2. Clickea el ícono `Package` → `PackageX` en la fila del producto.
3. Badge "Agotado" aparece en la tabla.
4. En el storefront, la card muestra badge "AGOTADO" y el overlay dice "Sin Stock".
5. El cliente puede entrar al producto, ver fotos y talles, pero el botón está deshabilitado.
6. Si el cliente tenía el producto en el carrito desde antes, el checkout devuelve error 400.
7. Cuando llega stock, el admin clickea el toggle — el producto vuelve a estar disponible.

---

## Lo que NO cambia

- El producto sigue apareciendo en la tienda, carousel y búsquedas.
- `active: false` sigue siendo el mecanismo para ocultar el producto completamente.
- El stock numérico de variantes no se modifica — `sold_out` es independiente.
- No hay lógica automática: el admin activa/desactiva manualmente.
- El campo `on_sale` es independiente y no interactúa con `sold_out` en la lógica de negocio.
