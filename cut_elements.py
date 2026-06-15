#!/usr/bin/env python3
"""
从 elements.png 抠 8 个元素（去绿幕 + 切 5 张 sprite 卡）

绿幕实际像素：RGB(2, 250, 2) — 不是纯 #00FF00
"""
import json
import numpy as np
from PIL import Image
from pathlib import Path

HERE = Path(__file__).parent
DEMO = HERE / "demo"
DEMO.mkdir(exist_ok=True)
CARDS_DIR = DEMO / "cards"
CARDS_DIR.mkdir(exist_ok=True)

src = DEMO / "elements.png"
img = Image.open(src)
arr = np.array(img)
H, W = arr.shape[:2]
print(f"📐 elements.png: {W}×{H}")

# 绿幕判断：G > 200 & R < 80 & B < 80（覆盖 69% 绿幕像素）
r, g, b = arr[:,:,0], arr[:,:,1], arr[:,:,2]
is_green = (g > 200) & (r < 80) & (b < 80)
print(f"🟢 绿幕像素: {is_green.sum()} / {H*W} ({is_green.mean()*100:.1f}%)")

# 转 RGBA：先复制 RGB，再加 alpha 通道
alpha = np.where(is_green, 0, 255).astype(np.uint8)
arr_rgba = np.dstack([arr, alpha])

transparent_path = DEMO / "elements-transparent.png"
Image.fromarray(arr_rgba).save(transparent_path, optimize=True)
print(f"✅ {transparent_path.name}")

# 切 5 张卡（按视觉位置）
card_centers_x = [80, 160, 243, 325, 405]
card_y_range = (260, 460)
card_width = 95

cards = []
for i, cx in enumerate(card_centers_x):
    x1 = max(0, cx - card_width // 2)
    x2 = min(W, cx + card_width // 2)
    y1, y2 = card_y_range
    sprite_arr = arr_rgba[y1:y2, x1:x2].copy()
    # 切出来的卡也去绿幕（重新应用 is_green 判断）
    sprite_arr[is_green[y1:y2, x1:x2], 3] = 0
    sprite = Image.fromarray(sprite_arr)
    sprite_path = CARDS_DIR / f"card-{i+1}.png"
    sprite.save(sprite_path, optimize=True)
    cards.append({
        "id": f"card-{i+1}",
        "x": cx, "y1": y1, "y2": y2,
        "x1": x1, "x2": x2,
        "w": sprite.size[0], "h": sprite.size[1],
        "path": f"cards/card-{i+1}.png"
    })
    print(f"  ✅ card-{i+1}.png: {sprite.size}")

meta = {
    "source": "elements.png", "size": [W, H],
    "transparent_png": "elements-transparent.png",
    "cards": cards
}
(DEMO / "element-bboxes.json").write_text(
    json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8"
)
print(f"\n✅ element-bboxes.json")
