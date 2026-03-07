// Convert reference items to WizardGearItem / character sheet format

export const GEAR_REF_CATEGORY_TO_WIZARD: Record<
  import("@/types/gear-reference").GearCategory,
  import("@/types/character").WizardGearItem["category"]
> = {
  rangedWeapons: "ranged_weapon",
  meleeWeapons: "melee_weapon",
  armor: "armor",
  electronics: "electronics",
  augmentations: "augmentation",
  vehicles: "vehicle",
  miscellaneous: "miscellaneous",
};

import type {
  ReferenceRangedWeapon,
  ReferenceMeleeWeapon,
  ReferenceArmor,
  ReferenceElectronics,
  ReferenceAugmentation,
  ReferenceVehicle,
  ReferenceMiscGear,
} from "@/types/gear-reference";
import type {
  WizardRangedWeapon,
  WizardMeleeWeapon,
  WizardArmor,
  WizardElectronics,
  WizardAugmentation,
  WizardVehicle,
  WizardMiscGear,
  WizardGearItem,
} from "@/types/character";

function baseItem(cost: number, availability: string) {
  return {
    id: crypto.randomUUID(),
    cost,
    quantity: 1,
    availability,
    equipped: true,
  };
}

export function referenceToWizardRanged(r: ReferenceRangedWeapon): WizardRangedWeapon & { notes?: string; description?: string } {
  return {
    ...baseItem(r.cost, r.availability),
    name: r.name,
    category: "ranged_weapon",
    subtype: r.subtype,
    dv: r.dv,
    attack_ratings: r.ar,
    fire_modes: r.fire_modes,
    ammo: r.ammo,
    accessories: Array.isArray(r.accessories)
      ? r.accessories.map((a) => (typeof a === "string" ? a : a.name)).filter(Boolean).join(", ")
      : "",
    notes: r.notes,
    description: r.description,
  };
}

export function referenceToWizardMelee(r: ReferenceMeleeWeapon): WizardMeleeWeapon & { notes?: string; description?: string } {
  return {
    ...baseItem(r.cost, r.availability),
    name: r.name,
    category: "melee_weapon",
    subtype: r.subtype,
    dv: r.dv,
    attack_ratings: r.ar,
    reach: r.reach ?? 0,
    notes: r.notes,
    description: r.description,
  };
}

export function referenceToWizardArmor(r: ReferenceArmor): WizardArmor & { notes?: string; description?: string } {
  return {
    ...baseItem(r.cost, r.availability),
    name: r.name,
    category: "armor",
    defense_rating: r.rating,
    capacity: r.capacity,
    modifications: r.modifications ?? "",
    subtype: r.subtype ?? "body",
    notes: r.notes,
    description: r.description,
  };
}

export function referenceToWizardElectronics(r: ReferenceElectronics): WizardElectronics & { description?: string } {
  return {
    ...baseItem(r.cost, r.availability),
    name: r.name,
    category: "electronics",
    device_rating: r.device_rating,
    programs: r.programs ?? "",
    notes: r.notes ?? "",
    description: r.description,
  };
}

export function referenceToWizardAugmentation(r: ReferenceAugmentation): WizardAugmentation & { notes?: string; description?: string } {
  return {
    ...baseItem(r.cost, r.availability),
    name: r.name,
    category: "augmentation",
    aug_type: r.aug_type,
    essence_cost: r.essence_cost,
    rating: r.rating,
    effects: r.effects ?? "",
    dice_modifiers: r.dice_modifiers ?? [],
    notes: r.notes,
    description: r.description,
  };
}

export function referenceToWizardVehicle(r: ReferenceVehicle): WizardVehicle & { notes?: string; description?: string } {
  return {
    ...baseItem(r.cost, r.availability),
    name: r.name,
    category: "vehicle",
    handling: r.handling ?? "",
    speed: r.speed ?? "",
    veh_body: r.body ?? 0,
    veh_armor: r.armor ?? 0,
    sensor: r.sensor ?? 0,
    pilot: r.pilot ?? 0,
    seats: r.seats ?? 1,
    notes: r.notes,
    description: r.description,
  };
}

