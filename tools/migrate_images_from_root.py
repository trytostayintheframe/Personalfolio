"""
Переносит картинки и PDF из корня проекта в img/ и docs/.
SVG в корне нет — существующие в img/ не трогает.
"""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "img"
DOCS = ROOT / "docs"


def main() -> None:
    IMG.mkdir(parents=True, exist_ok=True)
    DOCS.mkdir(parents=True, exist_ok=True)

    # Удалить только старые растры в img (SVG оставить)
    for p in IMG.glob("*.png"):
        p.unlink()
        print("removed old", p.name)

    # Точные соответствия имя в корне -> имя в img/
    exact: dict[str, str] = {
        "avatar.png": "avatar.png",
        "BackgroundBlue.png": "BackgroundBlue.png",
        "BackgroundPink.png": "BackgroundPink.png",
        "Footer.png": "Footer.png",
        "alfa guys.png": "alfa guys.png",
        "MTS.png": "MTS.png",
        "Renlife.png": "Renlife.png",
        "VTB.png": "VTB.png",
        "Case2.png": "case2.png",
    }

    moved: set[Path] = set()

    for src_name, dest_name in exact.items():
        src = ROOT / src_name
        if not src.is_file():
            print("skip missing:", src_name)
            continue
        dest = IMG / dest_name
        shutil.move(str(src), str(dest))
        moved.add(src.resolve())
        print("moved", src_name, "->", dest_name)

    # Кейс 1: часто сохраняют как «Сase1» с кириллической С
    for p in ROOT.iterdir():
        if not p.is_file() or p.suffix.lower() != ".png":
            continue
        if p.resolve() in moved:
            continue
        if p.name.endswith("ase1.png"):
            dest = IMG / "case1.png"
            shutil.move(str(p), str(dest))
            moved.add(p.resolve())
            print("moved", repr(p.name), "-> case1.png")
            break

    # PDF резюме из корня -> docs/cv.pdf
    for p in ROOT.iterdir():
        if p.is_file() and p.suffix.lower() == ".pdf":
            dest = DOCS / "cv.pdf"
            shutil.move(str(p), str(dest))
            print("moved", repr(p.name), "-> docs/cv.pdf")
            break

    print("done.")


if __name__ == "__main__":
    main()
