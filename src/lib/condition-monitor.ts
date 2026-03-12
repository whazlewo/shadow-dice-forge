import type { SR6Quality } from "@/types/character";
import { METATYPE_DATA } from "@/data/sr6-reference";

/** Physical Condition Monitor: 8 + (Body ÷ 2, round up) boxes */
export function computePhysicalBoxes(body: number): number {
  return 8 + Math.ceil((body || 0) / 2);
}

/** Stun Condition Monitor: 8 + (Willpower ÷ 2, round up) boxes */
export function computeStunBoxes(willpower: number): number {
  return 8 + Math.ceil((willpower || 0) / 2);
}

/**
 * Parse overflow bonus rank from quality names.
 * High Pain Tolerance: +2 overflow boxes per rank.
 * Built Tough (troll/ork trait): +2 overflow boxes per rank (same effect).
 */
function parseOverflowBonusRank(qualityName: string): number {
  const name = (qualityName || "").trim().toLowerCase();
  if (name.includes("high pain tolerance") || name.includes("built tough")) {
    const match = name.match(/(\d+)\s*$/);
    return match ? Math.max(0, parseInt(match[1], 10)) : 1;
  }
  return 0;
}

/** Overflow boxes: Body × 2 + 2 per High Pain Tolerance / Built Tough rank */
export function computeOverflowBoxes(
  body: number,
  qualities: SR6Quality[],
  metatype?: string
): number {
  const base = (body || 0) * 2;
  const qualityNames = new Set<string>((qualities || []).map((q) => q.name));
  if (metatype) {
    (METATYPE_DATA[metatype]?.racialQualities || []).forEach((q) => qualityNames.add(q));
  }
  const bonus = [...qualityNames].reduce(
    (sum, name) => sum + parseOverflowBonusRank(name) * 2,
    0
  );
  return base + bonus;
}

/**
 * Wound modifier: –1 per 3 boxes filled on each track, cumulative.
 * Does not apply to Damage Resistance tests (GM discretion).
 */
export function computeWoundModifier(physicalDamage: number, stunDamage: number): number {
  const physicalRows = Math.floor((physicalDamage || 0) / 3);
  const stunRows = Math.floor((stunDamage || 0) / 3);
  const total = physicalRows + stunRows;
  return total > 0 ? -total : 0;
}

export function isUnconscious(
  physicalDamage: number,
  stunDamage: number,
  physicalBoxes: number,
  stunBoxes: number
): boolean {
  return physicalDamage >= physicalBoxes || stunDamage >= stunBoxes;
}

export function isDead(overflowDamage: number, overflowBoxes: number): boolean {
  return overflowDamage >= overflowBoxes && overflowBoxes > 0;
}
