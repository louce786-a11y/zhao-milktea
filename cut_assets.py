#!/usr/bin/env python3
"""
切图脚本：把三联图 (1672x941) 切成 3 个 9:16 canvas (486x864)
- left_canvas  → preview.png    完整视觉参考
- middle_canvas → background.png 手机全屏背景
- right_canvas → elements.png   UI 元素层
"""
from PIL import Image
from pathlib import Path

HERE = Path(__file__).parent
DEMO = HERE / "demo"
DEMO.mkdir(exist_ok=True)

src_path = HERE / "triptych.png"
img = Image.open(src_path)
W, H = img.size
print(f"📐 源图: {W}×{H}")

# 3 region 等宽
region_w = W // 3
# 9:16 canvas 居中: 宽 486, 高 864
canvas_w, canvas_h = 486, 864
# padding (左右 / 上下)
pad_x = (region_w - canvas_w) // 2
pad_y = (H - canvas_h) // 2

print(f"📐 Region 宽: {region_w}, Canvas: {canvas_w}×{canvas_h}, Padding: x={pad_x} y={pad_y}")

# 切 3 个 canvas
for i, name in enumerate(["preview", "background", "elements"]):
    x = i * region_w + pad_x
    y = pad_y
    crop = img.crop((x, y, x + canvas_w, y + canvas_h))
    out = DEMO / f"{name}.png"
    crop.save(out, optimize=True)
    print(f"✅ {name}.png: {crop.size} → {out}")

# 额外：把背景图放大到 2x (高分辨率) 供 mobile 屏幕用
bg = Image.open(DEMO / "background.png")
bg_hires = bg.resize((bg.width * 2, bg.height * 2), Image.LANCZOS)
bg_hires.save(DEMO / "background-hires.png", optimize=True)
print(f"✅ background-hires.png: {bg_hires.size} (2×)")

print("\n🎉 切图完成！")
