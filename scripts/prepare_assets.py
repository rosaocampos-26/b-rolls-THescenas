"""Build the photographic layers for the Expected-vs-Market scene.

The reference image is art direction only: its panels, coins and the ≠ sign are
rebuilt as editable React components. From the photo we keep just two plates:

  public/assets/woman.png  - the woman isolated with rembg (isnet-general-use)
  public/assets/table.png  - the clean table strip below her arms

Usage (needs: pip install "rembg[cpu]" pillow numpy scipy):
  python3 scripts/prepare_assets.py reference/g-g26-expected-vs-market.webp
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

TABLE_TOP = 1474  # first source row of the table surface (chair sits above it at far left)
FEATHER = 3       # soft top edge of the table plate, in source px


def cut_woman(src: Image.Image) -> Image.Image:
    from rembg import new_session, remove

    cut = np.array(remove(src, session=new_session("isnet-general-use"))).astype(np.float32)
    alpha = cut[:, :, 3]
    # Keep only the largest blob (the woman); drops stray fragments of the chair.
    labels, n = ndimage.label(alpha > 8)
    sizes = ndimage.sum(np.ones_like(alpha), labels, range(1, n + 1))
    keep = ndimage.binary_dilation(labels == (np.argmax(sizes) + 1), iterations=2)
    cut[:, :, 3] = alpha * keep
    return Image.fromarray(cut.astype(np.uint8), "RGBA")


def table_plate(src: Image.Image) -> Image.Image:
    rgb = np.array(src).astype(np.float32)
    plate = rgb[TABLE_TOP:].copy()
    alpha = np.full(plate.shape[:2], 255.0)
    ramp = np.clip(np.arange(plate.shape[0]) / FEATHER, 0, 1)[:, None]
    alpha *= ramp
    out = np.dstack([plate, alpha]).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def main() -> None:
    src_path = Path(sys.argv[1] if len(sys.argv) > 1 else "reference/g-g26-expected-vs-market.webp")
    out_dir = Path("public/assets")
    out_dir.mkdir(parents=True, exist_ok=True)
    src = Image.open(src_path).convert("RGB")
    print("source", src.size)
    cut_woman(src).save(out_dir / "woman.png", optimize=True)
    table_plate(src).save(out_dir / "table.png", optimize=True)
    print("wrote", out_dir / "woman.png", out_dir / "table.png")


if __name__ == "__main__":
    main()
