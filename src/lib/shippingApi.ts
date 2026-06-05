import { FLAT_FEE } from "@/lib/shipping";

// Zone costs configurable via env vars (prices in ARS)
// Origin: CP 3260 (Concordia, Entre Ríos)
const ZONE_COSTS = {
  1: parseInt(process.env.SHIPPING_ZONE_1_COST ?? "9000", 10),  // Entre Ríos
  2: parseInt(process.env.SHIPPING_ZONE_2_COST ?? "11000", 10), // Litoral
  3: parseInt(process.env.SHIPPING_ZONE_3_COST ?? "13000", 10), // Centro
  4: parseInt(process.env.SHIPPING_ZONE_4_COST ?? "16000", 10), // NOA + Cuyo + La Pampa
  5: parseInt(process.env.SHIPPING_ZONE_5_COST ?? "20000", 10), // Patagonia
};

// Map of first 2 CP digits → zone number
const CP_ZONE_MAP: Record<string, number> = {
  // Zone 1 — Entre Ríos
  "32": 1,
  // Zone 2 — Litoral (Santa Fe, Corrientes, Misiones, Chaco, Formosa)
  "20": 2, "21": 2, "22": 2, "23": 2,
  "30": 2, "31": 2,
  "33": 2, "34": 2, "35": 2, "36": 2,
  // Zone 3 — Centro (CABA, GBA, Buenos Aires Prov, Córdoba)
  "10": 3, "11": 3, "12": 3, "13": 3, "14": 3,
  "15": 3, "16": 3, "17": 3, "18": 3, "19": 3,
  "24": 3, "25": 3, "26": 3, "27": 3, "28": 3, "29": 3,
  "37": 3, "38": 3, "39": 3,
  "50": 3, "51": 3, "52": 3, "58": 3, "59": 3,
  // Zone 4 — NOA, Cuyo, La Pampa
  "40": 4, "41": 4, "42": 4, "43": 4,
  "44": 4, "45": 4, "46": 4, "47": 4, "48": 4, "49": 4,
  "53": 4, "54": 4, "55": 4, "56": 4, "57": 4,
  "60": 4, "61": 4, "62": 4, "63": 4, "64": 4, "65": 4,
  // Zone 5 — Patagonia (Neuquén, Río Negro, Chubut, Santa Cruz, Tierra del Fuego)
  "70": 5, "71": 5, "72": 5, "73": 5, "74": 5,
  "75": 5, "76": 5, "77": 5, "78": 5, "79": 5,
  "80": 5, "81": 5, "82": 5, "83": 5, "84": 5,
  "85": 5, "86": 5, "87": 5, "88": 5, "89": 5,
  "90": 5, "91": 5, "92": 5, "93": 5, "94": 5,
  "95": 5, "96": 5, "97": 5, "98": 5, "99": 5,
};

const ZONE_NAMES: Record<number, string> = {
  1: "Entre Ríos",
  2: "Litoral",
  3: "Centro",
  4: "NOA / Cuyo / La Pampa",
  5: "Patagonia",
};

export function fetchShippingCost(cpDestino: string): {
  cost: number;
  label: string;
  source: "static" | "fallback";
} {
  if (!/^\d{4}$/.test(cpDestino)) {
    return { cost: FLAT_FEE, label: "Envío estándar", source: "fallback" };
  }

  const prefix = cpDestino.slice(0, 2);
  const zone = CP_ZONE_MAP[prefix];

  if (!zone) {
    return { cost: FLAT_FEE, label: "Envío estándar", source: "fallback" };
  }

  return {
    cost: ZONE_COSTS[zone as keyof typeof ZONE_COSTS],
    label: ZONE_NAMES[zone],
    source: "static",
  };
}
