"""Cut the child avatars out of assets/avatars-source.webp into public/avatars/.

Usage: python3 scripts/generate-avatars.py   (requires Pillow)

The source holds two rounded-square tiles on a white margin (chess on the left, clarinet
on the right). Each tile is cropped to a square and its corners are made transparent.
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "avatars-source.webp"
OUT = ROOT / "public" / "avatars"
SIZE = 256

# Square crop boxes of the tiles in the source (measured once).
TILES = {
    "simo.png": (53, 45, 847, 839),  # chess
    "aurora.png": (926, 45, 1720, 839),  # clarinet
}


def corner_radius(tile: Image.Image) -> int:
    """Estimates the corner radius from how far the top-left corner is inset along the diagonal."""
    for inset in range(tile.width // 2):
        if min(tile.getpixel((inset, inset))) <= 225:
            return round(inset / (1 - 2 ** -0.5))
    return 0


def main() -> None:
    source = Image.open(SOURCE).convert("RGB")
    OUT.mkdir(parents=True, exist_ok=True)
    for name, box in TILES.items():
        tile = source.crop(box)
        radius = corner_radius(tile)
        # Supersampled mask, pulled in by 3 px so no white fringe survives.
        scale = 4
        mask = Image.new("L", (tile.width * scale, tile.height * scale), 0)
        inset = 3 * scale
        ImageDraw.Draw(mask).rounded_rectangle(
            [inset, inset, mask.width - 1 - inset, mask.height - 1 - inset], radius=(radius - 3) * scale, fill=255
        )
        tile = tile.convert("RGBA")
        tile.putalpha(mask.resize(tile.size, Image.LANCZOS))
        tile.resize((SIZE, SIZE), Image.LANCZOS).save(OUT / name, optimize=True)
        print(f"wrote public/avatars/{name} (corner radius {radius}px in source)")


if __name__ == "__main__":
    main()
