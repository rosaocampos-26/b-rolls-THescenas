import React from "react";
import { BRAND, FONT_FAMILY } from "../brand";

const W = 176;
const H = 260;
/** Rounded "luggage tag" outline in tag space (0..W, 0..H). */
const TAG_PATH =
  "M 0,92 L 0,236 Q 0,260 24,260 L 152,260 Q 176,260 176,236 L 176,92 Q 176,80 168,71 L 124,19 Q 116,10 104,10 L 72,10 Q 60,10 52,19 L 8,71 Q 0,80 0,92 Z";
const HOLE = { x: 88, y: 44, r: 11 };
/** Ring pivot (top of the loop) in tag space — the tag swings around it. */
export const TAG_PIVOT = { x: 88, y: -22 };

/**
 * Cream price tag hanging from a navy ring, labeled "Gs." (guaraníes).
 * Position it by its pivot; `swing` rotates it around the ring in degrees.
 */
export const PriceTag: React.FC<{
  id: string;
  label?: string;
  scale?: number;
  swing?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ id, label = "Gs.", scale = 1, swing = 0, opacity = 1, style }) => {
  const pad = { l: 30, t: 70, r: 40, b: 40 };
  return (
    <svg
      width={(W + pad.l + pad.r) * scale}
      height={(H + pad.t + pad.b) * scale}
      viewBox={`${-pad.l} ${-pad.t} ${W + pad.l + pad.r} ${H + pad.t + pad.b}`}
      style={{
        position: "absolute",
        overflow: "visible",
        // Place the pivot at the element's origin so callers position the ring point.
        marginLeft: -(TAG_PIVOT.x + pad.l) * scale,
        marginTop: -(TAG_PIVOT.y + pad.t) * scale,
        transformOrigin: `${(TAG_PIVOT.x + pad.l) * scale}px ${(TAG_PIVOT.y + pad.t) * scale}px`,
        transform: `rotate(${swing}deg)`,
        opacity,
        ...style,
      }}
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFEFA" />
          <stop offset="0.55" stopColor="#F7EFE3" />
          <stop offset="1" stopColor="#E9DCCA" />
        </linearGradient>
        <linearGradient id={`${id}-ring`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={BRAND.blueLight} />
          <stop offset="0.5" stopColor={BRAND.blue} />
          <stop offset="1" stopColor={BRAND.blueEdge} />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="8" dy="14" stdDeviation="9" floodColor="#5A3A1C" floodOpacity="0.28" />
        </filter>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        {/* Extruded edge. */}
        {[6, 4.5, 3, 1.5].map((d, i) => (
          <path
            key={d}
            d={TAG_PATH}
            transform={`translate(${d * 0.7} ${d})`}
            fill={["#C9B496", "#D3BFA3", "#DDCBB2", "#E6D7C1"][i]}
          />
        ))}
        <path d={TAG_PATH} fill={`url(#${id}-face)`} />
        <path d={TAG_PATH} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2} transform="translate(-0.5 -0.5)" />
        {/* Punched hole. */}
        <circle cx={HOLE.x} cy={HOLE.y} r={HOLE.r} fill="#BFA98B" />
        <circle cx={HOLE.x + 1} cy={HOLE.y + 1.5} r={HOLE.r - 2} fill="#D8C6AC" />
        {/* Raised "Gs." lettering. */}
        <text
          x={W / 2 + 2}
          y={182}
          textAnchor="middle"
          fontFamily={FONT_FAMILY}
          fontWeight={900}
          fontSize={68}
          fill={BRAND.blueEdge}
        >
          {label}
        </text>
        <text
          x={W / 2}
          y={179}
          textAnchor="middle"
          fontFamily={FONT_FAMILY}
          fontWeight={900}
          fontSize={68}
          fill={BRAND.blue}
          letterSpacing={-1}
        >
          {label}
        </text>
      </g>
      {/* Navy ring threaded through the hole. */}
      <ellipse
        cx={HOLE.x}
        cy={(TAG_PIVOT.y + HOLE.y + 2) / 2}
        rx={20}
        ry={(HOLE.y + 2 - TAG_PIVOT.y) / 2}
        fill="none"
        stroke={`url(#${id}-ring)`}
        strokeWidth={9}
        style={{ filter: "drop-shadow(2px 4px 3px rgba(8,30,68,0.35))" }}
      />
      <ellipse
        cx={HOLE.x - 2}
        cy={(TAG_PIVOT.y + HOLE.y + 2) / 2 - 2}
        rx={17}
        ry={(HOLE.y + 2 - TAG_PIVOT.y) / 2 - 3}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={2}
        strokeDasharray="30 200"
        strokeDashoffset={-150}
      />
    </svg>
  );
};
