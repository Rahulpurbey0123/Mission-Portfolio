import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_gaura_nitai_horizontal(width=1100, height=200):
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    start_color = (14, 50, 133, 255)   # #0e3285
    end_color = (22, 90, 168, 255)     # #165aa8

    for x in range(width):
        r = int(start_color[0] + (end_color[0] - start_color[0]) * (x / width))
        g = int(start_color[1] + (end_color[1] - start_color[1]) * (x / width))
        b = int(start_color[2] + (end_color[2] - start_color[2]) * (x / width))
        draw.line([(x, 0), (x, height)], fill=(r, g, b, 255))

    font_path = "C:/Windows/Fonts/segoeuib.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"
    
    text = "Gaura Nitai Technologies"
    font_size = int(height * 0.46)
    font = ImageFont.truetype(font_path, font_size)

    bbox = font.getbbox(text)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    # Cyan Diamond
    diamond_size = int(height * 0.22)
    padding_left = int(height * 0.25)
    cx = padding_left + diamond_size
    cy = int(height * 0.5)

    glow_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_pts = [
        (cx, cy - diamond_size - 6),
        (cx + diamond_size + 6, cy),
        (cx, cy + diamond_size + 6),
        (cx - diamond_size - 6, cy)
    ]
    glow_draw.polygon(glow_pts, fill=(0, 226, 255, 180))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=6))
    img = Image.alpha_composite(img, glow_img)

    draw = ImageDraw.Draw(img)
    diamond_pts = [
        (cx, cy - diamond_size),
        (cx + diamond_size, cy),
        (cx, cy + diamond_size),
        (cx - diamond_size, cy)
    ]
    draw.polygon(diamond_pts, fill=(0, 229, 255, 255))

    text_x = cx + diamond_size + int(height * 0.3)
    text_y = int((height - text_h) / 2 - bbox[1])

    final_width = text_x + text_w + int(height * 0.35)

    if final_width != width:
        img_new = Image.new("RGBA", (final_width, height), (0, 0, 0, 0))
        draw_new = ImageDraw.Draw(img_new)
        for x in range(final_width):
            r = int(start_color[0] + (end_color[0] - start_color[0]) * (x / final_width))
            g = int(start_color[1] + (end_color[1] - start_color[1]) * (x / final_width))
            b = int(start_color[2] + (end_color[2] - start_color[2]) * (x / final_width))
            draw_new.line([(x, 0), (x, height)], fill=(r, g, b, 255))

        glow_img_new = Image.new("RGBA", (final_width, height), (0, 0, 0, 0))
        glow_draw_new = ImageDraw.Draw(glow_img_new)
        glow_draw_new.polygon(glow_pts, fill=(0, 226, 255, 180))
        glow_img_new = glow_img_new.filter(ImageFilter.GaussianBlur(radius=6))
        img = Image.alpha_composite(img_new, glow_img_new)

        draw = ImageDraw.Draw(img)
        draw.polygon(diamond_pts, fill=(0, 229, 255, 255))

    shadow_img = Image.new("RGBA", (img.width, height), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_draw.text((text_x + 3, text_y + 3), text, font=font, fill=(0, 0, 0, 160))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=2))
    img = Image.alpha_composite(img, shadow_img)

    draw = ImageDraw.Draw(img)
    draw.text((text_x, text_y), text, font=font, fill=(255, 215, 0, 255))

    return img

def create_gaura_nitai_square(size=512):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    start_color = (14, 50, 133, 255)
    end_color = (22, 90, 168, 255)

    for x in range(size):
        r = int(start_color[0] + (end_color[0] - start_color[0]) * (x / size))
        g = int(start_color[1] + (end_color[1] - start_color[1]) * (x / size))
        b = int(start_color[2] + (end_color[2] - start_color[2]) * (x / size))
        draw.line([(x, 0), (x, size)], fill=(r, g, b, 255))

    cx, cy = size // 2, int(size * 0.4)
    diamond_size = int(size * 0.2)

    # Glow
    glow_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_pts = [
        (cx, cy - diamond_size - 10),
        (cx + diamond_size + 10, cy),
        (cx, cy + diamond_size + 10),
        (cx - diamond_size - 10, cy)
    ]
    glow_draw.polygon(glow_pts, fill=(0, 226, 255, 200))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(radius=12))
    img = Image.alpha_composite(img, glow_img)

    draw = ImageDraw.Draw(img)
    diamond_pts = [
        (cx, cy - diamond_size),
        (cx + diamond_size, cy),
        (cx, cy + diamond_size),
        (cx - diamond_size, cy)
    ]
    draw.polygon(diamond_pts, fill=(0, 229, 255, 255))

    font_path = "C:/Windows/Fonts/segoeuib.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"
    
    font_size = int(size * 0.085)
    font = ImageFont.truetype(font_path, font_size)

    line1 = "GAURA NITAI"
    line2 = "TECHNOLOGIES"

    b1 = font.getbbox(line1)
    b2 = font.getbbox(line2)

    w1 = b1[2] - b1[0]
    w2 = b2[2] - b2[0]

    y1 = int(cy + diamond_size + size * 0.08)
    y2 = int(y1 + font_size * 1.25)

    # Shadow
    shadow_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_draw.text((int((size - w1)/2) + 2, y1 + 2), line1, font=font, fill=(0, 0, 0, 160))
    shadow_draw.text((int((size - w2)/2) + 2, y2 + 2), line2, font=font, fill=(0, 0, 0, 160))
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=2))
    img = Image.alpha_composite(img, shadow_img)

    draw = ImageDraw.Draw(img)
    draw.text((int((size - w1)/2), y1), line1, font=font, fill=(255, 215, 0, 255))
    draw.text((int((size - w2)/2), y2), line2, font=font, fill=(255, 215, 0, 255))

    return img

if __name__ == "__main__":
    horiz_logo = create_gaura_nitai_horizontal(1100, 160)
    horiz_logo.save("assets/images/gaura-nitai-logo.png", "PNG")
    if os.path.exists("portfolio/assets/images"):
        horiz_logo.save("portfolio/assets/images/gaura-nitai-logo.png", "PNG")

    sq_logo = create_gaura_nitai_square(512)
    sq_logo.save("assets/images/gaura-nitai-logo-square.png", "PNG")
    if os.path.exists("portfolio/assets/images"):
        sq_logo.save("portfolio/assets/images/gaura-nitai-logo-square.png", "PNG")

    print("Logos rendered successfully!")
