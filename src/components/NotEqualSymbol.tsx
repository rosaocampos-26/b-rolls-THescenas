import React from "react";
import { BRAND } from "../brand";

/** ≠ geometry in a 260×280 box centred on (0,0). */
const BAR_W = 236;
const BAR_H = 50;
const GAP = 38;
const SLASH = { w: 54, h: 290, angle: 24 };

const Shape: React.FC<{ fill: string }> = ({ fill }) => (
  <>
    <rect x={-BAR_W / 2} y={-GAP - BAR_H / 2 - 4} width={BAR_W} height={BAR_H} rx={13} fill={fill} />
    <rect x={-BAR_W / 2} y={GAP - BAR_H / 2 + 4} width={BAR_W} height={BAR_H} rx={13} fill={fill} />
    <rect
      x={-SLASH.w / 2}
      y={-SLASH.h / 2}
      width={SLASH.w}
      height={SLASH.h}
      rx={13}
      fill={fill}
      transform={`rotate(${SLASH.angle})`}
    />
  </>
);

/**
 * Extruded navy ≠ sign. The element's origin is the sign's centre; animate it
 * with `scale`, `rotate` and `opacity`.
 */
export const NotEqualSymbol: React.FC<{
  id: string;
  size?: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ id, size = 300, scale = 1, rotate = 0, opacity = 1, style }) => {
  const depth = 16;
  const box = 360;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`}
      style={{
        position: "absolute",
        marginLeft: -size / 2,
        marginTop: -size / 2,
        overflow: "visible",
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity,
        ...style,
      }}
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="0" y1="-150" x2="0" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3468B8" />
          <stop offset="0.35" stopColor={BRAND.blueLight} />
          <stop offset="0.7" stopColor={BRAND.blue} />
          <stop offset="1" stopColor={BRAND.blueDeep} />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="14" dy="24" stdDeviation="14" floodColor="#2A1A0A" floodOpacity="0.30" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <Shape fill="#000" />
        </clipPath>
      </defs>
      <g filter={`url(#${id}-shadow)`}>
        {/* Extrusion: stacked offset copies, darkest at the back. */}
        {Array.from({ length: depth }, (_, i) => depth - i).map((k) => (
          <g key={k} transform={`translate(${k * 0.55} ${k * 0.9})`}>
            <Shape fill={k > depth * 0.6 ? BRAND.blueEdge : "#0A2552"} />
          </g>
        ))}
        <Shape fill={`url(#${id}-face)`} />
        {/* Bevel: a light rim on the upper-left edges, a shaded rim lower-right. */}
        <g clipPath={`url(#${id}-clip)`}>
          <rect x={-200} y={-200} width={400} height={400} fill="rgba(160,195,245,0.75)" />
          <g transform="translate(2.5 3.5)">
            <Shape fill="#0B2958" />
          </g>
          <g transform="translate(1.2 1.6)">
            <Shape fill={`url(#${id}-face)`} />
          </g>
          {/* Soft top sheen. */}
          <rect x={-200} y={-200} width={400} height={160} fill="rgba(255,255,255,0.08)" />
        </g>
      </g>
    </svg>
  );
};
