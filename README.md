# Trato Hecho — motion scenes (Remotion)

## G-G26 · Precio esperado ≠ precio de mercado

1080×1920 · 30 fps · 7 s (210 frames) · H.264 + AAC · SFX only (no music, no voice)

- Final video: `out/TH_G-G26_precio-esperado-vs-mercado.mp4`
- QA: `out/contact-sheet.jpg` (19 key beats), `out/final-frame.png`
- Art-direction reference: `reference/g-g26-expected-vs-market.webp`

### Commands

```bash
npm install
npm run studio          # live editor / scrubbing
npm run preview         # key-beat stills + out/contact-sheet.jpg
npm run render          # final MP4
npm run sfx             # regenerate the synthesized sound effects
```

In environments without Remotion's own Chrome download, point it at an existing
Chromium: `REMOTION_BROWSER=/path/to/headless_shell npm run render`.

### Structure

| Path | What it is |
| --- | --- |
| `src/scenes/ExpectedVsMarket/timeline.ts` | **Single source of truth**: beat frames, layout, SFX cue list. Retime here and picture + sound stay in sync. |
| `src/scenes/ExpectedVsMarket/ExpectedVsMarket.tsx` | Scene choreography (camera, entrances, float). |
| `src/components/PricePanel.tsx` | Cream 3D comparison board (bevel, AO, cast shadow). |
| `src/components/LabelPlaque.tsx` | Navy title plaque — text passed verbatim. |
| `src/components/PriceTag.tsx` | "Gs." tag on a navy ring, swings around its pivot. |
| `src/components/CoinStack.tsx` | Gold coin stack; one start frame per coin, lands at start + 6. |
| `src/components/NotEqualSymbol.tsx` | Extruded navy ≠. |
| `src/components/AccentDashes.tsx` | Emphasis strokes from the art direction. |
| `src/components/CameraRig.tsx` | Push-in / dolly with per-layer depth parallax. |
| `src/components/StudioWall.tsx`, `PhotoSubject.tsx` | Set and photographic subject layers. |
| `src/components/SfxCue.tsx` | Frame-locked sound effect track. |
| `src/brand.ts`, `src/lib/motion.ts` | Brand tokens (#133B78, #F8F0E5) and house easing. |

### Assets and rights

- **Woman layer**: isolated from the supplied reference with `rembg`
  (`isnet-general-use`, runs locally) via `scripts/prepare_assets.py`. The photo's
  baked-in panels/coins/≠ are discarded and rebuilt as components, so nothing
  is duplicated. Her face and body are never warped — only camera parallax.
- **Sound effects**: synthesized procedurally by `scripts/gen_sfx.py` (seeded
  noise + sine partials). No third-party samples, so no licensing constraints.
  Every cue in `timeline.ts` names the on-screen movement it belongs to.
