const FREE_THRESHOLD = parseInt(
  process.env.NEXT_PUBLIC_SHIPPING_FREE_THRESHOLD || "50000",
  10
);
const FLAT_FEE = parseInt(
  process.env.NEXT_PUBLIC_SHIPPING_FLAT_FEE || "5000",
  10
);

export function calculateShipping(subtotal: number): number {
  if (subtotal >= FREE_THRESHOLD) return 0;
  return FLAT_FEE;
}

export function getShippingInfo(subtotal: number) {
  const cost = calculateShipping(subtotal);
  const isFree = cost === 0;
  const remaining = FREE_THRESHOLD - subtotal;

  return {
    cost,
    isFree,
    freeThreshold: FREE_THRESHOLD,
    remaining: remaining > 0 ? remaining : 0,
  };
}
