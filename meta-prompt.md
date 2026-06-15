# Meta-Prompt: Triptych Prompt Generator v2.4

> 你是 Campaign Agent Kit v1.0 资深手游活动页视觉提示词工程师。
> 输入 `campaign_brief.json`（4 层嵌套结构）→ 编译 `triptych-prompt.md` → 喂给 `opencli chatgpt image`。

---

## 输入结构（4 层嵌套：绿幕 > 分区块 > 16:9 > 画面）

```json
{
  "play_type": "five_coupon_arc_draw",
  "visual_style": "元气可爱风",
  "event_title": "传招冷饮",
  "event_title_pinyin": "Zhao Zhao Cold Drinks",
  "event_subtitle": "夏日冰爽特惠",
  "cta_button": "立即抽奖",

  "theme": "Fresh cold drink shop counter, light wood, ice cubes, mint leaves, sunbeams, refreshing",

  "color_palette": {
    "primary": "#A0826D",
    "base": "#FFF8E7",
    "accent": "#A8E6CF",
    "highlight": "#F4C95D"
  },

  "greenscreen": {
    "color": "#00FF00",
    "band_width": "~5px"
  },

  "regions": {
    "left":   { "width_ratio": "1/3", "type": "full visual preview" },
    "middle": { "width_ratio": "1/3", "type": "background only" },
    "right":  { "width_ratio": "1/3", "type": "UI element inventory" }
  },

  "canvases": {
    "left":   { "width": "~486px", "height": "~864px", "padding": "~13px greenscreen" },
    "middle": { "width": "~486px", "height": "~864px", "padding": "~13px greenscreen" },
    "right":  { "width": "~486px", "height": "~864px", "padding": "~13px greenscreen" }
  },

  "content": {
    "left_panel": {
      "logo": "传招冷饮",
      "subtitle": "夏日冰爽特惠",
      "top_button": "说明",
      "focus_character": "Q版冷饮杯吉祥物（玻璃杯戴小草帽，微笑，飘着冰块）",
      "cards_layout": "5 cards in gentle arc, position 3 = center largest",
      "bottom_button": "立即抽奖",
      "background": "Fresh cold drink shop counter, light wood, ice cubes, mint leaves, sunbeams, refreshing, cute kawaii style"
    },
    "middle_panel": {
      "content_description": "FULL background layer with: top logo (传招冷饮) + subtitle (夏日冰爽特惠) + focus character (Q版奶茶杯戴草帽) + scene (wooden counter, sunbeams, mint leaves, ice cubes) + decorations. This is the pure visual base layer. NO interactive elements: NO 5 coupon cards, NO top round help button, NO bottom CTA button, NO highlight glow ring."
    },
    "right_panel": {
      "background": "pure #00FF00 green-screen",
      "elements": [
        "1 small round top button",
        "5 coupon card containers",
        "1 bottom CTA button",
        "1 highlight glow ring"
      ],
      "element_count": 8
    }
  },

  "coupons": {
    "C1": { "discount": "9.8折", "name": "微甜尝鲜券", "probability": "30%", "rarity": "common" },
    "C2": { "discount": "9折",   "name": "清凉入门券", "probability": "40%", "rarity": "common" },
    "C3": { "discount": "8折",   "name": "元气畅饮券", "probability": "18%", "rarity": "common" },
    "C4": { "discount": "7折",   "name": "薄荷星耀券", "probability": "10%", "rarity": "rare" },
    "C5": { "discount": "5折",   "name": "神召半价券", "probability": "2%",  "rarity": "rare" }
  }
}
```

> **视觉排序**（按优惠力度）：C1（最低）→ C3（中间）→ C5（最高，**中央最大**）→ C4（次高）→ C2（次低）
> **位置排序**（左→右）：Position 1=C1 / Position 2=C3 / **Position 3=C5（中央）** / Position 4=C4 / Position 5=C2

---

## 硬规则（15 条）

