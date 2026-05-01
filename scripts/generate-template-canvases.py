from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "apps/mobile/assets/template-previews/custom/other"
W, H = 768, 1376


def rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    hex_color = hex_color.lstrip("#")
    return (
        int(hex_color[0:2], 16),
        int(hex_color[2:4], 16),
        int(hex_color[4:6], 16),
        alpha,
    )


def base(bg: str) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    image = Image.new("RGBA", (W, H), rgba(bg))
    draw = ImageDraw.Draw(image, "RGBA")
    return image, draw


def frame(draw: ImageDraw.ImageDraw, color: str, inset: int = 58, width: int = 3) -> None:
    draw.rounded_rectangle(
        [inset, inset, W - inset, H - inset],
        radius=42,
        outline=rgba(color, 170),
        width=width,
    )
    draw.rounded_rectangle(
        [inset + 32, inset + 34, W - inset - 32, H - inset - 34],
        radius=32,
        outline=rgba(color, 80),
        width=2,
    )


def leaf(draw: ImageDraw.ImageDraw, center: tuple[int, int], size: int, color: str, angle: str) -> None:
    x, y = center
    if angle == "left":
        box = [x - size, y - size // 2, x + size // 3, y + size // 2]
    else:
        box = [x - size // 3, y - size // 2, x + size, y + size // 2]
    draw.ellipse(box, fill=rgba(color, 140))


def flower(draw: ImageDraw.ImageDraw, center: tuple[int, int], petal: str, core: str) -> None:
    x, y = center
    for dx, dy in [(0, -18), (18, 0), (0, 18), (-18, 0), (13, 13)]:
        draw.ellipse([x + dx - 20, y + dy - 16, x + dx + 20, y + dy + 16], fill=rgba(petal, 150))
    draw.ellipse([x - 10, y - 10, x + 10, y + 10], fill=rgba(core, 190))


def cloud(draw: ImageDraw.ImageDraw, x: int, y: int, scale: float, color: str) -> None:
    parts = [
        (0, 22, 110, 78),
        (44, 0, 136, 78),
        (104, 26, 202, 82),
    ]
    for left, top, right, bottom in parts:
        draw.ellipse(
            [
                x + int(left * scale),
                y + int(top * scale),
                x + int(right * scale),
                y + int(bottom * scale),
            ],
            fill=rgba(color, 130),
        )
    draw.rounded_rectangle(
        [x, y + int(48 * scale), x + int(204 * scale), y + int(92 * scale)],
        radius=int(28 * scale),
        fill=rgba(color, 130),
    )


def mortarboard(draw: ImageDraw.ImageDraw, x: int, y: int, color: str, trim: str) -> None:
    draw.polygon(
        [(x, y), (x + 104, y - 44), (x + 210, y), (x + 104, y + 44)],
        fill=rgba(color, 185),
    )
    draw.rectangle([x + 64, y + 28, x + 146, y + 78], fill=rgba(color, 150))
    draw.line([x + 168, y + 12, x + 190, y + 90], fill=rgba(trim, 210), width=5)
    draw.ellipse([x + 184, y + 86, x + 206, y + 108], fill=rgba(trim, 220))


def save(image: Image.Image, name: str) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rgb = image.convert("RGB")
    rgb.save(OUT_DIR / f"{name}.jpeg", quality=92, optimize=True)


def house_warm() -> Image.Image:
    image, draw = base("#F6F8EF")
    frame(draw, "#AFC0A4")
    draw.rounded_rectangle([122, 164, 646, 1214], radius=58, fill=rgba("#FFFFFF", 85))
    draw.arc([220, 228, 548, 494], 205, 335, fill=rgba("#B7C8A9", 95), width=5)
    flower(draw, (112, 152), "#DFEAD6", "#C8A555")
    flower(draw, (626, 1132), "#D7E6CF", "#C8A555")
    leaf(draw, (164, 118), 44, "#9BA98E", "left")
    leaf(draw, (584, 1178), 48, "#9BA98E", "right")
    draw.polygon([(108, 1060), (166, 1010), (224, 1060)], outline=rgba("#AFC0A4", 145), width=5)
    draw.rectangle([124, 1060, 208, 1126], outline=rgba("#AFC0A4", 125), width=4)
    return image


def house_modern() -> Image.Image:
    image, draw = base("#FBFAF6")
    frame(draw, "#C8CBC3", inset=64)
    draw.rounded_rectangle([116, 150, 652, 1226], radius=36, outline=rgba("#BFC5BC", 88), width=3)
    draw.arc([204, 196, 564, 584], 200, 340, fill=rgba("#B5C0AE", 105), width=7)
    draw.rectangle([118, 1014, 282, 1124], outline=rgba("#D2D6CF", 130), width=5)
    draw.line([118, 1070, 282, 1070], fill=rgba("#D2D6CF", 100), width=4)
    draw.line([200, 1014, 200, 1124], fill=rgba("#D2D6CF", 100), width=4)
    for x, y in [(146, 274), (606, 334), (176, 1080), (570, 1038)]:
        draw.ellipse([x - 9, y - 9, x + 9, y + 9], fill=rgba("#DADCD6", 130))
    return image


def baby_shower() -> Image.Image:
    image, draw = base("#F6FBFF")
    frame(draw, "#BBD7EE")
    cloud(draw, 82, 150, 0.82, "#D7ECFA")
    cloud(draw, 490, 1044, 0.76, "#D7ECFA")
    draw.ellipse([108, 828, 244, 964], fill=rgba("#F7D6B8", 120))
    draw.line([176, 964, 148, 1030], fill=rgba("#BBD7EE", 150), width=3)
    draw.line([176, 964, 204, 1030], fill=rgba("#BBD7EE", 150), width=3)
    for x, y in [(570, 204), (606, 260), (152, 1118), (534, 930), (220, 370)]:
        draw.line([x - 15, y, x + 15, y], fill=rgba("#B8D8F0", 170), width=3)
        draw.line([x, y - 15, x, y + 15], fill=rgba("#B8D8F0", 170), width=3)
    return image


def baby_pink() -> Image.Image:
    image, draw = base("#FFF7FB")
    frame(draw, "#EBC4D6")
    cloud(draw, 94, 202, 0.72, "#F7DDE8")
    cloud(draw, 482, 1050, 0.72, "#F7DDE8")
    draw.arc([266, 880, 502, 1030], 180, 360, fill=rgba("#E5B7CC", 150), width=6)
    for x, y, s in [(128, 826, 48), (594, 230, 42), (616, 902, 36)]:
        draw.ellipse([x - s, y - s, x + s, y + s], fill=rgba("#F4C6D8", 120))
    for x, y in [(214, 238), (536, 1126), (168, 1102)]:
        draw.polygon(
            [(x, y + 22), (x - 26, y - 6), (x - 8, y - 28), (x, y - 16), (x + 8, y - 28), (x + 26, y - 6)],
            fill=rgba("#E8AEC8", 140),
        )
    return image


def graduation() -> Image.Image:
    image, draw = base("#F7F9FF")
    frame(draw, "#8FA0C5")
    mortarboard(draw, 462, 160, "#263D68", "#C9A85A")
    draw.arc([86, 814, 306, 1114], 105, 250, fill=rgba("#C9A85A", 130), width=5)
    draw.arc([462, 814, 682, 1114], 290, 75, fill=rgba("#C9A85A", 130), width=5)
    for x, y in [(158, 308), (604, 430), (210, 1054), (546, 1016)]:
        draw.rectangle([x - 9, y - 9, x + 9, y + 9], fill=rgba("#C9A85A", 150))
    return image


def graduation_warm() -> Image.Image:
    image, draw = base("#FFF9EF")
    frame(draw, "#D4B06B")
    mortarboard(draw, 280, 186, "#6A5740", "#D8B36C")
    for x, y, r in [(136, 244, 34), (606, 326, 28), (152, 1110, 24), (584, 1074, 40)]:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=rgba("#F1D8A4", 115))
    for x, y in [(104, 820), (632, 812), (142, 888), (594, 884)]:
        leaf(draw, (x, y), 36, "#D2B56F", "left" if x < W / 2 else "right")
    return image


def business() -> Image.Image:
    image, draw = base("#F5F8FF")
    frame(draw, "#8BA7D9")
    for x in range(96, W - 80, 72):
        draw.line([x, 122, x, H - 122], fill=rgba("#DDE6F7", 55), width=2)
    for y in range(176, H - 120, 92):
        draw.line([88, y, W - 88, y], fill=rgba("#DDE6F7", 55), width=2)
    draw.rounded_rectangle([474, 188, 636, 330], radius=24, fill=rgba("#D9E5FA", 160))
    draw.rounded_rectangle([132, 1024, 312, 1140], radius=22, fill=rgba("#E7EEF9", 150))
    draw.line([170, 1082, 274, 1082], fill=rgba("#5A7DBC", 150), width=5)
    return image


def business_dark() -> Image.Image:
    image, draw = base("#F8F7F2")
    draw.rounded_rectangle([42, 42, W - 42, H - 42], radius=46, fill=rgba("#172033", 238))
    draw.rounded_rectangle([74, 78, W - 74, H - 78], radius=34, outline=rgba("#C9A85A", 180), width=3)
    draw.rounded_rectangle([126, 228, W - 126, H - 228], radius=42, fill=rgba("#FBFAF6", 244))
    draw.line([120, 210, 650, 96], fill=rgba("#32415E", 120), width=9)
    draw.line([118, 1192, 650, 1278], fill=rgba("#32415E", 130), width=9)
    for x, y in [(604, 188), (164, 1182), (566, 1128)]:
        draw.ellipse([x - 24, y - 24, x + 24, y + 24], outline=rgba("#C9A85A", 160), width=4)
    return image


CANVASES = {
    "house-warm": house_warm,
    "house-modern": house_modern,
    "baby-shower": baby_shower,
    "baby-pink": baby_pink,
    "graduation": graduation,
    "graduation-warm": graduation_warm,
    "business": business,
    "business-dark": business_dark,
}


def main() -> None:
    for name, builder in CANVASES.items():
        image = builder()
        image = image.filter(ImageFilter.SMOOTH_MORE)
        save(image, name)


if __name__ == "__main__":
    main()
