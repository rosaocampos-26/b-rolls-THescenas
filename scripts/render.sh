#!/usr/bin/env bash
# Render the final 1080×1920 / 30 fps / 7 s MP4 (H.264 + AAC, SFX only).
set -euo pipefail
cd "$(dirname "$0")/.."
BROWSER_ARGS=()
[ -n "${REMOTION_BROWSER:-}" ] && BROWSER_ARGS=(--browser-executable="$REMOTION_BROWSER")
mkdir -p out
npx remotion render src/index.ts ExpectedVsMarket out/TH_G-G26_precio-esperado-vs-mercado.mp4 \
  --codec=h264 --crf=14 --audio-codec=aac --audio-bitrate=256k "${BROWSER_ARGS[@]}"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration \
  -of compact out/TH_G-G26_precio-esperado-vs-mercado.mp4
