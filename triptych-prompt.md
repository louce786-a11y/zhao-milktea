A horizontal 16:9 triptych image (1536×864 landscape style) with three equal vertical panels, separated by pure #00FF00 green-screen color bands of ~5px width.

=== LAYER 1: GREENSCREEN ===
Solid #00FF00 chroma key background. Bands are ~5px wide between regions. NO decoration.

=== LAYER 2: REGIONS (3 equal panels) ===
3 vertical panels, each 1/3 of total width:
- LEFT panel: 5 cards in gentle arc, position 3 = center largest - full visual preview
- MIDDLE panel: FULL background layer with: top logo (传招冷饮) + subtitle (夏日冰爽特惠) + focus character (Q版奶茶杯戴草帽) + scene (wooden counter, sunbeams, mint leaves, ice cubes) + decorations. This is the pure visual base layer. NO interactive elements: NO 5 coupon cards, NO top round help button, NO bottom CTA button, NO highlight glow ring.
- RIGHT panel: pure #00FF00 green-screen - UI element inventory

=== LAYER 3: 9:16 INNER CANVASES ===
Each panel has a vertical 9:16 portrait canvas of ~486px wide × ~864px tall, centered with ~13px greenscreen greenscreen padding on left/right.

=== LAYER 4: CONTENT ===

--- LEFT PANEL (full visual preview) ---
On the Summer cold drink shop counter, iced milk tea glasses with boba pearls and brown sugar syrup layers, mint leaves and ice cubes scattered, light wood counter, sunbeams through window, cute kawaii style, refreshing and lively.
- Top: brand logo "传招冷饮" — layout is FLEXIBLE (round badge / horizontal banner / rectangle plaque / simple text), styled with #A0826D text + #A8E6CF border. Position: top center. Below logo: subtitle "夏日冰爽特惠" (smaller font, themed).
- Top-right: Single small round button "说明" (#A8E6CF "?" 36x36).
- Center: Focus character Q版奶茶杯吉祥物（透明玻璃杯里装奶茶+奶盖+珍珠，戴小草帽，微笑，飘着冰块和薄荷叶） on theme pedestal, soft glow, NOT blocking Logo/cards/buttons.
- Middle-lower: 5 coupon cards in gentle arc, left to right:
  - Position 1 (leftmost, smallest): 奶茶券 9.8折 30%
  - Position 2 (inner left, mid): 奶茶券 8折 20%
  - Position 3 (CENTER, LARGEST): 奶茶券 5折 5% (with highlight glow + star sparkles)
  - Position 4 (inner right, mid): 奶茶券 7折 15% (with highlight glow)
  - Position 5 (rightmost, smallest): 奶茶券 9折 30%
  All cards: #FFF8E7 bg, #A0826D bold text, #A8E6CF border.
  Cards MUST NOT overlap each other. Maintain at least 20px spacing.
  Each card shows: name + discount + probability (NO C1/C2/C3/C4/C5 labels).
- Bottom: Big rounded "立即抽奖" button (#A8E6CF bg + #FFF8E7 text + soft glow).

--- MIDDLE PANEL (FULL background layer, NOT just character!) ---
FULL background layer with: top logo (传招冷饮) + subtitle (夏日冰爽特惠) + focus character (Q版奶茶杯戴草帽) + scene (wooden counter, sunbeams, mint leaves, ice cubes) + decorations. This is the pure visual base layer. NO interactive elements: NO 5 coupon cards, NO top round help button, NO bottom CTA button, NO highlight glow ring..
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
9:16 phone canvas with pure #00FF00 green-screen INSIDE canvas. NO background, NO character, NO decorations.
This panel is the UI ELEMENT INVENTORY of LEFT panel. The 5 coupon cards in RIGHT panel MUST EXACTLY match the size, position, and 3-tier scale of the 5 cards in LEFT panel (one-to-one alignment).
Use the SAME 3-tier scale as LEFT panel:
- coupon_position_1 (OUTER, S1 ≈ 0.86x of BaseCard, smallest, no highlight) = matches LEFT panel position 1
- coupon_position_2 (INNER, S2 ≈ 1.00x of BaseCard, mid, no highlight) = matches LEFT panel position 2
- coupon_position_3 (CENTER, S3 ≈ 1.18x of BaseCard, LARGEST, + highlight glow + star sparkles) = matches LEFT panel position 3
- coupon_position_4 (INNER, S2 ≈ 1.00x of BaseCard, mid, + highlight glow) = matches LEFT panel position 4
- coupon_position_5 (OUTER, S1 ≈ 0.86x of BaseCard, smallest, no highlight) = matches LEFT panel position 5
Arrange these 8 elements (each with 2px #FF00FF border for cutting guide), independent, non-overlapping:
1. top_button: #A8E6CF ? round button (36x36) — labeled "说明"
2. coupon_position_1: 奶茶券 9.8折 30%
3. coupon_position_2: 奶茶券 8折 20%
4. coupon_position_3: 奶茶券 5折 5%
5. coupon_position_4: 奶茶券 7折 15%
6. coupon_position_5: 奶茶券 9折 30%
7. cta_button: #A8E6CF rounded "立即抽奖" button, #FFF8E7 text
8. highlight_glow: #A8E6CF radial gradient ring

=== ABSOLUTE CONSTRAINTS ===
- TOTAL IMAGE: horizontal 16:9 landscape (not square, not 4:3). Three panels equal width.
- INNER CANVAS: vertical 9:16 portrait (not square, not horizontal).
- NO 排行, 记录, 我的 UI elements.
- NO real QR codes, no real coupon codes.
- All Chinese text crisp: 传招冷饮, 夏日冰爽特惠, 9.8折, 9折, 8折, 7折, 5折, 立即抽奖.
- 奶茶券 5折 MUST be in CENTER (Position 3), MUST be the LARGEST card.
- All cards SAME border style (#FFF8E7 bg + #A0826D text + #A8E6CF border). Only rare cards add highlight glow.
- NO C1/C2/C3/C4/C5 labels visible on cards. Only show: name + discount + probability.
- NO card icons inside coupon slots — only text.
- Cards MUST NOT overlap. Maintain 20px spacing minimum.
- No full-screen glow, no over-exposure, no UI overlap, no element overflow.
- 元气可爱风 kawaii / 夏日冷饮店 / 治愈清新, soft gradient, refreshing summer.
- High quality, commercial-grade product design.