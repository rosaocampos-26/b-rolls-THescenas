import React, { createContext, useContext } from "react";

export type CameraState = {
  /** 1 = no zoom. */
  zoom: number;
  /** Lateral dolly in px at depth 1. */
  x: number;
  /** Vertical dolly in px at depth 1. */
  y: number;
  /** Point the camera pushes toward, in composition px. */
  focus: { x: number; y: number };
};

const CameraContext = createContext<CameraState>({ zoom: 1, x: 0, y: 0, focus: { x: 540, y: 960 } });

export const CameraRig: React.FC<{ camera: CameraState; children: React.ReactNode }> = ({ camera, children }) => (
  <CameraContext.Provider value={camera}>{children}</CameraContext.Provider>
);

/**
 * A full-frame layer whose response to the camera scales with `depth`
 * (0 = infinitely far, 1 = subject plane). Different depths give parallax.
 */
export const DepthLayer: React.FC<{
  depth: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ depth, children, style }) => {
  const cam = useContext(CameraContext);
  const scale = 1 + (cam.zoom - 1) * depth;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${cam.focus.x}px ${cam.focus.y}px`,
        transform: `translate3d(${cam.x * depth}px, ${cam.y * depth}px, 0) scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