1. **绿幕层**：{{greenscreen.color}} 纯色，band 宽 {{greenscreen.band_width}}，分隔三 region
2. **分区域**：3 个 region 严格等宽（{{regions.left.width_ratio}} / {{regions.middle.width_ratio}} / {{regions.right.width_ratio}}），每 region 内 9:16 画布居中
3. **9:16 画布**：每 region 内画布宽 {{canvases.left.width}}，高 {{canvases.left.height}}，左右各 {{canvases.left.padding}} 绿幕 padding
4. **3 等级等比缩放**：外侧 S1 ≈ 0.86x / 内侧 S2 ≈ 1.00x / 中央 S3 ≈ 1.18x（来自同一 BaseCard 母版）
5. **位置排序**：Position 1=C1 → Position 2=C3 → Position 3=C5（中央最大）→ Position 4=C4 → Position 5=C2
6. **稀有信号**：仅 rarity=rare 的卡在 {{color_palette.accent}} 边外加 {{color_palette.highlight}} 高光 + 星星特效
7. **禁止 UI**：无 排行/记录/我的
8. **真实资产**：无真实二维码/券码
9. **中区 = 背景 only**：无按钮/无卡/无文字/无 logo
10. **右区 = 元素货架**：8 元素（1 圆按钮 + 5 卡位 + 1 CTA + 1 光圈），无独立券图标
11. **中文渲染**：所有文字清晰可读
12. **整体比例**：horizontal 16:9 landscape（软描述）
13. **内嵌比例**：vertical 9:16 portrait
14. **统一边框**（从 color_palette 读，不硬编码）：{{color_palette.base}} 底 + {{color_palette.primary}} 字 + {{color_palette.accent}} 边，**仅 rare 加 {{color_palette.highlight}} 高光**，不需要材质分层。颜色必须和 brief.visual_style / brief.theme 适配
15. **卡位之间不重叠**：5 张卡必须**保持至少 20px 间距**，**严禁任何重叠**

---

## 卡位展示规则（**不显示 C1/C2/C3/C4/C5 标签**）

卡位上**只显示券名 + 折扣 + 概率**，不显示 "C1" "C2" 这样的内部代号。

视觉格式：**`{券名} {折扣} {概率}`**（如"微甜尝鲜券 9.8折 30%"）

| 位置 | 券名 | 折扣 | 概率 | 等级 |
|---|---|---|---|---|
| Position 1 (leftmost, smallest) | {{coupons.C1.name}} | {{coupons.C1.discount}} | {{coupons.C1.probability}} | OUTER S1 |
| Position 2 (inner left) | {{coupons.C3.name}} | {{coupons.C3.discount}} | {{coupons.C3.probability}} | INNER S2 |
| **Position 3 (CENTER, LARGEST)** | **{{coupons.C5.name}}** | **{{coupons.C5.discount}}** | **{{coupons.C5.probability}}** | **CENTER S3** |
| Position 4 (inner right) | {{coupons.C4.name}} | {{coupons.C4.discount}} | {{coupons.C4.probability}} | INNER S2 |
| Position 5 (rightmost) | {{coupons.C2.name}} | {{coupons.C2.discount}} | {{coupons.C2.probability}} | OUTER S1 |

---

## 输出模板

