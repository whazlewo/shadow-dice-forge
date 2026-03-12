// Reference gear types - match YAML schema (no id, includes description/source)
// Used for the gear dropdown; items are converted to WizardGearItem/SR6* when selected

import type { DiceModifier } from "./character";

export interface ReferenceRangedWeapon {
  name: string;
  subtype?: string;
  cost: number;
  availability: string;
  dv: string;
  ar: string;
  fire_modes: string;
  ammo: string;
  accessories?: { name: string; ar_modifier?: string; notes?: string }[];
  source?: string;
  notes?: string;
  description?: string;
}

export interface ReferenceMeleeWeapon {
  name: string;
  subtype?: string;
  cost: number;
  availability: string;
  dv: string;
  ar: string;
  reach: number;
  source?: string;
  notes?: string;
  description?: string;
}

export interface ReferenceArmor {
  name: string;
  subtype?: "body" | "helmet" | "shield";
  cost: number;
  availability: string;
  rating: number;
  capacity: number;
  modifications: string;
  source?: string;
  notes?: string;
  description?: string;
}

export interface ReferenceElectronics {
  name: string;
  cost: number;
  availability: string;
  device_rating: number;
  programs: string;
  notes: string;
  source?: string;
  description?: string;
}

export interface ReferenceAugmentation {
  name: string;
  cost: number;
  availability: string;
  aug_type: "cyberware" | "bioware";
  essence_cost: number;
  rating: number;
  effects: string;
  dice_modifiers: DiceModifier[];
  exclusion_group?: string;
  source?: string;
  notes?: string;
  description?: string;
}

export interface ReferenceVehicle {
  name: string;
  cost: number;
  availability: string;
  handling: string;
  speed: string;
  body: number;
  armor: number;
  sensor: number;
  pilot: number;
  seats: number;
  source?: string;
  notes?: string;
  description?: string;
}

export interface ReferenceMiscGear {
  name: string;
  cost: number;
  availability: string;
  notes: string;
  dice_modifiers: DiceModifier[];
  source?: string;
  description?: string;
}

export type WeaponAccessoryMount = "top" | "barrel" | "underbarrel" | "other";

export interface ReferenceWeaponAccessory {
  name: string;
  cost: number;
  availability: string;
  mount: WeaponAccessoryMount;
  ar_modifier?: string;
  ar_modifier_wireless?: string;
  dice_modifiers?: DiceModifier[];
  notes?: string;
  description?: string;
  source?: string;
}

export interface GearReference {
  rangedWeapons: ReferenceRangedWeapon[];
  meleeWeapons: ReferenceMeleeWeapon[];
  armor: ReferenceArmor[];
  electronics: ReferenceElectronics[];
  augmentations: ReferenceAugmentation[];
  vehicles: ReferenceVehicle[];
  miscellaneous: ReferenceMiscGear[];
}

export type GearCategory = keyof GearReference;
