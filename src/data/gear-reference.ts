// Gear reference data - imported from YAML at build time
// Edit src/data/gear/*.yaml to add or modify items

import type { GearReference } from "@/types/gear-reference";

import rangedWeapons from "./gear/ranged-weapons.yaml";
import meleeWeapons from "./gear/melee-weapons.yaml";
import armor from "./gear/armor.yaml";
import electronics from "./gear/electronics.yaml";
import augmentations from "./gear/augmentations.yaml";
import vehicles from "./gear/vehicles.yaml";
import drones from "./gear/drones.yaml";
import miscellaneous from "./gear/miscellaneous.yaml";
import weaponAccessories from "./gear/weapon-accessories.yaml";

export const GEAR_REFERENCE: GearReference = {
  rangedWeapons: rangedWeapons as GearReference["rangedWeapons"],
  meleeWeapons: meleeWeapons as GearReference["meleeWeapons"],
  armor: armor as GearReference["armor"],
  electronics: electronics as GearReference["electronics"],
  augmentations: augmentations as GearReference["augmentations"],
  vehicles: [...(vehicles as GearReference["vehicles"]), ...(drones as GearReference["vehicles"])],
  miscellaneous: miscellaneous as GearReference["miscellaneous"],
};

export const WEAPON_ACCESSORIES_REFERENCE =
  weaponAccessories as import("@/types/gear-reference").ReferenceWeaponAccessory[];
