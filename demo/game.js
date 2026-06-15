// game.js - 传招冷饮 / 5 张奶茶券弧形抽奖
// 纯逻辑层, 浏览器和 node 通用 (ES module)
// 不依赖 DOM / localStorage, 全部走参数, 方便单测

// ===== 5 张奶茶券（按优惠力度从低到高: C1 < C2 < C3 < C4 < C5）=====
// 视觉顺序（左→右 沿弧线）: C1 → C3 → C5 → C4 → C2
export const COUPONS = [
  { id: 'C1', name: '奶茶券', discount: '9.8折', prob: 30, weight: 30, rare: false, flavor: '🥛' },
  { id: 'C3', name: '奶茶券', discount: '8折',   prob: 20, weight: 20, rare: false, flavor: '🧋' },
  { id: 'C5', name: '奶茶券', discount: '5折',   prob:  5, weight:  5, rare: true,  flavor: '✨' },
  { id: 'C4', name: '奶茶券', discount: '7折',   prob: 15, weight: 15, rare: true,  flavor: '🌿' },
  { id: 'C2', name: '奶茶券', discount: '9折',   prob: 30, weight: 30, rare: false, flavor: '🍵' },
];

// 卡位视觉位置顺序（左→右 沿弧线）
export const ARC_ORDER = ['C1', 'C3', 'C5', 'C4', 'C2'];

// 卡位等级（3 等级等比缩放）
export const TIER_SCALE = {
  outer: 0.86,  // S1: C1, C2
  inner: 1.00,  // S2: C3, C4
  center: 1.18, // S3: C5
};

// 卡位 tier 映射（基于视觉位置 + 优惠力度）
export const POSITION_TIER = {
  P1: 'outer',  // C1
  P2: 'inner',  // C3
  P3: 'center', // C5
  P4: 'inner',  // C4
  P5: 'outer',  // C2
};

// ===== 老虎机常量 =====
export const SLOT_TOTAL_CARDS = 40;       // reel 总卡数
export const SLOT_WINNER_INDEX = 35;      // 中奖卡在 reel 位置

// ===== 5 张 sprite 卡在 default 状态的位置（弧形布局，复刻 triptych 左 panel）=====
// x, y 是中心点坐标（百分比，相对 phone canvas 360×640）
// 顺序对应 ARC_ORDER：[C1, C3, C5, C4, C2] = [9.8折, 8折, 5折, 7折, 9折]
// 卡 width=68px, 5 张平分 phone 宽 (68*5 + 8*4 = 372 ≈ 360)
// 中心点 x: 12%/30%/50%/70%/88%，边距安全
// y: 中间高、两边低（弧形）
export const ARC_POSITIONS = {
  P1: { x: 12, y: 80, tier: 'outer'  },  // C1 (9.8折) 最左
  P2: { x: 31, y: 76, tier: 'inner'  },  // C3 (8折)   左中
  P3: { x: 50, y: 72, tier: 'center' },  // C5 (5折)   中心
  P4: { x: 69, y: 76, tier: 'inner'  },  // C4 (7折)   右中
  P5: { x: 88, y: 80, tier: 'outer'  },  // C2 (9折)   最右
};
export const RARE_WEIGHT_THRESHOLD = 15;  // weight <= 15 视为稀有
export const DAILY_FREE_DRAWS = 3;        // 每天免费次数
export const PITY_THRESHOLD = 10;         // 连抽 10 次必出稀有

// ===== 动画常量（参考爱奇艺动效） =====
export const ANIM = {
  COLLAPSE_DURATION: 1500,   // 0-1500ms 收拢动画
  SPIN_DURATION: 5000,       // 1500-6500ms 老虎机滚动
  COLLAPSE_EASING: 'cubic-bezier(0.40, 0.80, 0.74, 1.00)',  // 爱奇艺缓动
  SPIN_EASING: 'cubic-bezier(0.06, 0.00, 0.00, 1.00)',      // 急速减速（老虎机）
};

