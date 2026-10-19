import { COIN_FALL } from "../../components/CoinStack";
import type { Cue } from "../../components/SfxCue";

/**
 * G-G26 "Precio esperado ≠ precio de mercado" — frame timeline at 30 fps.
 * Every visual beat and its sound effect read from these constants, so
 * retiming a beat here keeps picture and audio in sync.
 */
export const FPS = 30;
export const DURATION = 7 * FPS; // 210

export const T = {
  /** 0.0–0.7s cinematic push-in. */
  pushInEnd: 21,
  /** 0.7–1.9s left panel. */
  leftPanelIn: 21,
  leftTagDrop: 42,
  leftTagLock: 49, // tag reaches its hook: the click
  /** 1.9–3.1s right panel. */
  rightPanelIn: 57,
  rightTagDrop: 76,
  rightTagLock: 83,
  /** 3.1–4.2s coins (start frames, bottom coin first). */
  coinsLeftA: [95, 100, 104],
  coinsLeftB: [93, 97, 102, 106, 108, 110],
  coinsRight: [98, 105, 112],
  /** 4.2–5.2s ≠ realization. */
  neqIn: 126,
  neqImpact: 131,
  neqDashes: 132,
  neqSettled: 144,
  /** 5.2–7.0s hold, float, final push. */
  holdStart: 156,
} as const;

/** Composition-space layout (1080×1920). */
export const LAYOUT = {
  panel: { width: 350, height: 640 },
  leftPanel: { x: 46, y: 300 },
  rightPanel: { x: 684, y: 300 },
  plaque: { x: 22, y: 26, width: 306, height: 150, fontSize: 40 },
  // Ring pivots sit just under the plaque's lower edge so the plaque hides the ring top.
  leftTagPivot: { x: 168, y: 164 },
  rightTagPivot: { x: 182, y: 164 },
  leftTagDashes: { x: 268, y: 236 },
  rightTagDashes: { x: 82, y: 236 },
  leftStackA: { x: 84, y: 596 },
  leftStackB: { x: 210, y: 588 },
  rightStack: { x: 268, y: 596 },
  neq: { x: 540, y: 436, size: 340 },
  cameraFocus: { x: 540, y: 800 },
} as const;

const landings = (starts: readonly number[]) => starts.map((s) => s + COIN_FALL);

const coinCues = (): Cue[] => {
  const left = [...T.coinsLeftA, ...T.coinsLeftB].sort((a, b) => a - b);
  return [
    ...landings(left).map((at, i) => ({
      sfx: `coin_left_${i % 4}`,
      at,
      volume: 0.75,
      syncs: `left coin ${i + 1} lands`,
    })),
    ...landings(T.coinsRight).map((at, i) => ({
      sfx: `coin_right_${i % 2}`,
      at,
      volume: 0.8,
      syncs: `right coin ${i + 1} lands`,
    })),
  ];
};

/** Sound design: effects only — no music, no voice. */
export const CUES: Cue[] = [
  { sfx: "camera_air", at: 0, volume: 0.8, syncs: "opening camera push-in" },
  { sfx: "whoosh_left", at: T.leftPanelIn - 3, syncs: "left panel enters" },
  { sfx: "click_tag", at: T.leftTagLock, syncs: "left Gs. tag locks on its ring" },
  { sfx: "whoosh_right", at: T.rightPanelIn - 2, syncs: "right panel enters and rotates" },
  { sfx: "tick_tag_soft", at: T.rightTagLock, syncs: "right Gs. tag settles" },
  ...coinCues(),
  { sfx: "impact", at: T.neqImpact - 1, syncs: "≠ symbol hits full scale" },
  { sfx: "shimmer", at: T.neqDashes + 1, volume: 0.8, syncs: "accent dashes around ≠" },
];
