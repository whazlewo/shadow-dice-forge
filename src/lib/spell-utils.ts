import type {
  SR6Attributes,
  SR6Skill,
  SR6Quality,
  SR6Augmentation,
  SR6Gear,
  SR6AdeptPower,
  DiceModifier,
  DicePoolBreakdown,
} from "@/types/character";
import type { MagicTradition } from "@/data/magic-traditions";
import { calculateDicePool } from "@/lib/dice-pool";

type ActiveSpellInput = { name: string; dice_modifiers?: DiceModifier[] };

/**
 * Get the Sorcery dice pool for spellcasting tests.
 * Sorcery uses the Magic attribute per SR6 core skills.
 */
export function getSorceryPool(
  attributes: SR6Attributes,
  skills: SR6Skill[],
  qualities: SR6Quality[],
  augmentations: SR6Augmentation[],
  gear: SR6Gear[],
  woundModifier?: number,
  adeptPowers?: SR6AdeptPower[],
  activeSpells?: ActiveSpellInput[]
): DicePoolBreakdown {
  const sorcerySkill = skills.find((s) => s.name === "Sorcery");
  const effectiveSkill: SR6Skill = sorcerySkill || {
    id: "",
    name: "Sorcery",
    attribute: "magic",
    rating: 0,
  };
  return calculateDicePool(
    effectiveSkill,
    attributes,
    qualities,
    augmentations,
    gear,
    undefined,
    woundModifier,
    adeptPowers,
    activeSpells
  );
}

/**
 * Spell Attack Rating = Magic + tradition attribute (Logic or Charisma).
 * Used when comparing AR vs DR for Edge on combat spells.
 */
export function getSpellAttackRating(
  attributes: SR6Attributes,
  tradition: MagicTradition | null
): number | null {
  if (!tradition) return null;
  const magic = Number(attributes.magic) || 0;
  const attrValue = Number(attributes[tradition.attribute]) || 0;
  return magic + attrValue;
}

/**
 * Drain Resistance pool = Willpower + tradition attribute.
 * No modifiers from qualities/augmentations in base SR6.
 */
export function getDrainResistancePool(
  attributes: SR6Attributes,
  tradition: MagicTradition | null
): number | null {
  if (!tradition) return null;
  const wil = Number(attributes.willpower) || 0;
  const attrValue = Number(attributes[tradition.attribute]) || 0;
  return wil + attrValue;
}

/**
 * Base DV for Indirect Combat spells = Magic ÷ 2 (rounded up).
 */
export function getIndirectBaseDV(magic: number): number {
  return Math.ceil(magic / 2);
}
