// test.mjs - 传招冷饮 5 张奶茶券抽奖逻辑测试
// 用 Node 22+ 的 assert / node:test 跑
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  COUPONS, ARC_ORDER, TIER_SCALE, POSITION_TIER,
  SLOT_TOTAL_CARDS, SLOT_WINNER_INDEX, RARE_WEIGHT_THRESHOLD,
  DAILY_FREE_DRAWS, PITY_THRESHOLD,
  weightedPick, PityCounter, DailyLimit, SlotLayout, getCollapsedTier,
} from './game.js';

// ===== 1. 数据完整性 =====
test('COUPONS: 5 张奶茶券', () => {
  assert.equal(COUPONS.length, 5);
  const ids = COUPONS.map(c => c.id);
  assert.deepEqual(ids.sort(), ['C1', 'C2', 'C3', 'C4', 'C5']);
});

test('COUPONS: 每张都有 name/discount/prob/weight/rare', () => {
  for (const c of COUPONS) {
    assert.ok(c.name, `${c.id} 缺 name`);
    assert.ok(c.discount, `${c.id} 缺 discount`);
    assert.ok(c.prob > 0, `${c.id} 缺 prob`);
    assert.ok(c.weight > 0, `${c.id} 缺 weight`);
    assert.ok(typeof c.rare === 'boolean', `${c.id} 缺 rare`);
  }
});

test('COUPONS: 5 折必须是 C5（最高优惠在中央）', () => {
  const c5 = COUPONS.find(c => c.id === 'C5');
  assert.equal(c5.discount, '5折', '5 折必须是 C5');
  assert.equal(c5.rare, true, 'C5 必须是 rare');
});

test('COUPONS: 概率总和 = 100%', () => {
  const total = COUPONS.reduce((s, c) => s + c.prob, 0);
  assert.equal(total, 100, `概率总和 ${total} ≠ 100`);
});

// ===== 2. ARC_ORDER + POSITION_TIER 一致性 =====
test('ARC_ORDER: C1-C3-C5-C4-C2（5 折居中）', () => {
  assert.deepEqual(ARC_ORDER, ['C1', 'C3', 'C5', 'C4', 'C2']);
});

test('POSITION_TIER: P3(center) = C5 所在的中央位置', () => {
  assert.equal(POSITION_TIER.P3, 'center');
});

test('TIER_SCALE: outer < inner < center', () => {
  assert.ok(TIER_SCALE.outer < TIER_SCALE.inner);
  assert.ok(TIER_SCALE.inner < TIER_SCALE.center);
});

// ===== 3. 加权随机抽 =====
test('weightedPick: 10000 次抽样 → 5 折 C5 命中率 ≈ 5%', () => {
  let c5 = 0;
  for (let i = 0; i < 10000; i++) {
    if (weightedPick().id === 'C5') c5++;
  }
  const rate = c5 / 10000;
  assert.ok(rate > 0.03 && rate < 0.07, `C5 命中率 ${rate.toFixed(4)} 应在 [0.03, 0.07]`);
});

test('weightedPick: 注入固定随机源可预测', () => {
  const c = weightedPick(COUPONS, () => 0);
  assert.equal(c.id, 'C1');  // 第一个 weight 段
});

// ===== 4. 保底逻辑 =====
test('PityCounter: 10 次未出稀有 → 第 10 次强制出稀有', () => {
  const pity = new PityCounter(10);
  let nonRare = true;
  for (let i = 0; i < 9; i++) {
    const r = pity.apply({ id: 'C1', rare: false });
    if (r.rare) { nonRare = false; break; }
  }
  assert.ok(nonRare, '前 9 次不应该触发保底');
  // 第 10 次：输入 C1（common），应该被强制改成 rare
  const forced = pity.apply({ id: 'C1', rare: false });
  assert.equal(forced.rare, true, '第 10 次必须强制出稀有');
});

test('PityCounter: 出了稀有 → 计数器归零', () => {
  const pity = new PityCounter(10);
  pity.apply({ id: 'C5', rare: true });
  assert.equal(pity.state.sinceRare, 0);
});

// ===== 5. 每日次数限制 =====
test('DailyLimit: 初始剩余 3 次', () => {
  const state = {};
  assert.equal(DailyLimit.remaining(state), 3);
});

test('DailyLimit: 用 1 次后剩 2 次', () => {
  const state = {};
  DailyLimit.consume(state, '2026-06-15', 'free');
  assert.equal(DailyLimit.remaining(state, '2026-06-15'), 2);
});

test('DailyLimit: 用 3 次后剩 0 次', () => {
  const state = {};
  DailyLimit.consume(state, '2026-06-15', 'free');
  DailyLimit.consume(state, '2026-06-15', 'free');
  DailyLimit.consume(state, '2026-06-15', 'free');
  assert.equal(DailyLimit.remaining(state, '2026-06-15'), 0);
});

test('DailyLimit: 不消耗负数', () => {
  const state = {};
  for (let i = 0; i < 5; i++) DailyLimit.consume(state, '2026-06-15', 'free');
  assert.equal(DailyLimit.remaining(state, '2026-06-15'), 0);
});

// ===== 6. 老虎机 reel 布局 =====
test('SlotLayout: build() 返回 40 张卡', () => {
  const cards = SlotLayout.build('C5');
  assert.equal(cards.length, SLOT_TOTAL_CARDS);
});

test('SlotLayout: winner=C5 → 第 36 张（index 35）是 C5', () => {
  const cards = SlotLayout.build('C5');
  assert.equal(cards[SLOT_WINNER_INDEX].id, 'C5');
});

test('SlotLayout: winner=C1 → 第 36 张是 C1', () => {
  const cards = SlotLayout.build('C1');
  assert.equal(cards[SLOT_WINNER_INDEX].id, 'C1');
});

test('SlotLayout: 所有卡有 position + tier', () => {
  const cards = SlotLayout.build('C5');
  for (const c of cards) {
    assert.ok(c.position.match(/^P[1-5]$/));
    assert.ok(['outer', 'inner', 'center'].includes(c.tier));
  }
});

test('SlotLayout: P3 位置对应 center tier', () => {
  const cards = SlotLayout.build('C5');
  const p3 = cards.filter(c => c.position === 'P3');
  assert.ok(p3.length > 0);
  for (const c of p3) assert.equal(c.tier, 'center');
});

test('SlotLayout: finalOffset 返回负数（向左偏移）', () => {
  const offset = SlotLayout.finalOffset(116);
  assert.ok(offset < 0);
});

// ===== 7. 收拢动画 =====
test('getCollapsedTier: 任何 tier → 收拢后都是 inner', () => {
  assert.equal(getCollapsedTier('outer'), 'inner');
  assert.equal(getCollapsedTier('inner'), 'inner');
  assert.equal(getCollapsedTier('center'), 'inner');
});
