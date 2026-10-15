#!/usr/bin/env python3
"""English one-sheet for The Burial / 장송 (A4 portrait)."""
from __future__ import annotations

from io import BytesIO
from pathlib import Path

from PIL import Image as PILImage
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Frame, Paragraph

ROOT = Path("/Users/sujinlenapark/Desktop/lena-agency-next")
OUT = ROOT / "public/catalog/jangsong-en.pdf"

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("Georgia", str(FONT_DIR / "Georgia.ttf")))
pdfmetrics.registerFont(TTFont("Georgia-Bold", str(FONT_DIR / "Georgia Bold.ttf")))
pdfmetrics.registerFont(TTFont("Georgia-Italic", str(FONT_DIR / "Georgia Italic.ttf")))
pdfmetrics.registerFont(TTFont("Arial", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_DIR / "Arial Bold.ttf")))
pdfmetrics.registerFont(
    TTFont("Georgia-BoldItalic", str(FONT_DIR / "Georgia Bold Italic.ttf"))
)
pdfmetrics.registerFont(TTFont("ArialUnicode", str(FONT_DIR / "Arial Unicode.ttf")))
pdfmetrics.registerFontFamily(
    "Georgia",
    normal="Georgia",
    bold="Georgia-Bold",
    italic="Georgia-Italic",
    boldItalic="Georgia-BoldItalic",
)

PAPER = HexColor("#FAF8F5")
INK = HexColor("#1F1C19")
MUTED = HexColor("#8A837C")
CORAL = HexColor("#C41E3A")
CORAL_DARK = HexColor("#9B1830")
LINE = HexColor("#E8E2DA")
WHITE = HexColor("#FFFFFF")
PILL_BG = HexColor("#FCECEE")
EMAIL = "lena.lenaagency@gmail.com"


def fit_rgb(im: PILImage.Image, max_w: int) -> PILImage.Image:
    im = im.convert("RGB")
    w, h = im.size
    if w <= max_w:
        return im
    nh = int(round(h * max_w / w))
    return im.resize((max_w, nh), PILImage.Resampling.LANCZOS)


def jpeg_reader(im: PILImage.Image, quality: int = 88) -> ImageReader:
    buf = BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True)
    buf.seek(0)
    return ImageReader(buf)


def wrap_para(text: str, style: ParagraphStyle, width: float) -> tuple[Paragraph, float]:
    p = Paragraph(text, style)
    _, h = p.wrap(width, 4000)
    return p, h


def draw_para(c, para: Paragraph, x: float, y_top: float, width: float, height: float) -> None:
    frame = Frame(
        x,
        y_top - height,
        width,
        height,
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
        showBoundary=0,
    )
    frame.addFromList([para], c)


def round_rect(c, x, y, w, h, r, fill=None, stroke=None, sw=0.4):
    c.saveState()
    if fill:
        c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(sw)
    p = c.beginPath()
    p.roundRect(x, y, w, h, r)
    c.drawPath(p, fill=1 if fill else 0, stroke=1 if stroke else 0)
    c.restoreState()


