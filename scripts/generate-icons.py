"""Generate the app icons in public/ from assets/icon-source.webp.

Usage: python3 scripts/generate-icons.py   (requires Pillow: pip install pillow)

The source is a rounded square on a white margin (with a small drop shadow below).
We cut out the square and fill the white corners by extending the colour just inside
the rounded edge outwards, so the phone's own corner mask never shows white.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "icon-source.webp"
OUT = ROOT / "public"

# A true square inside the source's rounded tile (measured once): the tile is 1124 x 1100 px,
# so 12 px are trimmed on each side, and the bottom stops just above the drop shadow.
SQUARE = (78, 64, 1178, 1164)


def is_margin(pixel: tuple[int, int, int]) -> bool:
    return min(pixel) > 225


def corner_radius(img: Image.Image) -> int:
    """Estimates the corner radius from how far the top-left corner is inset along the diagonal."""
    for inset in range(img.width // 2):
        if not is_margin(img.getpixel((inset, inset))):
            return round(inset / (1 - 2 ** -0.5))
    return 0


def full_square() -> Image.Image:
    img = Image.open(SOURCE).convert("RGB").crop(SQUARE)
    source = img.copy()
    w, h = img.size
    r = corner_radius(img)
    px, src = img.load(), source.load()
    for y in range(h):
        for x in range(w):
            cx = r if x < r else w - 1 - r if x > w - 1 - r else None
            cy = r if y < r else h - 1 - r if y > h - 1 - r else None
            if cx is None or cy is None:
                continue
            dx, dy = x - cx, y - cy
            distance = (dx * dx + dy * dy) ** 0.5
            if distance <= r - 10:
                continue
            # Copy the pixel a little inside the edge, on the same line from the corner centre.
            scale = (r - 12) / distance
            px[x, y] = src[round(cx + dx * scale), round(cy + dy * scale)]
    return img.resize((1024, 1024), Image.LANCZOS)


def main() -> None:
    icon = full_square()
    outputs = {
        "apple-touch-icon.png": icon.resize((180, 180), Image.LANCZOS),
        "icon-192.png": icon.resize((192, 192), Image.LANCZOS),
        "icon-512.png": icon.resize((512, 512), Image.LANCZOS),
        # Full bleed: Android's mask crops the edges; the girl and numbers sit inside the safe zone.
        "icon-maskable-512.png": icon.resize((512, 512), Image.LANCZOS),
        "favicon-48.png": icon.resize((48, 48), Image.LANCZOS),
    }
    for name, image in outputs.items():
        image.save(OUT / name, optimize=True)
        print(f"wrote public/{name} {image.size[0]}x{image.size[1]}")


if __name__ == "__main__":
    main()
