#!/usr/bin/env python3
"""
compile_prompt.py — Campaign Agent Kit v1.0 (v2.4)

4 层嵌套结构（绿幕 > 分区块 > 16:9 > 画面）+ coupons.
支持点号嵌套占位符（{{coupons.C1.discount}}）.

用法:
    python3 compile_prompt.py
    opencli chatgpt image "$(cat triptych-prompt.md)" --op <dir>
"""
import json
import re
import sys
from pathlib import Path
from typing import Any

HERE = Path(__file__).parent
BRIEF_PATH = HERE / "brief.json"
META_PATH = HERE / "meta-prompt.md"
OUTPUT_PATH = HERE / "triptych-prompt.md"


def find_template_block(meta_md: str) -> str:
    """提取 meta-prompt.md 里 ``` 包裹的输出模板骨架。"""
    blocks = re.findall(r"```(.*?)```", meta_md, re.DOTALL)
    if not blocks:
        raise ValueError("meta-prompt.md 里没找到代码块（模板）")
    return max(blocks, key=len).strip()


def assign_coupon_tiers(coupons: dict) -> dict:
    """
    coupons 已经是 {C1: {...}, C2: {...}, ...} 结构。
    验证有 5 张券。
    """
    if len(coupons) != 5:
        print(f"⚠️  Expected 5 coupons, got {len(coupons)}", file=sys.stderr)
    return coupons


def lookup(data: dict, dotted_key: str) -> str:
    """
    按点号路径查找 data 中的值。
    例如 "coupons.C1.discount" → data["coupons"]["C1"]["discount"]
    """
    parts = dotted_key.split(".")
    cur: Any = data
    for p in parts:
        if isinstance(cur, dict) and p in cur:
            cur = cur[p]
        else:
            return ""  # 找不到返回空串
    return str(cur) if cur is not None else ""


def build_brief_index(brief: dict) -> dict:
    """
    把 brief 拍平为 flat key/value dict，方便查表替换。
    同时保留嵌套结构以便点号查找。
    """
    # 整个 brief 自身就是嵌套结构，直接用 lookup 即可
    return brief


def render_template(template: str, brief: dict) -> str:
    """用点号嵌套路径替换 {{a.b.c}} 占位符。"""
    out = template
    leftovers: set[str] = set()

    def replace_one(match: re.Match) -> str:
        key = match.group(1).strip()
        val = lookup(brief, key)
        if not val:
            leftovers.add(key)
        return val

    # 单 pass 替换
    pattern = re.compile(r"\{\{([a-zA-Z0-9_.]+)\}\}")
    out = pattern.sub(replace_one, out)
    if leftovers:
        print(f"⚠️  Unreplaced placeholders: {leftovers}", file=sys.stderr)
    return out


def main() -> int:
    if not BRIEF_PATH.exists():
        print(f"❌ Missing {BRIEF_PATH}")
        return 1
    if not META_PATH.exists():
        print(f"❌ Missing {META_PATH}")
        return 1

    brief = json.loads(BRIEF_PATH.read_text(encoding="utf-8"))
    meta = META_PATH.read_text(encoding="utf-8")
    template = find_template_block(meta)

    # 验证 coupons 结构
    coupons = brief.get("coupons", {})
    assign_coupon_tiers(coupons)
    print("📊 Coupon layout (visual order P1→P5):")
    for pos, tier in enumerate(["C1", "C3", "C5", "C4", "C2"], 1):
        c = coupons.get(tier, {})
        print(f"   Position {pos}: {c.get('discount', '?'):>6} {c.get('name', '?'):>6} ({c.get('probability', '?'):>4}) {c.get('rarity', '?')}")

    rendered = render_template(template, brief)
    OUTPUT_PATH.write_text(rendered, encoding="utf-8")
    print(f"\n✅ Compiled → {OUTPUT_PATH} ({len(rendered)} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
