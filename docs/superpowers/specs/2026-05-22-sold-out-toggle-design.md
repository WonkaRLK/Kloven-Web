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

---

## API

### `PUT /api/admin/products/[id]`
Agregar `sold_out` al objeto de update en el handler existente:

```ts
sold_out: body.sold_out ?? false,
```

### Nuevo: `PATCH /api/admin/products/[id]/sold-out`
Endpoint liviano solo para el toggle rápido desde la lista.

```ts
// body: { sold_out: boolean }
// Actualiza solo el campo sold_out y updated_at
// Requiere validateAdminAuth
// Devuelve el producto actualizado
```

### `GET /api/products` y `GET /api/products/[slug]`
Sin cambios — el campo `sold_out` llega automáticamente al frontend porque la query ya hace `select("*")`.

---

## Admin

### Lista de productos (`/admin/productos`)

**Columna Estado:** Mostrar junto al badge "Activo/Inactivo" un badge naranja "Agotado" cuando `sold_out === true`.

**Toggle rápido:** Botón icono `PackageX` / `Package` al lado del lápiz/basura. Al clickear llama a `PATCH /api/admin/products/[id]/sold-out` y actualiza el estado local sin recargar la lista.

### Formulario de edición (`/admin/productos/[id]`)
Toggle "Marcar como agotado" en la sección de configuración del producto. Mismo estilo que los otros toggles del admin (inline-flex, rounded-full, bg-black cuando activo).

---

## Storefront

### ProductCard (`src/components/ProductCard.tsx`)

**Badge "AGOTADO":**
- Posición: `absolute top-2 left-2` (o `right-2` si hay badge de descuento también).
- Estilo: `bg-gray-900 text-white` con texto "AGOTADO", mismo tamaño que el badge de descuento.
- Lógica: si `product.sold_out && product.compare_at_price` → badge descuento en `left-2`, badge agotado en `right-2`. Si solo `sold_out` → badge agotado en `left-2`.

**Overlay hover:**
- Si `sold_out`: texto "Sin Stock" en gris, sin ícono de bolsa, sin hover interactivo (cursor normal).
- Si no `sold_out`: comportamiento actual sin cambios.

### Página de producto (`/producto/[slug]`)

**Botón de carrito:**
```tsx
{product.sold_out ? (
  <button disabled className="... opacity-50 cursor-not-allowed">
    Sin Stock
  </button>
) : (
  // botón actual de agregar al carrito
)}
```

La selección de talle/color se puede seguir mostrando (no hay motivo para ocultarla), pero el botón principal queda deshabilitado.

---

## Flujo completo

1. Admin entra a `/admin/productos`.
2. Ve un producto con stock 0, clickea el toggle `PackageX`.
3. El badge "Agotado" aparece en la fila.
4. En el storefront, la card muestra el badge "AGOTADO" y el overlay dice "Sin Stock".
5. El cliente entra al producto, puede ver fotos y talles, pero el botón de compra está deshabilitado.
6. Cuando llega stock, el admin clickea el toggle de nuevo — el producto vuelve a estar disponible.

---

## Lo que NO cambia

- El producto sigue apareciendo en la tienda, en el carousel y en búsquedas.
- El campo `active` sigue siendo el que oculta el producto completamente.
- El stock de variantes no se modifica — `sold_out` es independiente del stock numérico.
- No hay lógica automática: el admin activa/desactiva manualmente.
