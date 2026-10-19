import React from "react";
import { BRAND, FONT_FAMILY } from "../brand";

const EDGE = 8;

/** Navy 3D title plaque with beveled edge. Lines are rendered exactly as given. */
export const LabelPlaque: React.FC<{
  lines: string[];
  width: number;
  height: number;
  fontSize?: number;
  style?: React.CSSProperties;
}> = ({ lines, width, height, fontSize = 50, style }) => (
  <div
    style={{
      position: "absolute",
      width,
      height,
      borderRadius: 24,
      background: `linear-gradient(180deg, ${BRAND.blueLight} 0%, ${BRAND.blue} 46%, ${BRAND.blueDeep} 100%)`,
      boxShadow: [
        ...Array.from({ length: EDGE }, (_, i) => `${(i + 1) * 0.4}px ${i + 1}px 0 ${i < EDGE / 2 ? "#0B2652" : BRAND.blueEdge}`),
        `${EDGE * 0.4 + 2}px ${EDGE + 8}px 18px rgba(8, 30, 68, 0.35)`,
        "inset 0 3px 0 rgba(255,255,255,0.28)",
        "inset 0 -4px 10px rgba(0,0,0,0.25)",
        "inset 2px 0 0 rgba(255,255,255,0.08)",
      ].join(", "),
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {/* Glossy top highlight. */}
    <div
      style={{
        position: "absolute",
        left: 10,
        right: 10,
        top: 6,
        height: "42%",
        borderRadius: "18px 18px 40px 40px",
        background: "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))",
      }}
    />
    {lines.map((line) => (
      <div
        key={line}
        style={{
          position: "relative",
          fontFamily: FONT_FAMILY,
          fontWeight: 800,
          fontSize,
          lineHeight: 1.04,
          letterSpacing: "-0.01em",
          color: BRAND.white,
          whiteSpace: "nowrap",
          textShadow: "0 2px 0 rgba(4,18,45,0.55), 0 4px 8px rgba(0,0,0,0.25)",
        }}
      >
        {line}
      </div>
    ))}
  </div>
);
