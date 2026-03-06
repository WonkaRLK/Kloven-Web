export const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
export const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];

export function getSizesForType(sizeType: string): string[] {
  return sizeType === "shoes" ? SHOE_SIZES : CLOTHING_SIZES;
}
