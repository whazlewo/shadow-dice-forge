import type { ARModifier } from "@/types/character";

/** Parse an AR string like "8/10/6/—/—" into an array of numbers or null (for dashes). */
export function parseAR(ar: string): (number | null)[] {
  return ar.split("/").map((v) => {
    const trimmed = v.trim();
    if (trimmed === "—" || trimmed === "-" || trimmed === "") return null;
    const n = parseInt(trimmed, 10);
    return isNaN(n) ? null : n;
  });
}

/** Parse a modifier values string like "+2/+2/+2/+2/+2" into numbers (0 for unparseable). */
function parseModValues(values: string): number[] {
  return values.split("/").map((v) => {
    const n = parseInt(v.trim(), 10);
    return isNaN(n) ? 0 : n;
  });
}

/** Calculate modified AR from base AR string + modifiers. Returns formatted string and breakdown. */
export function calculateModifiedAR(
  baseAR: string,
  modifiers: ARModifier[] = []
): { modified: string; breakdown: { label: string; values: string }[] } {
  const base = parseAR(baseAR);
  const bands = Math.max(base.length, 5);
  const breakdown: { label: string; values: string }[] = [{ label: "Base", values: baseAR }];

  const totals = Array.from({ length: bands }, (_, i) => base[i] ?? null);

  for (const mod of modifiers) {
    if (!mod.values.trim()) continue;
    const vals = parseModValues(mod.values);
    breakdown.push({ label: mod.source || "Mod", values: mod.values });
    for (let i = 0; i < bands; i++) {
      if (totals[i] !== null) {
        totals[i] = (totals[i] as number) + (vals[i] ?? 0);
      }
    }
  }

  const modified = totals.map((v) => (v === null ? "—" : String(v))).join("/");
  breakdown.push({ label: "Total", values: modified });

  return { modified, breakdown };
}
