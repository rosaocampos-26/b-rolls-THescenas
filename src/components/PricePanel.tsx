import React from "react";
import { BRAND } from "../brand";

/** Physical edge thickness of the panel slab, in px. */
const EDGE = 12;

const slabEdge = (depth: number) =>
  Array.from({ length: depth }, (_, i) => {
    const k = i + 1;
    const shade = Math.round(222 - k * 3.2);
    return `${k * 0.55}px ${k}px 0 rgb(${shade + 8}, ${shade - 8}, ${shade - 30})`;
  }).join(", ");

/**
 * Floating cream comparison board: beveled slab with a recessed face,
 * ambient-occlusion contact shadow and a soft cast shadow on the wall.
 * Children are positioned in the panel's own px space (width × height).
 */
export const PricePanel: React.FC<{
  width: number;
  height: number;
  /** 0..1 — how far the cast shadow sits from the panel (float height). */
  lift?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, lift = 1, children, style }) => (
  <div style={{ position: "absolute", width, height, ...style }}>
    {/* Cast shadow on the wall. */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 40,
        transform: `translate(${14 + lift * 12}px, ${26 + lift * 22}px)`,
        background: "rgba(92, 60, 30, 0.20)",
        filter: `blur(${28 + lift * 12}px)`,
      }}
    />
    {/* Slab with extruded edge. */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 38,
        background: `linear-gradient(155deg, ${BRAND.creamLight} 0%, #F8F0E4 42%, #EFE3D3 78%, #E6D7C3 100%)`,
        boxShadow: [
          slabEdge(EDGE),
          `${EDGE * 0.55 + 2}px ${EDGE + 4}px 10px rgba(80, 50, 20, 0.28)`,
          "inset 3px 3px 0 rgba(255,255,255,0.95)",
          "inset -2px -3px 0 rgba(190,160,125,0.35)",
        ].join(", "),
      }}
    />
    {/* Recessed face with a fine bevel rim. */}
    <div
      style={{
        position: "absolute",
        inset: 14,
        borderRadius: 28,
        background: `linear-gradient(160deg, #FCF7EF 0%, ${BRAND.cream} 50%, #F0E5D6 100%)`,
        boxShadow: [
          "inset 2px 3px 6px rgba(150,115,80,0.22)",
          "inset -2px -2px 0 rgba(255,255,255,0.85)",
          "0 0 0 1px rgba(255,255,255,0.55)",
        ].join(", "),
      }}
    />
    {/* Specular sheen across the upper-left corner. */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 38,
        background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 32%)",
        pointerEvents: "none",
      }}
    />
    <div style={{ position: "absolute", inset: 0 }}>{children}</div>
  </div>
);
