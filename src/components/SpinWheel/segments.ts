export interface Segment {
  label: string;
  discount: number;
  probability: number;
  color: string;
}

export const SEGMENTS: Segment[] = [
  { label: "18% OFF", discount: 18, probability: 0.05, color: "#D90429" },
  { label: "Perdiste :(", discount: 0, probability: 0.30, color: "#1A1A1A" },
  { label: "10% OFF", discount: 10, probability: 0.25, color: "#2A2A2A" },
  { label: "12% OFF", discount: 12, probability: 0.12, color: "#D90429" },
  { label: "5% OFF", discount: 5, probability: 0.05, color: "#1A1A1A" },
  { label: "15% OFF", discount: 15, probability: 0.23, color: "#2A2A2A" },
];

export const SEGMENT_COUNT = SEGMENTS.length;
export const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

export function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}
