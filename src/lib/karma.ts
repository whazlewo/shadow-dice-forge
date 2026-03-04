import type { KarmaTransaction } from "@/types/karma";

export function computeKarmaSummary(ledger: KarmaTransaction[]) {
  let totalEarned = 0;
  let totalSpent = 0;

  for (const tx of ledger) {
    if (tx.undone) continue;
    if (tx.type === "earned") totalEarned += tx.amount;
    else if (tx.type === "spent") totalSpent += tx.amount;
    else if (tx.type === "refund") totalEarned += tx.amount;
  }

  return {
    total: totalEarned,
    spent: totalSpent,
    available: totalEarned - totalSpent,
  };
}

export function attributeKarmaCost(newRating: number): number {
  return newRating * 5;
}

export function skillKarmaCost(newRating: number): number {
  return newRating * 5;
}

export const SPECIALIZATION_KARMA_COST = 5;
export const EXPERTISE_KARMA_COST = 5;
