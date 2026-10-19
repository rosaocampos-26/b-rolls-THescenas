#!/usr/bin/env bash
# Render key-beat stills and assemble a labeled contact sheet for QA.
#   bash scripts/preview.sh [frames...]
set -euo pipefail
cd "$(dirname "$0")/.."
FRAMES=("$@")
[ ${#FRAMES[@]} -eq 0 ] && FRAMES=(0 12 21 28 36 46 52 62 72 86 100 110 120 128 131 140 156 180 209)
BROWSER_ARGS=()
[ -n "${REMOTION_BROWSER:-}" ] && BROWSER_ARGS=(--browser-executable="$REMOTION_BROWSER")
mkdir -p out/preview
for f in "${FRAMES[@]}"; do
  npx remotion still src/index.ts ExpectedVsMarket "out/preview/f$(printf %03d "$f").png" \
    --frame="$f" --log=error "${BROWSER_ARGS[@]}"
done
python3 scripts/contact_sheet.py out/preview out/contact-sheet.jpg