export function referenceToWizardMisc(r: ReferenceMiscGear): WizardMiscGear & { description?: string } {
  return {
    ...baseItem(r.cost, r.availability),
    name: r.name,
    category: "miscellaneous",
    notes: r.notes ?? "",
    dice_modifiers: r.dice_modifiers ?? [],
    description: r.description,
  };
}

export function referenceToWizardItem(
  category: keyof import("@/types/gear-reference").GearReference,
  ref: ReferenceRangedWeapon | ReferenceMeleeWeapon | ReferenceArmor | ReferenceElectronics | ReferenceAugmentation | ReferenceVehicle | ReferenceMiscGear
): WizardGearItem {
  switch (category) {
    case "rangedWeapons":
      return referenceToWizardRanged(ref as ReferenceRangedWeapon);
    case "meleeWeapons":
      return referenceToWizardMelee(ref as ReferenceMeleeWeapon);
    case "armor":
      return referenceToWizardArmor(ref as ReferenceArmor);
    case "electronics":
      return referenceToWizardElectronics(ref as ReferenceElectronics);
    case "augmentations":
      return referenceToWizardAugmentation(ref as ReferenceAugmentation);
    case "vehicles":
      return referenceToWizardVehicle(ref as ReferenceVehicle);
    case "miscellaneous":
      return referenceToWizardMisc(ref as ReferenceMiscGear);
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

// Convert reference to character sheet format (for GenericListTab)
export function referenceToCharacterRanged(r: ReferenceRangedWeapon) {
  return {
    id: crypto.randomUUID(),
    name: r.name,
    subtype: r.subtype,
    dv: r.dv,
    ar: r.ar,
    fire_modes: r.fire_modes,
    ammo: r.ammo,
    notes: r.notes,
    description: r.description,
    equipped: true,
    accessories: r.accessories ?? [],
  };
}

export function referenceToCharacterMelee(r: ReferenceMeleeWeapon) {
  return {
    id: crypto.randomUUID(),
    name: r.name,
    subtype: r.subtype,
    dv: r.dv,
    ar: r.ar,
    reach: r.reach ?? 0,
    notes: r.notes,
    description: r.description,
    equipped: true,
    accessories: [],
  };
}

export function referenceToCharacterArmor(r: ReferenceArmor) {
  return {
    id: crypto.randomUUID(),
    name: r.name,
    subtype: r.subtype ?? "body",
    rating: r.rating,
    capacity: r.capacity,
    modifications: r.modifications ?? "",
    notes: r.notes,
    description: r.description,
    equipped: true,
  };
}

export function referenceToCharacterAugmentation(r: ReferenceAugmentation) {
  return {
    id: crypto.randomUUID(),
    name: r.name,
    type: r.aug_type,
    essence_cost: r.essence_cost,
    rating: r.rating,
    effects: r.effects,
    notes: r.notes,
    dice_modifiers: r.dice_modifiers ?? [],
    description: r.description,
  };
}

export function referenceToCharacterGear(r: ReferenceMiscGear) {
  return {
    id: crypto.randomUUID(),
    name: r.name,
    quantity: 1,
    notes: r.notes,
    dice_modifiers: r.dice_modifiers ?? [],
    description: r.description,
    equipped: true,
  };
}

export function referenceToCharacterVehicle(r: ReferenceVehicle) {
  return {
    id: crypto.randomUUID(),
    name: r.name,
    handling: r.handling,
    speed: r.speed,
    body: r.body,
    armor: r.armor,
    sensor: r.sensor,
    pilot: r.pilot,
    seats: r.seats,
    notes: r.notes,
    description: r.description,
  };
}
