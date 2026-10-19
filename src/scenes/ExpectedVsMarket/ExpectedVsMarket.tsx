import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { AccentDashes } from "../../components/AccentDashes";
import { CameraRig, CameraState, DepthLayer } from "../../components/CameraRig";
import { CoinStack } from "../../components/CoinStack";
import { LabelPlaque } from "../../components/LabelPlaque";
import { NotEqualSymbol } from "../../components/NotEqualSymbol";
import { PhotoSubject } from "../../components/PhotoSubject";
import { PricePanel } from "../../components/PricePanel";
import { PriceTag } from "../../components/PriceTag";
import { SfxTrack } from "../../components/SfxCue";
import { StudioWall } from "../../components/StudioWall";
import { EASE, damped, float, softSpring, tween } from "../../lib/motion";
import { CUES, DURATION, LAYOUT, T } from "./timeline";

const DEPTH = { wall: 0.35, panels: 0.6, neq: 0.66, subject: 1 };

const useCamera = (frame: number): CameraState => {
  const push =
    frame < T.pushInEnd
      ? tween(frame, [0, T.pushInEnd], [1, 1.035], EASE.camera)
      : frame < T.holdStart
        ? tween(frame, [T.pushInEnd, T.holdStart], [1.035, 1.045], (t) => t)
        : tween(frame, [T.holdStart, DURATION - 1], [1.045, 1.065], EASE.inOut);
  // A single, smooth "realization" breath when the ≠ lands — not a shake.
  const breath =
    tween(frame, [T.neqImpact - 2, T.neqImpact], [0, 1], EASE.out) *
    Math.exp(-Math.max(0, frame - T.neqImpact) / 7);
  return {
    zoom: push + breath * 0.008,
    x: tween(frame, [0, DURATION - 1], [10, -10], EASE.inOut),
    y: tween(frame, [0, DURATION - 1], [6, -4], EASE.inOut),
    focus: LAYOUT.cameraFocus,
  };
};

/** Idle-float envelope: calm while beats play, fuller in the hold, eased to rest at the end. */
const floatEnvelope = (frame: number) =>
  tween(frame, [T.holdStart - 6, T.holdStart + 14], [0.35, 1], EASE.inOut) *
  tween(frame, [DURATION - 24, DURATION - 1], [1, 0.4], EASE.inOut);

/** Motion-blur radius from horizontal speed (px/frame). */
const speedBlur = (pos: (f: number) => number, frame: number) =>
  Math.min(6, Math.abs(pos(frame) - pos(frame - 1)) * 0.07);

const tagMotion = (frame: number, drop: number, lock: number) => {
  // Falls onto the hook, locks with a 3px rebound, then a small damped swing.
  const y =
    frame < lock
      ? tween(frame, [drop, lock], [-46, 0], EASE.fall)
      : -3 * Math.sin(Math.min(1, (frame - lock) / 5) * Math.PI) * (1 - Math.min(1, (frame - lock) / 5));
  const swing = frame < lock ? -4 : damped(frame, lock, 4, 18, 9);
  const opacity = tween(frame, [drop, drop + 4], [0, 1]);
  return { y, swing, opacity };
};

