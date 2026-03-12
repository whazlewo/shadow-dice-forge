// Convert magic reference items to character sheet format

import type { ReferenceSpell, ReferenceAdeptPower, ReferenceComplexForm } from "@/types/magic-reference";
import type { SR6Spell, SR6AdeptPower } from "@/types/character";

export function referenceToCharacterSpell(ref: ReferenceSpell): SR6Spell {
  return {
    id: crypto.randomUUID(),
    name: ref.name,
    category: ref.category,
    type: ref.type,
    drain: ref.drain,
    duration: ref.duration,
    range: ref.range,
    effects: ref.effects,
    description: ref.description,
  };
}

export function referenceToCharacterAdeptPower(ref: ReferenceAdeptPower): SR6AdeptPower {
  return {
    id: crypto.randomUUID(),
    name: ref.name,
    pp_cost: ref.pp_cost,
    effects: ref.effects,
    dice_modifiers: ref.dice_modifiers ?? [],
    description: ref.description,
  };
}

export function referenceToCharacterComplexForm(ref: ReferenceComplexForm): SR6Spell {
  return {
    id: crypto.randomUUID(),
    name: ref.name,
    category: "complex_form",
    type: "Complex Form",
    drain: ref.fade,
    duration: ref.duration,
    range: ref.range,
    effects: ref.effects,
    description: ref.description,
  };
}

/**
 * Mystic adept spell slots: (Magic - powerPointsSpent) * 2
 * Power points spent must be <= Magic.
 */
export function getMysticAdeptSpellSlots(magic: number, powerPointsSpent: number): number {
  if (powerPointsSpent >= magic) return 0;
  return Math.floor((magic - powerPointsSpent) * 2);
}
