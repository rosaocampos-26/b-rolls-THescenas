import React from "react";
import { EASE, tween } from "../lib/motion";

/** Frames a coin takes to fall onto the stack; landing = start + COIN_FALL. */
export const COIN_FALL = 6;
const DROP_HEIGHT = 120;

/** Vertical offset (px, negative = above rest) and opacity of one dropping coin. */
export const coinDrop = (frame: number, start: number) => {
  const t = frame - start;
  if (t < 0) return { y: -DROP_HEIGHT, opacity: 0 };
  if (t <= COIN_FALL) {
    return {
      y: tween(frame, [start, start + COIN_FALL], [-DROP_HEIGHT, 0], EASE.fall),
      opacity: tween(frame, [start, start + 3], [0, 1]),
    };
  }
  // One tiny rebound (≤2.5px) then rest.
  const s = t - COIN_FALL;
  const settle = s < 6 ? -2.5 * Math.sin((Math.PI * s) / 6) * (1 - s / 6) : 0;
  return { y: settle, opacity: 1 };
};

/**
 * A stack of gold coins rendered as stacked cylinders. `starts` holds the
 * frame each coin begins falling, bottom coin first; its length is the count.
 * The element's origin is the centre of the stack's footprint.
 */
export const CoinStack: React.FC<{
  id: string;
  frame: number;
  starts: number[];
  width?: number;
  thickness?: number;
  style?: React.CSSProperties;
}> = ({ id, frame, starts, width = 118, thickness = 24, style }) => {
  const rx = width / 2;
  const ry = width * 0.2;
  const height = starts.length * thickness + ry * 2 + DROP_HEIGHT + 20;
  const landed = starts.filter((s) => frame >= s + COIN_FALL).length;
  return (
    <svg
      width={width + 40}
      height={height}
      viewBox={`${-rx - 20} ${-height + ry + 10} ${width + 40} ${height}`}
      style={{ position: "absolute", marginLeft: -rx - 20, marginTop: -height + ry + 10, overflow: "visible", ...style }}
    >
      <defs>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7A4C0E" />
          <stop offset="0.18" stopColor="#C88F27" />
          <stop offset="0.42" stopColor="#FFE18C" />
          <stop offset="0.6" stopColor="#E7B142" />
          <stop offset="0.86" stopColor="#B07818" />
          <stop offset="1" stopColor="#6E430B" />
        </linearGradient>
        <radialGradient id={`${id}-top`} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor="#FFF1BF" />
          <stop offset="0.45" stopColor="#F6CC5C" />
          <stop offset="1" stopColor="#C38A22" />
        </radialGradient>
        <pattern id={`${id}-ridges`} width="4" height="10" patternUnits="userSpaceOnUse">
          <rect width="1.6" height="10" fill="rgba(90,55,10,0.28)" />
        </pattern>
        <filter id={`${id}-ao`} x="-50%" y="-200%" width="200%" height="500%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      {/* Ambient-occlusion contact shadow grows as coins land. */}
      <ellipse
        cx={6}
        cy={ry * 0.4}
        rx={rx * 1.05}
        ry={ry * 0.9}
        fill="rgba(80,50,15,0.38)"
        filter={`url(#${id}-ao)`}
        opacity={Math.min(1, landed / 2)}
      />
      {starts.map((start, i) => {
        const { y, opacity } = coinDrop(frame, start);
        const top = -i * thickness - thickness + y;
        const bottom = top + thickness;
        const side = `M ${-rx},${top} L ${-rx},${bottom} A ${rx},${ry} 0 0 0 ${rx},${bottom} L ${rx},${top} Z`;
        return (
          <g key={i} opacity={opacity}>
            <path d={side} fill={`url(#${id}-side)`} />
            <path d={side} fill={`url(#${id}-ridges)`} />
            <path
              d={`M ${-rx},${bottom - 1} A ${rx},${ry} 0 0 0 ${rx},${bottom - 1}`}
              fill="none"
              stroke="rgba(70,40,5,0.45)"
              strokeWidth={1.5}
            />
            <ellipse cx={0} cy={top} rx={rx} ry={ry} fill={`url(#${id}-top)`} />
            <ellipse cx={0} cy={top} rx={rx * 0.8} ry={ry * 0.8} fill="none" stroke="rgba(150,95,20,0.55)" strokeWidth={2.5} />
            <ellipse cx={-1} cy={top - 1} rx={rx * 0.8} ry={ry * 0.8} fill="none" stroke="rgba(255,245,200,0.5)" strokeWidth={1} />
            <ellipse cx={0} cy={top} rx={rx} ry={ry} fill="none" stroke="rgba(255,236,170,0.6)" strokeWidth={1.2} />
          </g>
        );
      })}
    </svg>
  );
};
