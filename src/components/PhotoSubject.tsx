import React from "react";
import { Img, staticFile } from "remotion";

/** Source photo size (reference/g-g26-expected-vs-market.webp). */
const SRC = { width: 941, height: 1671, tableTop: 1474 };

/**
 * The photographic subject: isolated woman over the real table plate, both
 * pixel-aligned to the source. No warping or facial animation — motion comes
 * only from the camera rig around it. `overscan` keeps the sleeve edges that
 * exit the source frame outside the 1080px canvas during parallax.
 */
export const PhotoSubject: React.FC<{ width?: number; overscan?: number }> = ({ width = 1080, overscan = 1.035 }) => {
  const s = width / SRC.width;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height: SRC.height * s,
        transformOrigin: "50% 100%",
        transform: `scale(${overscan})`,
      }}
    >
      <Img
        src={staticFile("assets/table.png")}
        style={{ position: "absolute", left: 0, top: SRC.tableTop * s, width, height: (SRC.height - SRC.tableTop) * s }}
      />
      <Img
        src={staticFile("assets/woman.png")}
        style={{ position: "absolute", left: 0, top: 0, width, height: SRC.height * s }}
      />
    </div>
  );
};