def draw_pill(c, text: str, right_x: float, y: float) -> float:
    """Draw a category pill; right edge at right_x. Returns left x."""
    c.setFont("Arial-Bold", 7.5)
    tw = c.stringWidth(text, "Arial-Bold", 7.5)
    ph, pw = 14, tw + 14
    px = right_x - pw
    round_rect(c, px, y, pw, ph, 2, fill=PILL_BG)
    c.setFillColor(CORAL_DARK)
    c.drawString(px + 7, y + 4, text)
    return px


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    page_w, page_h = A4
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("The Burial (장송) — LENA Agency")
    c.setAuthor("LENA Agency")
    c.setSubject("Action Adventure · Mystery · English title sheet")
    c.setCreator("LENA Agency")

    c.setFillColor(PAPER)
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
    c.setFillColor(CORAL)
    c.rect(0, page_h - 5, page_w, 5, fill=1, stroke=0)

    mx = 36
    inner_w = page_w - mx * 2
    y = page_h - 22

    mark = ROOT / "public/brand/logo-mark-coral-64.png"
    mark_h = 16
    c.drawImage(
        str(mark),
        mx,
        y - mark_h,
        width=mark_h,
        height=mark_h,
        mask="auto",
        preserveAspectRatio=True,
    )
    c.setFillColor(INK)
    c.setFont("Georgia", 11)
    c.drawString(mx + mark_h + 7, y - 12, "LENA Agency")
    c.setFillColor(MUTED)
    c.setFont("Arial", 7)
    c.drawString(mx + mark_h + 7 + 78, y - 11, "LITERARY RIGHTS")

    pill_y = y - 15
    left_pill = draw_pill(c, "MYSTERY", page_w - mx, pill_y)
    draw_pill(c, "ACTION ADVENTURE", left_pill - 6, pill_y)

    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    y = y - 26
    c.line(mx, y, page_w - mx, y)
    y -= 24

    title = "The Burial"
    c.setFillColor(INK)
    c.setFont("Georgia-Bold", 26)
    c.drawString(mx, y - 4, title)
    y -= 26

    c.setFillColor(MUTED)
    c.setFont("ArialUnicode", 10)
    c.drawString(mx, y, "장송")
    y -= 17

    c.setFillColor(INK)
    c.setFont("Georgia", 10.5)
    c.drawString(mx, y, "Written by Hwarin Jeon")
    y -= 14
    c.setFillColor(MUTED)
    c.setFont("Arial", 8.5)
    c.drawString(mx, y, "Sunest  ·  Korea")
    y -= 13
    c.setFont("Arial", 8)
    c.drawString(mx, y, "224 pages   ·   October 2026")
    y -= 18

    star = "<font name='ArialUnicode' size='11'>★</font>"
    award = (
        f"<b>{star}  Korea Story Contest Excellence Prize, "
        f"2026 Busan Story Market Korean IP  {star}</b>"
    )
    award_style = ParagraphStyle(
        "award",
        fontName="Georgia-Bold",
        fontSize=10,
        leading=14,
        textColor=CORAL,
        alignment=TA_LEFT,
    )
    award_para, award_h = wrap_para(award, award_style, inner_w - 24)
    box_h = award_h + 16
    box_y = y - box_h
    round_rect(c, mx, box_y, inner_w, box_h, 2, fill=PILL_BG)
    c.setFillColor(CORAL)
    c.rect(mx, box_y, 3, box_h, fill=1, stroke=0)
    draw_para(c, award_para, mx + 12, y - 8, inner_w - 24, award_h)
    y = box_y - 14

    cover_copy = (
        "The emperor is dead. The living are sealed in his tomb  ·  "
        "A missing imperial seal, and a race to get out alive"
    )
    copy_style = ParagraphStyle(
        "copy",
        fontName="Georgia-Italic",
        fontSize=11,
        leading=15,
        textColor=CORAL_DARK,
    )
    copy_para, copy_h = wrap_para(cover_copy, copy_style, inner_w)
    draw_para(c, copy_para, mx, y, inner_w, copy_h)
    y -= copy_h + 16

    footer_h = 26
    bio_gap = 16
    cover_path = ROOT / "public/covers/jangsong.jpg"
    cover_im = fit_rgb(PILImage.open(cover_path), 1000)
    cw = 228
    ch = cw * cover_im.size[1] / cover_im.size[0]

    bio_style = ParagraphStyle(
        "bio",
        fontName="Georgia",
        fontSize=8.2,
        leading=11.4,
        textColor=INK,
    )
    bio = (
        "<b>Hwarin Jeon</b>  ·  Author"
        "<br/>"
        "Hwarin Jeon plans and writes stories for film, television, and fiction. "
        "She won the Dong-A Ilbo New Year’s Literary Contest in the screenplay "
        "category, an Excellence Prize at the Korea Story Contest, an Excellence "
        "Prize in the KBS miniseries script contest for career writers, and an "
        "Excellence Prize in the story category of the Korea Content Awards."
    )
    bio_para, bio_h = wrap_para(bio, bio_style, inner_w)
    bio_band = bio_h + 10
    min_cover_y = footer_h + 12 + bio_band + bio_gap
    cover_y = y - ch
    if cover_y < min_cover_y:
        ch = y - min_cover_y
        cw = ch * cover_im.size[0] / cover_im.size[1]
        cover_y = min_cover_y

    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.setFillColor(WHITE)
    c.rect(mx, cover_y, cw, ch, fill=1, stroke=1)
    c.drawImage(
        jpeg_reader(cover_im),
        mx,
        cover_y,
        width=cw,
        height=ch,
        preserveAspectRatio=True,
        anchor="c",
        mask="auto",
    )

    syn_x = mx + cw + 18
    syn_w = page_w - mx - syn_x
    syn_style = ParagraphStyle(
        "syn",
        fontName="Georgia",
        fontSize=9.6,
        leading=13.8,
        textColor=INK,
        alignment=TA_LEFT,
    )
    synopsis = (
        "When the emperor dies, palace women, eunuchs, soldiers, craftsmen, "
        "and scholars are sealed alive in his tomb—buried with him, as custom "
        "demands. The tomb is a maze. Traps and mechanisms decide who takes "
        "the next step."
        "<br/><br/>"
        "A missing imperial seal pulls the fight for the throne inside the grave. "
        "One person needs money to keep a family. One came for a grudge. One is "
        "tangled in a love affair. They were sentenced to the same death. They "
        "did not live the same lives, and they will not survive for the same "
        "reasons. Alliances flip. Betrayal follows help."
        "<br/><br/>"
        "Outside, the succession war goes on. An action-adventure mystery that "
        "turns a historical rite into a race to get out alive. Can anyone leave "
        "a tomb that was built to keep them in?"
    )
    syn_para, syn_h = wrap_para(synopsis, syn_style, syn_w)
    syn_box = min(ch, syn_h + 2)
    draw_para(c, syn_para, syn_x, y, syn_w, syn_box)

    bio_top = cover_y - bio_gap
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(mx, bio_top + 8, page_w - mx, bio_top + 8)
    draw_para(c, bio_para, mx, bio_top, inner_w, bio_h)

    c.setFillColor(CORAL)
    c.rect(0, 0, page_w, footer_h, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Arial-Bold", 7)
    left = "ACTION ADVENTURE  ·  MYSTERY"
    c.drawString(mx, 9, left)
    c.setFont("Arial", 7.5)
    mid = EMAIL
    mw = c.stringWidth(mid, "Arial", 7.5)
    c.drawString((page_w - mw) / 2, 9, mid)
    right = "lenaagency.com"
    c.drawString(page_w - mx - c.stringWidth(right, "Arial", 7.5), 9, right)

    c.showPage()
    c.save()
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