export const ExpectedVsMarket: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const camera = useCamera(frame);
  const env = floatEnvelope(frame);
  const { panel } = LAYOUT;

  // Left panel: slides in from the left with one elegant overshoot.
  const leftX = (f: number) => (1 - softSpring(f, T.leftPanelIn, fps)) * -(LAYOUT.leftPanel.x + panel.width + 60);
  const leftP = softSpring(frame, T.leftPanelIn, fps);
  const leftRotY = (1 - leftP) * 16;

  // Right panel: enters from the right, its 3D turn resolving to front-facing.
  const rightCfg = { damping: 18, stiffness: 105, mass: 1 };
  const rightX = (f: number) =>
    (1 - softSpring(f, T.rightPanelIn, fps, rightCfg)) * (1080 - LAYOUT.rightPanel.x + 60);
  const rightP = softSpring(frame, T.rightPanelIn, fps, rightCfg);
  const rightRotY = (1 - rightP) * -42;
  const rightRotZ = (1 - rightP) * 4;

  const leftTag = tagMotion(frame, T.leftTagDrop, T.leftTagLock);
  const rightTag = tagMotion(frame, T.rightTagDrop, T.rightTagLock);

  // ≠: scales in past full size, then a short refined settle.
  const neqScale =
    frame < T.neqImpact
      ? tween(frame, [T.neqIn, T.neqImpact], [0.2, 1.1], EASE.out)
      : tween(frame, [T.neqImpact, T.neqSettled], [1.1, 1], EASE.inOut);
  const neqRotate = tween(frame, [T.neqIn, T.neqSettled], [-10, 0], EASE.out);
  const neqOpacity = tween(frame, [T.neqIn, T.neqIn + 3], [0, 1]);
  const ring = tween(frame, [T.neqImpact, T.neqImpact + 16], [0, 1], EASE.out);

  const panelStyle = (x: number, y: number, rotY: number, rotZ: number, blur: number, floatY: number) =>
    ({
      left: x,
      top: y + floatY,
      transform: `perspective(1600px) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
      transformOrigin: "50% 50%",
      filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
    }) as React.CSSProperties;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F3E8DA", overflow: "hidden" }}>
      <CameraRig camera={camera}>
        <DepthLayer depth={DEPTH.wall}>
          <StudioWall />
        </DepthLayer>

        <DepthLayer depth={DEPTH.panels}>
          {frame >= T.leftPanelIn && (
            <PricePanel
              width={panel.width}
              height={panel.height}
              lift={0.6 + 0.4 * env}
              style={panelStyle(
                LAYOUT.leftPanel.x + leftX(frame),
                LAYOUT.leftPanel.y,
                leftRotY,
                0,
                speedBlur(leftX, frame),
                float(frame, fps, 6 * env, 0)
              )}
            >
              <div style={{ position: "absolute", left: LAYOUT.leftTagPivot.x, top: LAYOUT.leftTagPivot.y + leftTag.y }}>
                <PriceTag id="tag-left" swing={leftTag.swing} opacity={leftTag.opacity} />
              </div>
              <LabelPlaque lines={["PRECIO", "ESPERADO"]} {...LAYOUT.plaque} style={{ left: LAYOUT.plaque.x, top: LAYOUT.plaque.y }} />
              <AccentDashes
                frame={frame}
                start={T.leftTagLock}
                angles={[-62, -30, 2]}
                radius={14}
                length={30}
                thickness={8}
                style={{ left: LAYOUT.leftTagDashes.x, top: LAYOUT.leftTagDashes.y }}
              />
              <div style={{ position: "absolute", left: LAYOUT.leftStackB.x, top: LAYOUT.leftStackB.y }}>
                <CoinStack id="coins-lb" frame={frame} starts={[...T.coinsLeftB]} />
              </div>
              <div style={{ position: "absolute", left: LAYOUT.leftStackA.x, top: LAYOUT.leftStackA.y }}>
                <CoinStack id="coins-la" frame={frame} starts={[...T.coinsLeftA]} />
              </div>
            </PricePanel>
          )}

          {frame >= T.rightPanelIn && (
            <PricePanel
              width={panel.width}
              height={panel.height}
              lift={0.6 + 0.4 * env}
              style={panelStyle(
                LAYOUT.rightPanel.x + rightX(frame),
                LAYOUT.rightPanel.y,
                rightRotY,
                rightRotZ,
                speedBlur(rightX, frame),
                float(frame, fps, 6 * env, 2.1)
              )}
            >
              <div style={{ position: "absolute", left: LAYOUT.rightTagPivot.x, top: LAYOUT.rightTagPivot.y + rightTag.y }}>
                <PriceTag id="tag-right" swing={rightTag.swing} opacity={rightTag.opacity} />
              </div>
              <LabelPlaque lines={["PRECIO", "DE MERCADO"]} {...LAYOUT.plaque} style={{ left: LAYOUT.plaque.x, top: LAYOUT.plaque.y }} />
              <AccentDashes
                frame={frame}
                start={T.rightTagLock}
                angles={[-118, -150, 178]}
                radius={14}
                length={30}
                thickness={8}
                style={{ left: LAYOUT.rightTagDashes.x, top: LAYOUT.rightTagDashes.y }}
              />
              <div style={{ position: "absolute", left: LAYOUT.rightStack.x, top: LAYOUT.rightStack.y }}>
                <CoinStack id="coins-r" frame={frame} starts={[...T.coinsRight]} />
              </div>
            </PricePanel>
          )}
        </DepthLayer>

        <DepthLayer depth={DEPTH.neq}>
          {frame >= T.neqIn && (
            <div
              style={{
                position: "absolute",
                left: LAYOUT.neq.x,
                top: LAYOUT.neq.y + float(frame, fps, 7 * env, 1.1),
              }}
            >
              {/* Shockwave ring on impact. */}
              <div
                style={{
                  position: "absolute",
                  width: 300,
                  height: 300,
                  marginLeft: -150,
                  marginTop: -150,
                  borderRadius: "50%",
                  border: "6px solid rgba(19,59,120,0.55)",
                  transform: `scale(${0.55 + ring * 0.75})`,
                  opacity: frame >= T.neqImpact ? (1 - ring) * 0.6 : 0,
                }}
              />
              <NotEqualSymbol
                id="neq"
                size={LAYOUT.neq.size}
                scale={neqScale}
                rotate={neqRotate}
                opacity={neqOpacity}
              />
              <AccentDashes frame={frame} start={T.neqDashes} angles={[-134, -112]} radius={172} length={46} thickness={11} />
              <AccentDashes frame={frame} start={T.neqDashes + 1} angles={[-68, -46]} radius={172} length={46} thickness={11} />
            </div>
          )}
        </DepthLayer>

        <DepthLayer depth={DEPTH.subject}>
          <PhotoSubject />
        </DepthLayer>
      </CameraRig>

      {/* Finishing grade: warm window light and a gentle vignette. */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(90% 60% at 22% 18%, rgba(255,240,215,0.16) 0%, rgba(255,240,215,0) 60%), radial-gradient(130% 95% at 50% 45%, rgba(0,0,0,0) 62%, rgba(70,40,15,0.18) 100%)",
          pointerEvents: "none",
        }}
      />

      <SfxTrack cues={CUES} />
    </AbsoluteFill>
  );
};
