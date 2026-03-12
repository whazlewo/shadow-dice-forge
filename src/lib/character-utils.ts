// Character utilities - magic type inference, etc.

export type MagicType =
  | "mundane"
  | "full"
  | "aspected"
  | "mystic_adept"
  | "adept"
  | "technomancer";

const VALID_MAGIC_TYPES: MagicType[] = [
  "mundane",
  "full",
  "aspected",
  "mystic_adept",
  "adept",
  "technomancer",
];

export function inferMagicType(character: {
  attributes?: { magic?: number; resonance?: number };
  spells?: Array<{ category?: string }>;
  adept_powers?: unknown[];
  priorities?: { magic_type?: string };
}): MagicType {
  const stored = character.priorities?.magic_type;
  if (stored && VALID_MAGIC_TYPES.includes(stored as MagicType)) {
    return stored as MagicType;
  }

  const magic = Number(character.attributes?.magic) || 0;
  const resonance = Number(character.attributes?.resonance) || 0;
  const spells = character.spells || [];
  const adeptPowers = character.adept_powers || [];
  const hasSpells = spells.some((s: { category?: string }) => s.category !== "complex_form");
  const hasComplexForms = spells.some((s: { category?: string }) => s.category === "complex_form");
  const hasAdeptPowers = adeptPowers.length > 0;

  if (resonance > 0) return "technomancer";
  if (magic > 0 && hasAdeptPowers && hasSpells) return "mystic_adept";
  if (magic > 0 && hasAdeptPowers) return "adept";
  if (magic > 0 && (hasSpells || hasComplexForms)) return "full";
  return "mundane";
}
