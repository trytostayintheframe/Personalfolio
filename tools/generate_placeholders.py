"""Одноразовая генерация заглушек. Запуск: python tools/generate_placeholders.py"""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "img"
DOCS = ROOT / "docs"


def _font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    windir = os.environ.get("WINDIR", "C:\\Windows")
    candidates = [
        os.path.join(windir, "Fonts", "segoeui.ttf"),
        os.path.join(windir, "Fonts", "arial.ttf"),
        "segoeui.ttf",
        "arial.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def save_placeholder(name: str, size: tuple[int, int], bg: tuple[int, int, int]) -> None:
    im = Image.new("RGB", size, bg)
    draw = ImageDraw.Draw(im)
    font = _font(22)
    label = name.replace(".png", "")
    fill = (220, 220, 225) if sum(bg) < 200 else (90, 90, 100)
    draw.text((20, 20), label, fill=fill, font=font)
    draw.text((20, 52), "замените файл", fill=fill, font=font)
    out = IMG / name
    im.save(out, "PNG", optimize=True)
    print("wrote", out)


def main() -> None:
    IMG.mkdir(parents=True, exist_ok=True)
    DOCS.mkdir(parents=True, exist_ok=True)

    specs: list[tuple[str, tuple[int, int], tuple[int, int, int]]] = [
        ("avatar.png", (464, 774), (238, 238, 242)),
        ("BackgroundBlue.png", (1440, 900), (218, 232, 248)),
        ("BackgroundPink.png", (1440, 900), (255, 226, 238)),
        ("case1.png", (360, 527), (242, 242, 246)),
        ("case2.png", (360, 527), (246, 242, 250)),
        ("Footer.png", (1440, 520), (22, 22, 28)),
        ("alfa guys.png", (480, 320), (248, 248, 250)),
        ("MTS.png", (480, 320), (248, 248, 250)),
        ("Renlife.png", (480, 320), (248, 248, 250)),
        ("VTB.png", (480, 320), (248, 248, 250)),
    ]
    for name, size, bg in specs:
        save_placeholder(name, size, bg)

    try:
        from fpdf import FPDF
    except ImportError:
        print("fpdf2 not installed, skip PDF")
        return

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", size=14)
    pdf.multi_cell(
        0,
        8,
        "Placeholder CV (docs/cv.pdf).\n"
        "Replace this file with your real resume before publishing.",
    )
    out_pdf = DOCS / "cv.pdf"
    pdf.output(str(out_pdf))
    print("wrote", out_pdf)


if __name__ == "__main__":
    main()