// ===== 加权随机抽（可注入随机源） =====
export function weightedPick(coupons = COUPONS, rand = Math.random) {
  const total = coupons.reduce((s, c) => s + c.weight, 0);
  let r = rand() * total;
  for (const c of coupons) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return coupons[coupons.length - 1];
}

// ===== 保底逻辑：连抽 N 次没出稀有 → 强制出稀有 =====
export class PityCounter {
  constructor(threshold = PITY_THRESHOLD) {
    this.threshold = threshold;
    this.sinceRare = 0;
  }
  apply(expected, rand = Math.random) {
    this.sinceRare += 1;
    if (expected.rare) {
      this.sinceRare = 0;
      return expected;
    }
    if (this.sinceRare >= this.threshold) {
      const rares = COUPONS.filter(c => c.rare);
      const forced = rares[Math.floor(rand() * rares.length)];
      this.sinceRare = 0;
      return forced;
    }
    return expected;
  }
  reset() { this.sinceRare = 0; }
  get state() { return { sinceRare: this.sinceRare, threshold: this.threshold }; }
}

// ===== 每日次数限制 =====
export class DailyLimit {
  static key = 'milkTeaDrawLimit_v1';
  static today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  static load(store) {
    try { return JSON.parse(store.getItem(DailyLimit.key) || '{}'); }
    catch { return {}; }
  }
  static remaining(state, dateStr = DailyLimit.today()) {
    const used = (state[dateStr]?.free || 0) + (state[dateStr]?.bonus || 0);
    return Math.max(0, DAILY_FREE_DRAWS - used);
  }
  static consume(state, dateStr = DailyLimit.today(), kind = 'free') {
    const cur = state[dateStr] || { free: 0, bonus: 0 };
    cur[kind] = (cur[kind] || 0) + 1;
    state[dateStr] = cur;
    return state;
  }
}

// ===== 老虎机 reel 布局计算 =====
// 给定 winnerId, 计算 40 张卡数组, 让 winner 落在 SLOT_WINNER_INDEX
// 用 5 个 P 位置 (P1~P5) 表示, 便于 CSS scale 配合
export class SlotLayout {
  static build(winnerId, total = SLOT_TOTAL_CARDS) {
    const ordered = ARC_ORDER.map(id => COUPONS.find(c => c.id === id));
    const cards = [];
    for (let i = 0; i < total; i++) {
      const idx = i % ordered.length;
      const c = ordered[idx];
      const positionKey = `P${idx + 1}`;
      cards.push({
        id: c.id,
        position: positionKey,  // P1~P5
        tier: POSITION_TIER[positionKey],
      });
    }
    // 重排最后 5 张, 让 winner 落在 SLOT_WINNER_INDEX
    const winnerInOrder = ARC_ORDER.indexOf(winnerId);
    if (winnerInOrder > 0) {
      const last5 = cards.slice(-5);
      const rotated = new Array(5);
      for (let k = 0; k < 5; k++) {
        rotated[k] = last5[(k + winnerInOrder) % 5];
      }
      cards.splice(-5, 5, ...rotated);
    }
    return cards;
  }
  // 给定 cardWidth, 计算最终 translateX
  static finalOffset(cardWidth, winnerIndex = SLOT_WINNER_INDEX) {
    return -(winnerIndex * cardWidth);
  }
}

// ===== 收拢动画：5 张卡从 3 等级 → 统一 S2 大小 =====
// 大g 需求：卡 1、5 上升到 2、4 大小；卡 3 降级到 2、4 大小
// 收拢目标：所有卡 = inner tier (S2 = 1.00x)
export function getCollapsedTier(currentTier) {
  return 'inner';  // 收拢后所有卡都是 inner (S2 = 1.00x)
}

// ===== 滚动方案：5 个 P 位置 + 老虎机视觉 =====
// P 位置对应 ARC_ORDER 索引 (0~4)
// 老虎机滚动后, 中奖卡落在中央 → P3 位置
// 但 P3 位置视觉上最大 (S3 = 1.18x)
// 收拢后所有 P 位置 = inner (S2 = 1.00x), 老虎机滚动靠 translateX 实现
