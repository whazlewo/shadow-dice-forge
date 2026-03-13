// Magic reference types - match YAML schema for spells, adept powers, complex forms

import type { DiceModifier } from "./character";

export type SpellCategory = "spell" | "ritual";
export type SpellType = "Combat" | "Detection" | "Health" | "Illusion" | "Manipulation";
export type DamageType = "Direct" | "Indirect";

export interface ReferenceSpell {
  name: string;
  category: SpellCategory;
  type: SpellType;
  damage_type?: DamageType;
  drain: string;
  duration: string;
  range: string;
  effects: string;
  source?: string;
  description?: string;
}

export interface ReferenceAdeptPower {
  name: string;
  pp_cost: number;
  effects: string;
  dice_modifiers?: DiceModifier[];
  source?: string;
  description?: string;
}

export interface ReferenceComplexForm {
  name: string;
  fade: string;
  duration: string;
  range: string;
  effects: string;
  source?: string;
  description?: string;
}
