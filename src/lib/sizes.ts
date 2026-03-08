export const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
export const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

export function getSizesForType(sizeType: string): string[] {
  return sizeType === "shoes" ? SHOE_SIZES : CLOTHING_SIZES;
}

export function generateNumericSizes(min: number, max: number): string[] {
  const sizes: string[] = [];
  for (let i = min; i <= max; i++) {
    sizes.push(String(i));
  }
  return sizes;
}

export function detectSizeMode(sizes: string[]): "letters" | "numeric" {
  if (sizes.length === 0) return "letters";
  return sizes.every((s) => /^\d+$/.test(s)) ? "numeric" : "letters";
}