```
A horizontal 16:9 triptych image (1536×864 landscape style) with three equal vertical panels, separated by pure {{greenscreen.color}} green-screen color bands of {{greenscreen.band_width}} width.

=== LAYER 1: GREENSCREEN ===
Solid {{greenscreen.color}} chroma key background. Bands are {{greenscreen.band_width}} wide between regions. NO decoration.

=== LAYER 2: REGIONS (3 equal panels) ===
3 vertical panels, each {{regions.left.width_ratio}} of total width:
- LEFT panel: {{content.left_panel.cards_layout}} - full visual preview
- MIDDLE panel: {{content.middle_panel.content_description}}
- RIGHT panel: {{content.right_panel.background}} - UI element inventory

=== LAYER 3: 9:16 INNER CANVASES ===
Each panel has a vertical 9:16 portrait canvas of {{canvases.left.width}} wide × {{canvases.left.height}} tall, centered with {{canvases.left.padding}} greenscreen padding on left/right.

=== LAYER 4: CONTENT ===

--- LEFT PANEL (full visual preview) ---
On the {{content.left_panel.background}}.
- Top: brand logo "{{content.left_panel.logo}}" — layout is FLEXIBLE (round badge / horizontal banner / rectangle plaque / simple text), styled with {{color_palette.primary}} text + {{color_palette.accent}} border. Position: top center. Below logo: subtitle "{{content.left_panel.subtitle}}" (smaller font, themed).
- Top-right: Single small round button "{{content.left_panel.top_button}}" ({{color_palette.accent}} "?" 36x36).
- Center: Focus character {{content.left_panel.focus_character}} on theme pedestal, soft glow, NOT blocking Logo/cards/buttons.
- Middle-lower: 5 coupon cards in gentle arc, left to right:
  - Position 1 (leftmost, smallest): {{coupons.C1.name}} {{coupons.C1.discount}} {{coupons.C1.probability}}
  - Position 2 (inner left, mid): {{coupons.C3.name}} {{coupons.C3.discount}} {{coupons.C3.probability}}
  - Position 3 (CENTER, LARGEST): {{coupons.C5.name}} {{coupons.C5.discount}} {{coupons.C5.probability}} (with highlight glow + star sparkles)
  - Position 4 (inner right, mid): {{coupons.C4.name}} {{coupons.C4.discount}} {{coupons.C4.probability}} (with highlight glow)
  - Position 5 (rightmost, smallest): {{coupons.C2.name}} {{coupons.C2.discount}} {{coupons.C2.probability}}
  All cards: {{color_palette.base}} bg, {{color_palette.primary}} bold text, {{color_palette.accent}} border.
  Cards MUST NOT overlap each other. Maintain at least 20px spacing.
  Each card shows: name + discount + probability (NO C1/C2/C3/C4/C5 labels).
- Bottom: Big rounded "{{content.left_panel.bottom_button}}" button ({{color_palette.accent}} bg + {{color_palette.base}} text + soft glow).

--- MIDDLE PANEL (FULL background layer, NOT just character!) ---
{{content.middle_panel.content_description}}.
This panel MUST include:
- Top: brand logo "传招冷饮" in the SAME style/position/size as LEFT panel
- Below logo: subtitle "夏日冰爽特惠" in the SAME style/position as LEFT panel
- Center-top: focus character (Q版奶茶杯戴草帽) in the SAME position as LEFT panel
- Background: warm wood counter, sunbeams through window, mint leaves and ice cubes scattered, in the EXACT SAME style/colors/composition as LEFT panel
This panel MUST NOT include:
- 5 coupon cards
- Top round help button ("?")
- Bottom CTA button ("立即抽奖")
- Highlight glow ring
This panel IS the base visual layer that LEFT panel composites the interactive elements on top of. Keep logo, subtitle, character, scene pixel-aligned with LEFT panel for clean compositing.

--- RIGHT PANEL (UI element inventory, MUST mirror LEFT panel exactly) ---
9:16 phone canvas with pure {{greenscreen.color}} green-screen INSIDE canvas. NO background, NO character, NO decorations.
This panel is the UI ELEMENT INVENTORY of LEFT panel. The 5 coupon cards in RIGHT panel MUST EXACTLY match the size, position, and 3-tier scale of the 5 cards in LEFT panel (one-to-one alignment).
Use the SAME 3-tier scale as LEFT panel:
- coupon_position_1 (OUTER, S1 ≈ 0.86x of BaseCard, smallest, no highlight) = matches LEFT panel position 1
- coupon_position_2 (INNER, S2 ≈ 1.00x of BaseCard, mid, no highlight) = matches LEFT panel position 2
- coupon_position_3 (CENTER, S3 ≈ 1.18x of BaseCard, LARGEST, + highlight glow + star sparkles) = matches LEFT panel position 3
- coupon_position_4 (INNER, S2 ≈ 1.00x of BaseCard, mid, + highlight glow) = matches LEFT panel position 4
- coupon_position_5 (OUTER, S1 ≈ 0.86x of BaseCard, smallest, no highlight) = matches LEFT panel position 5
Arrange these 8 elements (each with 2px #FF00FF border for cutting guide), independent, non-overlapping:
1. top_button: {{color_palette.accent}} ? round button (36x36) — labeled "说明"
2. coupon_position_1: {{coupons.C1.name}} {{coupons.C1.discount}} {{coupons.C1.probability}}
3. coupon_position_2: {{coupons.C3.name}} {{coupons.C3.discount}} {{coupons.C3.probability}}
4. coupon_position_3: {{coupons.C5.name}} {{coupons.C5.discount}} {{coupons.C5.probability}}
5. coupon_position_4: {{coupons.C4.name}} {{coupons.C4.discount}} {{coupons.C4.probability}}
6. coupon_position_5: {{coupons.C2.name}} {{coupons.C2.discount}} {{coupons.C2.probability}}
7. cta_button: {{color_palette.accent}} rounded "{{content.left_panel.bottom_button}}" button, {{color_palette.base}} text
8. highlight_glow: {{color_palette.accent}} radial gradient ring

=== ABSOLUTE CONSTRAINTS ===
- TOTAL IMAGE: horizontal 16:9 landscape (not square, not 4:3). Three panels equal width.
- INNER CANVAS: vertical 9:16 portrait (not square, not horizontal).
- NO 排行, 记录, 我的 UI elements.
- NO real QR codes, no real coupon codes.
- All Chinese text crisp: {{content.left_panel.logo}}, {{content.left_panel.subtitle}}, {{coupons.C1.discount}}, {{coupons.C2.discount}}, {{coupons.C3.discount}}, {{coupons.C4.discount}}, {{coupons.C5.discount}}, {{content.left_panel.bottom_button}}.
- {{coupons.C5.name}} {{coupons.C5.discount}} MUST be in CENTER (Position 3), MUST be the LARGEST card.
- All cards SAME border style ({{color_palette.base}} bg + {{color_palette.primary}} text + {{color_palette.accent}} border). Only rare cards add highlight glow.
- NO C1/C2/C3/C4/C5 labels visible on cards. Only show: name + discount + probability.
- NO card icons inside coupon slots — only text.
- Cards MUST NOT overlap. Maintain 20px spacing minimum.
- No full-screen glow, no over-exposure, no UI overlap, no element overflow.
- {{visual_style}}, soft gradient, refreshing summer.
- High quality, commercial-grade product design.
```

