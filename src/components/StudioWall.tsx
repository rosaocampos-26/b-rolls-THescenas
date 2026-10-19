import React from "react";
import { BRAND } from "../brand";

/**
 * Cream studio backdrop with soft window light — the out-of-focus set behind
 * the subject. Pure CSS so it stays clean at any push-in.
 */
export const StudioWall: React.FC<{ blur?: number }> = ({ blur = 22 }) => (
  <div style={{ position: "absolute", inset: -80, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(180deg, ${BRAND.cream} 0%, #F3E8DA 45%, #ECDECD 78%, #E6D6C3 100%)`,
      }}
    />
    {/* Key light falling from the upper left. */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(70% 45% at 28% 22%, rgba(255,252,246,0.95) 0%, rgba(255,250,242,0.45) 45%, rgba(255,250,242,0) 75%)",
      }}
    />
    {/* Soft window-frame shadows on the right, defocused like the reference. */}
    <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)` }}>
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 760 + i * 170,
            top: 980 + i * 120,
            width: 120,
            height: 900,
            transform: "rotate(-34deg)",
            transformOrigin: "top left",
            background: "rgba(150,112,80,0.10)",
            borderRadius: 40,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: -120,
          top: 1180,
          width: 260,
          height: 520,
          borderRadius: 120,
          background: "rgba(40,70,120,0.10)",
        }}
      />
    </div>
    {/* Warm falloff toward the edges. */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(120% 80% at 45% 40%, rgba(0,0,0,0) 55%, rgba(120,80,45,0.16) 100%)",
      }}
    />
  </div>
);
