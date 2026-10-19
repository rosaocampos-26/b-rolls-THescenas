"""Tile rendered stills (fNNN.png) into a labeled contact sheet."""
import sys
from pathlib import Path

from PIL import Image, ImageDraw

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
files = sorted(src.glob("f[0-9][0-9][0-9].png"))
cols, tw = 5, 270
th = tw * 16 // 9
label_h = 34
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + label_h)), (24, 24, 28))
draw = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    frame = int(f.stem[1:])
    x, y = (i % cols) * tw, (i // cols) * (th + label_h)
    sheet.paste(Image.open(f).convert("RGB").resize((tw, th), Image.LANCZOS), (x, y + label_h))
    draw.text((x + 8, y + 9), f"frame {frame}  ·  {frame / 30:.2f}s", fill=(235, 235, 235))
sheet.save(dst, quality=90)
print("wrote", dst, f"({len(files)} frames)")
