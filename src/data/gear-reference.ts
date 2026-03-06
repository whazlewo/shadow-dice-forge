// Gear reference data - imported from YAML at build time
// Edit src/data/gear/*.yaml to add or modify items

import type { GearReference } from "@/types/gear-reference";

// @ts-expect-error - YAML import via vite-plugin-yaml
import rangedWeapons from "./gear/ranged-weapons.yaml";
// @ts-expect-error - YAML import via vite-plugin-yaml
import meleeWeapons from "./gear/melee-weapons.yaml";
// @ts-expect-error - YAML import via vite-plugin-yaml
import armor from "./gear/armor.yaml";
// @ts-expect-error - YAML import via vite-plugin-yaml
import electronics from "./gear/electronics.yaml";
// @ts-expect-error - YAML import via vite-plugin-yaml
import augmentations from "./gear/augmentations.yaml";
// @ts-expect-error - YAML import via vite-plugin-yaml
import vehicles from "./gear/vehicles.yaml";
// @ts-expect-error - YAML import via vite-plugin-yaml
import drones from "./gear/drones.yaml";
// @ts-expect-error - YAML import via vite-plugin-yaml
import miscellaneous from "./gear/miscellaneous.yaml";

export const GEAR_REFERENCE: GearReference = {
  rangedWeapons: rangedWeapons as GearReference["rangedWeapons"],
  meleeWeapons: meleeWeapons as GearReference["meleeWeapons"],
  armor: armor as GearReference["armor"],
  electronics: electronics as GearReference["electronics"],
  augmentations: augmentations as GearReference["augmentations"],
  vehicles: [...(vehicles as GearReference["vehicles"]), ...(drones as GearReference["vehicles"])],
  miscellaneous: miscellaneous as GearReference["miscellaneous"],
};
