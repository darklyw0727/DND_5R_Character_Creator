// 能力值規則常數（XPHB 2024）

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

// Point buy 費用表（分數 → 點數花費）
export const POINT_BUY_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}

export const POINT_BUY_TOTAL = 27
export const POINT_BUY_MIN = 8
export const POINT_BUY_MAX = 15

// 修正值計算
export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function formatModifier(score: number): string {
  const mod = getModifier(score)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

// Proficiency Bonus
export function getProficiencyBonus(totalLevel: number): number {
  return Math.ceil(totalLevel / 4) + 1
}

// ─── 多職業法術槽位表（XPHB） ─────────────────────────────────
// 等效施法者等級 → [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
export const MULTICLASS_SPELL_SLOTS: Record<number, number[]> = {
  1:  [2,0,0,0,0,0,0,0,0],
  2:  [3,0,0,0,0,0,0,0,0],
  3:  [4,2,0,0,0,0,0,0,0],
  4:  [4,3,0,0,0,0,0,0,0],
  5:  [4,3,2,0,0,0,0,0,0],
  6:  [4,3,3,0,0,0,0,0,0],
  7:  [4,3,3,1,0,0,0,0,0],
  8:  [4,3,3,2,0,0,0,0,0],
  9:  [4,3,3,3,1,0,0,0,0],
  10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0],
  12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0],
  14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0],
  16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1],
  18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1],
  20: [4,3,3,3,3,2,2,1,1],
}

// 單職業法術槽位表（Full Caster）
export const FULL_CASTER_SLOTS: Record<number, number[]> = {
  1:  [2,0,0,0,0,0,0,0,0],
  2:  [3,0,0,0,0,0,0,0,0],
  3:  [4,2,0,0,0,0,0,0,0],
  4:  [4,3,0,0,0,0,0,0,0],
  5:  [4,3,2,0,0,0,0,0,0],
  6:  [4,3,3,0,0,0,0,0,0],
  7:  [4,3,3,1,0,0,0,0,0],
  8:  [4,3,3,2,0,0,0,0,0],
  9:  [4,3,3,3,1,0,0,0,0],
  10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0],
  12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0],
  14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0],
  16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1],
  18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1],
  20: [4,3,3,3,3,2,2,1,1],
}

// Half Caster（Paladin / Ranger）— Pactbound Artificer 同
export const HALF_CASTER_SLOTS: Record<number, number[]> = {
  1:  [0,0,0,0,0,0,0,0,0],
  2:  [2,0,0,0,0,0,0,0,0],
  3:  [3,0,0,0,0,0,0,0,0],
  4:  [3,0,0,0,0,0,0,0,0],
  5:  [4,2,0,0,0,0,0,0,0],
  6:  [4,2,0,0,0,0,0,0,0],
  7:  [4,3,0,0,0,0,0,0,0],
  8:  [4,3,0,0,0,0,0,0,0],
  9:  [4,3,2,0,0,0,0,0,0],
  10: [4,3,2,0,0,0,0,0,0],
  11: [4,3,3,0,0,0,0,0,0],
  12: [4,3,3,0,0,0,0,0,0],
  13: [4,3,3,1,0,0,0,0,0],
  14: [4,3,3,1,0,0,0,0,0],
  15: [4,3,3,2,0,0,0,0,0],
  16: [4,3,3,2,0,0,0,0,0],
  17: [4,3,3,3,1,0,0,0,0],
  18: [4,3,3,3,1,0,0,0,0],
  19: [4,3,3,3,2,0,0,0,0],
  20: [4,3,3,3,2,0,0,0,0],
}

// Warlock Pact Slots：[slots, slot_level]
export const WARLOCK_PACT_SLOTS: Record<number, [number, number]> = {
  1:  [1,1], 2: [2,1], 3: [2,2], 4: [2,2], 5: [2,3],
  6:  [2,3], 7: [2,4], 8: [2,4], 9: [2,5], 10: [2,5],
  11: [3,5], 12: [3,5], 13: [3,5], 14: [3,5], 15: [3,5],
  16: [3,5], 17: [4,5], 18: [4,5], 19: [4,5], 20: [4,5],
}

// 能力值標籤
export const ABILITY_LABELS: Record<string, { short: string; long: string; zh: string }> = {
  str: { short: 'STR', long: 'Strength',     zh: '力量' },
  dex: { short: 'DEX', long: 'Dexterity',    zh: '敏捷' },
  con: { short: 'CON', long: 'Constitution', zh: '體質' },
  int: { short: 'INT', long: 'Intelligence', zh: '智力' },
  wis: { short: 'WIS', long: 'Wisdom',       zh: '感知' },
  cha: { short: 'CHA', long: 'Charisma',     zh: '魅力' },
}

export const ABILITY_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
