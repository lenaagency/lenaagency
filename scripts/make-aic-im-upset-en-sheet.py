#!/usr/bin/env python3
"""English one-sheet for When I Say Ai-C, I'm Upset! (A4 portrait)."""
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
OUT = ROOT / "public/catalog/aic-im-upset-en.pdf"

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("Georgia", str(FONT_DIR / "Georgia.ttf")))
pdfmetrics.registerFont(TTFont("Georgia-Bold", str(FONT_DIR / "Georgia Bold.ttf")))
pdfmetrics.registerFont(TTFont("Georgia-Italic", str(FONT_DIR / "Georgia Italic.ttf")))
pdfmetrics.registerFont(TTFont("Arial", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_DIR / "Arial Bold.ttf")))
pdfmetrics.registerFont(
    TTFont("Georgia-BoldItalic", str(FONT_DIR / "Georgia Bold Italic.ttf"))
)
pdfmetrics.registerFont(
    TTFont("ArialUnicode", str(FONT_DIR / "Arial Unicode.ttf"))
)
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


def crop_letterbox(path: Path) -> PILImage.Image:
    """Undo the 2:3 website pad (yellow bars) so the jacket is true trim."""
    im = PILImage.open(path).convert("RGB")
    w, h = im.size
    if (w, h) == (500, 750):
        return im.crop((0, 65, 500, 684))
    return im


def fit_rgb(im: PILImage.Image, max_w: int) -> PILImage.Image:
    im = im.convert("RGB")
    w, h = im.size
    if w <= max_w:
        return im
    nh = int(round(h * max_w / w))
    return im.resize((max_w, nh), PILImage.Resampling.LANCZOS)


def jpeg_reader(im: PILImage.Image, quality: int = 84) -> ImageReader:
    buf = BytesIO()
    im.save(buf, "JPEG", quality=quality, optimize=True)
    buf.seek(0)
    return ImageReader(buf)