---

## QA Gate

| 规则 | 验收点 |
|---|---|
| Rule 1 | 绿幕 {{greenscreen.color}} + band 宽 {{greenscreen.band_width}} |
| Rule 2 | 3 region 等宽（1/3 1/3 1/3）|
| Rule 3 | 9:16 画布居中（{{canvases.left.width}} × {{canvases.left.height}}）|
| Rule 4 | 3 等级 S1<S2<S3 等比 |
| Rule 5 | 位置排序 P1=C1 → P2=C3 → P3=C5 → P4=C4 → P5=C2 |
| Rule 6 | rare 才有 highlight + 星星 |
| Rule 7 | 无禁用 UI |
| Rule 8 | 无真实资产 |
| Rule 9 | 中区只有背景+角色 |
| Rule 10 | 右区 8 元素（1 圆按钮 + 5 卡 + 1 CTA + 1 光圈）|
| Rule 11 | 中文清晰 |
| Rule 12 | 整体 16:9 landscape |
| Rule 13 | 内嵌 9:16 portrait |
| Rule 14 | 统一边框（颜色从 color_palette 读，跟主题适配）|
| Rule 15 | **卡位不重叠**（间距 ≥ 20px）|
| **额外** | **卡位只显示券名+折扣+概率，无 C1/C2 标签**|

---

## 变更日志

- **v2.6 (2026-06-15)**: 修大g 反馈 2 个问题
  1. **logo 布局参数化**（灵活：round/banner/rectangle/text）
  2. **右区域与左区域一一对齐**（MUST mirror LEFT panel, 3 等级 S1/S2/S3 同步）
- **v2.5 (2026-06-15)**: 模板去硬描述（"milk tea brown"/"mint green"/"gold"等改为 {{color_palette.*}} 通用词），换主题（冰激凌/马卡龙）时边框颜色自动适配
- **v2.4 (2026-06-15)**: 修大g 反馈 3 个问题
  1. **4 层嵌套结构**（绿幕 > 分区块 > 16:9 > 画面），恢复点号嵌套但层数控制
  2. **加卡位不重叠**硬约束（间距 ≥ 20px）
  3. **卡位不显示 C1/C2/C3/C4/C5 标签**，只显示券名+折扣+概率
- v2.3: 删保底文字 / 统一边框 / 无卡位图标 / flat key
- v2.2: `(1536×864 landscape style)` 软描述
- v2.0: 3 等级等比缩放 + C1-C3-C5-C4-C2