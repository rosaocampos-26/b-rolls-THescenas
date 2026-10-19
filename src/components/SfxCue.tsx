import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

export type Cue = {
  /** File in public/sfx without extension. */
  sfx: string;
  /** Frame the sound starts. */
  at: number;
  volume?: number;
  /** The visible movement this sound belongs to — documentation for editors. */
  syncs: string;
};

/** Plays a list of frame-locked sound effects. */
export const SfxTrack: React.FC<{ cues: Cue[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <Sequence key={`${c.sfx}-${c.at}-${i}`} from={c.at} name={`sfx: ${c.syncs}`} layout="none">
        <Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={c.volume ?? 1} />
      </Sequence>
    ))}
  </>
);
