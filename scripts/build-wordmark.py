"""Gera src/assets/wordmark.svg a partir dos contornos da Montserrat 600.

Uso: python3 scripts/build-wordmark.py
Requer: pip install fonttools brotli ; npm i @fontsource-variable/montserrat

O "A" da marca não tem travessa (Λ). Ele é desenhado como chevron com a
mesma espessura de haste da Montserrat SemiBold; as demais letras vêm da fonte.
Cores: prata e azul amostrados do logo master (PREV médio #4580DC, faixa
#6AA2F3 → #2A66C6; prata médio #CFD4DA).
"""
import json
import math
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2"

font = instancer.instantiateVariableFont(TTFont(FONT), {"wght": 600})
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
hmtx = font["hmtx"]

CAP_H = 700      # altura de caixa-alta da Montserrat (unidades da fonte)
TRACK = 60       # espaçamento extra entre letras
STEM = 118       # espessura da haste do Λ
LAMBDA_W = 740

x = 0
parts: list[tuple[str, str]] = []


def add_glyph(ch: str, tone: str) -> None:
    global x
    name = cmap[ord(ch)]
    pen = SVGPathPen(glyphs)
    glyphs[name].draw(pen)
    parts.append((tone, f'<path transform="translate({x} 0)" d="{pen.getCommands()}"/>'))
    x += hmtx[name][0] + TRACK


def add_lambda(tone: str) -> None:
    global x
    w, h = LAMBDA_W, CAP_H
    ang = math.atan2(h, w / 2)
    dx = STEM / math.sin(ang)
    inner_top = h - dx * math.tan(ang)
    d = (f"M0 0L{w/2:.1f} {h}L{w} 0L{w-dx:.1f} 0"
         f"L{w/2:.1f} {inner_top:.1f}L{dx:.1f} 0Z")
    parts.append((tone, f'<path transform="translate({x} 0)" d="{d}"/>'))
    x += w + TRACK


for ch in "AJUSTA":
    add_lambda("s") if ch == "A" else add_glyph(ch, "s")
for ch in "PREV":
    add_glyph(ch, "b")

total = x - TRACK
pad = 10
view_box = f"{-pad} {-pad} {total + 2 * pad} {CAP_H + 2 * pad}"
silver = "".join(p for t, p in parts if t == "s")
blue = "".join(p for t, p in parts if t == "b")

(ROOT / "src/assets/wordmark.json").write_text(
    json.dumps({"viewBox": view_box, "capH": CAP_H, "silver": silver, "blue": blue})
)
print(f"wordmark: {total}x{CAP_H} units")
