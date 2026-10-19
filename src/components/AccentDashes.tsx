import React from "react";
import { BRAND } from "../brand";
import { EASE, tween } from "../lib/motion";

/**
 * The small navy "emphasis" strokes from the art direction. Each dash points
 * away from the origin at `angles` (deg, 0 = right, -90 = up) and draws
 * outward from `start`, staggered by 2 frames.
 */
export const AccentDashes: React.FC<{
  frame: number;
  start: number;
  angles: number[];
  radius?: number;
  length?: number;
  thickness?: number;
  style?: React.CSSProperties;
}> = ({ frame, start, angles, radius = 40, length = 34, thickness = 9, style }) => (
  <div style={{ position: "absolute", width: 0, height: 0, ...style }}>
    {angles.map((a, i) => {
      const s = start + i * 2;
      const grow = tween(frame, [s, s + 8], [0, 1], EASE.out);
      const push = tween(frame, [s, s + 10], [-10, 0], EASE.out);
      return (
        <div
          key={a}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: length,
            height: thickness,
            marginTop: -thickness / 2,
            borderRadius: thickness,
            background: `linear-gradient(180deg, ${BRAND.blueLight}, ${BRAND.blue})`,
            boxShadow: "1px 2px 2px rgba(8,30,68,0.3)",
            transformOrigin: "0 50%",
            transform: `rotate(${a}deg) translateX(${radius + push}px) scaleX(${grow})`,
            opacity: grow > 0 ? 1 : 0,
          }}
        />
      );
    })}
  </div>
);