def draw_paragraph(c, text, style, x, y_top, width, height) -> float:
    """Draw wrapped text. Returns unused height at the bottom of the box."""
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
    story = [Paragraph(text, style)]
    frame.addFromList(story, c)
    return height if not story else 0


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


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    page_w, page_h = A4
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("When I Say Ai-C, I'm Upset! — LENA Agency")
    c.setAuthor("LENA Agency")
    c.setSubject("Picture Books · English title sheet")

    c.setFillColor(PAPER)
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
    c.setFillColor(CORAL)
    c.rect(0, page_h - 5, page_w, 5, fill=1, stroke=0)

    mx = 36
    inner_w = page_w - mx * 2
    y = page_h - 22

    # Header: mark + wordmark, category at right
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

    pill = "PICTURE BOOKS"
    c.setFont("Arial-Bold", 7.5)
    tw = c.stringWidth(pill, "Arial-Bold", 7.5)
    ph, pw = 14, tw + 14
    px = page_w - mx - pw
    py = y - 15
    round_rect(c, px, py, pw, ph, 2, fill=PILL_BG)
    c.setFillColor(CORAL_DARK)
    c.drawString(px + 7, py + 4, pill)

    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    y = y - 26
    c.line(mx, y, page_w - mx, y)
    y -= 22

    # Title block
    title = "When I Say Ai-C, I'm Upset!"
    c.setFillColor(INK)
    c.setFont("Georgia-Bold", 22)
    # wrap title if needed
    if c.stringWidth(title, "Georgia-Bold", 22) > inner_w:
        c.setFont("Georgia-Bold", 20)
    c.drawString(mx, y - 4, title)
    y -= 22

    c.setFillColor(MUTED)
    c.setFont("ArialUnicode", 9.5)
    c.drawString(mx, y, "아이C 하면 아이고, 속상해!")
    y -= 16

    c.setFillColor(INK)
    c.setFont("Georgia", 10)
    c.drawString(mx, y, "Written by Jihye Ko  ·  Illustrated by Woosung Oh")
    y -= 13
    c.setFillColor(MUTED)
    c.setFont("Arial", 8.5)
    c.drawString(mx, y, "Chunchum Books  ·  Korea  ·  Hardcover")
    y -= 18

    # Compact specs under the title block (small type)
    c.setFillColor(MUTED)
    c.setFont("Arial", 8)
    c.drawString(
        mx,
        y,
        "60 pages   ·   205 × 255 mm   ·   2026   ·   Ages 4–8",
    )
    y -= 16

    cover_copy = (
        "What is hiding behind “Ai-C”?  ·  "
        "Look at the feeling before you scold the words"
    )
    copy_style = ParagraphStyle(
        "copy",
        fontName="Georgia-Italic",
        fontSize=11,
        leading=15,
        textColor=CORAL_DARK,
    )
    copy_h = 20
    draw_paragraph(c, cover_copy, copy_style, mx, y, inner_w, copy_h)
    y -= copy_h + 12

    footer_h = 22
    bio_h = 96
    interiors_gap = 14

    cover_path = ROOT / "public/covers/aic-im-upset.jpg"
    cover_im = fit_rgb(crop_letterbox(cover_path), 900)
    cw = 214
    ch = cw * cover_im.size[1] / cover_im.size[0]
    cover_y = y - ch

    interiors_top = cover_y - 14
    interiors_label_h = 12
    img_top = interiors_top - interiors_label_h
    gap = 7
    iw = (inner_w - gap * 3) / 4
    ih = iw * 622 / 500
    img_y = img_top - ih
    # Keep author bios just under the interiors, above the footer
    min_img_y = footer_h + 10 + bio_h + interiors_gap
    if img_y < min_img_y:
        ih -= min_img_y - img_y
        img_y = min_img_y
    bio_top = img_y - interiors_gap

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
        fontSize=9.5,
        leading=13.6,
        textColor=INK,
        alignment=TA_LEFT,
    )
    synopsis = (
        "Kids spit out “Ai-C!” when they are angry, jealous, bored, or just done. "
        "Grown-ups hear a bad word and scold. The book starts one step earlier: "
        "that sound is not a swear. It is “ai” plus “sshi,” a grunt of not-wanting, "
        "and a whole weather system of feeling packed into one syllable."
        "<br/><br/>"
        "Whenever Myeonghun says it, odd little creatures pop out of the air. "
        "At first they only scare him. Then he traces each one back—to a test he "
        "might fail, a prize a friend won, a classmate who moved away, a class that "
        "would not end, a flash of temper he already regrets. The question shifts "
        "from “Why did I say that?” to “What am I feeling right now?”"
        "<br/><br/>"
        "A fantasy picture book for children and the adults beside them. Feelings "
        "have no correct answer. Naming them, in words that actually fit, is how a "
        "child starts to share a heart."
    )
    draw_paragraph(c, synopsis, syn_style, syn_x, y, syn_w, ch)

    # Interiors
    c.setFillColor(MUTED)
    c.setFont("Arial", 7)
    c.drawString(mx, interiors_top - 2, "SAMPLE INTERIORS")
    previews = [
        ROOT / f"public/previews/aic-im-upset/{i}.jpg" for i in (1, 2, 3, 4)
    ]
    for i, p in enumerate(previews):
        x = mx + i * (iw + gap)
        im = fit_rgb(PILImage.open(p), 700)
        c.setFillColor(WHITE)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.4)
        c.rect(x, img_y, iw, ih, fill=1, stroke=1)
        c.drawImage(
            jpeg_reader(im),
            x,
            img_y,
            width=iw,
            height=ih,
            preserveAspectRatio=True,
            anchor="c",
            mask="auto",
        )

    # Author bios — fixed band above the footer
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(mx, bio_top + 6, page_w - mx, bio_top + 6)

    col_w = (inner_w - 20) / 2
    bio_style = ParagraphStyle(
        "bio",
        fontName="Georgia",
        fontSize=7.7,
        leading=10.5,
        textColor=INK,
    )
    left_bio = (
        "<b>Jihye Ko</b>  ·  Author"
        "<br/>"
        "Jihye Ko studied early-childhood education at Ewha Womans University "
        "and child and family studies at Yonsei University graduate school. She "
        "works as a picture-book editor-planner, writer, picture-book therapist, "
        "and reading guide, connecting books with children. Words, she says, are "
        "the bridge between people; she wrote the <i>In My Words</i> series hoping "
        "children will build that bridge firmly enough to keep using it as adults. "
        "Her books include <i>Pretend Play Is Fun!</i> and <i>I Can Do It Too!</i>."
    )
    right_bio = (
        "<b>Woosung Oh</b>  ·  Illustrator"
        "<br/>"
        "Woosung Oh draws the twin characters Ore and Oo, and posts the "
        "four-panel strip <i>Pretty Decent Distractions</i> on social media. "
        "Books he illustrated include <i>The Dragon Is Money</i>, "
        "<i>The Jam Lid That Will Not, Will Not Open</i>, and "
        "<i>Elementary Hanja Vocabulary Daily Calendar</i>; books he wrote and "
        "drew include <i>How About Twins Like These?</i>, "
        "<i>Ore-Oo Find the Difference in Famous Paintings</i>, and "
        "<i>Ore-Oo and Fine Dust</i>. Instagram @OLAOO_WS."
    )
    draw_paragraph(c, left_bio, bio_style, mx, bio_top, col_w, bio_h)
    draw_paragraph(
        c, right_bio, bio_style, mx + col_w + 20, bio_top, col_w, bio_h
    )

    # Footer
    c.setFillColor(CORAL)
    c.rect(0, 0, page_w, 22, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Arial-Bold", 7)
    c.drawString(mx, 8, "PICTURE BOOKS")
    c.setFont("Arial", 7)
    mid = "World rights available  ·  LENA Agency"
    mw = c.stringWidth(mid, "Arial", 7)
    c.drawString((page_w - mw) / 2, 8, mid)
    right = "lenaagency.com"
    c.drawString(page_w - mx - c.stringWidth(right, "Arial", 7), 8, right)

    c.showPage()
    c.save()
    print("wrote", OUT, "bytes", OUT.stat().st_size)


if __name__ == "__main__":
    main()
