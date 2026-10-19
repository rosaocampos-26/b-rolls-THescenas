import { Easing, interpolate, spring } from "remotion";

/** House easing curves (cubic-bezier) used across Trato Hecho scenes. */
export const EASE = {
  /** Cinematic camera move: gentle start, long soft landing. */
  camera: Easing.bezier(0.33, 0, 0.2, 1),
  /** Slow push that starts and ends at rest. */
  inOut: Easing.bezier(0.45, 0, 0.25, 1),
  /** Confident arrival. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Gravity-like acceleration for drops. */
  fall: Easing.bezier(0.55, 0, 0.9, 0.45),
};

/** interpolate() with clamping on both sides — the default for timeline tweens. */
export const tween = (
  frame: number,
  input: [number, number],
  output: [number, number],
  easing: (t: number) => number = EASE.out
) =>
  interpolate(frame, input, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/**
 * Spring progress that starts at `from`. Controlled settings: a single
 * tasteful overshoot (<6%), no repeated bouncing.
 */
export const softSpring = (
  frame: number,
  from: number,
  fps: number,
  config: { damping?: number; stiffness?: number; mass?: number } = {}
) =>
  spring({
    frame: frame - from,
    fps,
    config: { damping: 15, stiffness: 120, mass: 1, ...config },
  });

/** A damped pendulum swing (degrees) for hanging tags. */
export const damped = (frame: number, from: number, amplitude: number, periodFrames: number, decayFrames: number) => {
  const t = frame - from;
  if (t < 0) return amplitude;
  return amplitude * Math.cos((2 * Math.PI * t) / periodFrames) * Math.exp(-t / decayFrames);
};

/** Slow, smooth idle float. `amp` is in px; phase decorrelates objects. */
export const float = (frame: number, fps: number, amp: number, phase = 0, hz = 0.32) =>
  Math.sin((frame / fps) * 2 * Math.PI * hz + phase) * amp;
