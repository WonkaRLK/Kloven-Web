interface KlovenLogoProps {
  className?: string;
  height?: number;
}

export default function KlovenLogo({ className = "", height = 40 }: KlovenLogoProps) {
  // Aspect ratio ~3.2:1 based on the original logo
  const width = Math.round(height * 3.2);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 320 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer rectangle border */}
      <rect
        x="2"
        y="2"
        width="316"
        height="96"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
      />
      {/* KLOVEN text */}
      <text
        x="160"
        y="66"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="var(--font-heading), Arial Black, Arial, sans-serif"
        fontWeight="900"
        fontSize="52"
        letterSpacing="6"
      >
        KLOVEN
      </text>
    </svg>
  );
}
