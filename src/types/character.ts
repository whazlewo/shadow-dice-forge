// SR6 Character types

export interface AttributeSource {
  base: number;
  adjustment: number;
  attribute_points: number;
  karma: number;
}

export type AttributeSources = Partial<Record<keyof SR6CoreAttributes, AttributeSource>>;

export interface SR6CoreAttributes {
  body: number;
  agility: number;
  reaction: number;
  strength: number;
  willpower: number;
  logic: number;
  intuition: number;
  charisma: number;
  edge: number;
  essence: number;
  magic: number;
  resonance: number;
}

export interface SR6Attributes extends SR6CoreAttributes {
  // Derived / secondary stats
  edge_points?: number;
  unarmed?: string;
  initiative?: string;
  matrix_initiative?: string;
  astral_initiative?: string;
  composure?: number;
  judge_intentions?: number;
  memory?: number;
  lift_carry?: string;
  movement?: string;
  defense_rating?: string;
}

export interface SR6Skill {
  id: string;
  name: string;
  attribute: keyof SR6Attributes;
  rating: number;
  specialization?: string;
  expertise?: string;
}

export interface SR6Quality {
  id: string;
  name: string;
  type: "positive" | "negative";
  karma_cost: number;
  effects: string;
  dice_modifiers?: DiceModifier[];
}

/** Condition Monitor tracks Physical, Stun, and Overflow damage */
export interface ConditionMonitor {
  physical_damage: number;
  stun_damage: number;
  overflow_damage: number;
}

export interface DiceModifier {
  skill?: string;
  attribute?: string;
  value: number;
  source: string;
  requires_accessory?: string;
}

export interface ARModifier {
  source: string;
  values: string; // e.g. "+2/+2/+2/+2/+2" or "+0/+0/+0/+1/+1"
}

export interface WeaponAccessory {
  name: string;              // e.g. "Smartgun System (Internal)"
  ar_modifier?: string;      // e.g. "+2/+2/+2/+2/+2" (optional)
  notes?: string;            // free text for other effects
  description?: string;
}

export interface SR6Contact {
  id: string;
  name: string;
  loyalty: number;
  connection: number;
  notes: string;
}

export interface SR6RangedWeapon {
  id: string;
  name: string;
  dv: string;
  ar: string;
  fire_modes: string;
  ammo: string;
  subtype?: string;
  notes?: string;
  description?: string;
  equipped?: boolean;
  accessories?: WeaponAccessory[];
}

export interface SR6MeleeWeapon {
  id: string;
  name: string;
  dv: string;
  ar: string;
  reach: number;
  subtype?: string;
  notes?: string;
  description?: string;
  equipped?: boolean;
  accessories?: WeaponAccessory[];
}

export interface SR6Armor {
  id: string;
  name: string;
  rating: number;
  capacity: number;
  modifications: string;
  subtype?: "body" | "helmet" | "shield";
  notes?: string;
  description?: string;
  equipped?: boolean;
}

export interface SR6MatrixStats {
  device_rating: number;
  attack: number;
  sleaze: number;
  data_processing: number;
  firewall: number;
  programs: string[];
}

export interface SR6Augmentation {
  id: string;
  name: string;
  type: "cyberware" | "bioware";
  essence_cost: number;
  rating: number;
  effects: string;
  notes?: string;
  description?: string;
  dice_modifiers?: DiceModifier[];
}

export interface SR6Gear {
  id: string;
  name: string;
  quantity: number;
  notes: string;
  description?: string;
  dice_modifiers?: DiceModifier[];
  equipped?: boolean;
}

export interface SR6Vehicle {
  id: string;
  name: string;
  handling: string;
  speed: string;
  body: number;
  armor: number;
  sensor: number;
  pilot: number;
  seats: number;
  notes?: string;
  description?: string;
}

export interface SR6Spell {
  id: string;
  name: string;
  category: "spell" | "preparation" | "ritual" | "complex_form";
  type: string;
  drain: string;
  duration: string;
  range: string;
  effects: string;
  description?: string;
}

export interface SR6AdeptPower {
  id: string;
  name: string;
  pp_cost: number;
  effects: string;
  dice_modifiers?: DiceModifier[];
  description?: string;
}

export interface SR6OtherAbility {
  id: string;
  name: string;
  description: string;
}

export interface WizardQuality {
  id: string;
  name: string;
  type: "positive" | "negative";
  karma_cost: number;
  effects: string;
}

// Shared fields for all wizard gear
interface WizardGearBase {
  id: string;
  name: string;
  cost: number;
  quantity: number;
  availability: string;
  equipped?: boolean;
  notes?: string;
}

export interface WizardRangedWeapon extends WizardGearBase {
  category: "ranged_weapon";
  subtype?: string;
  dv: string;
  attack_ratings: string;
  fire_modes: string;
  ammo: string;
  accessories: string;
}

export interface WizardMeleeWeapon extends WizardGearBase {
  category: "melee_weapon";
  subtype?: string;
  dv: string;
  attack_ratings: string;
  reach: number;
}

export interface WizardArmor extends WizardGearBase {
  category: "armor";
  defense_rating: number;
  capacity: number;
  modifications: string;
  subtype?: "body" | "helmet" | "shield";
}

export interface WizardElectronics extends WizardGearBase {
  category: "electronics";
  device_rating: number;
  programs: string;
  notes: string;
}

export type AugmentationType = "cyberware" | "bioware" | "cultured bioware" | "nanotechnology" | "geneware";

export interface WizardAugmentation extends WizardGearBase {
  category: "augmentation";
  aug_type: AugmentationType;
  essence_cost: number;
  rating: number;
  effects: string;
  dice_modifiers: DiceModifier[];
}

export interface WizardVehicle extends WizardGearBase {
  category: "vehicle";
  handling: string;
  speed: string;
  veh_body: number;
  veh_armor: number;
  sensor: number;
  pilot: number;
  seats: number;
}

export interface WizardMiscGear extends WizardGearBase {
  category: "miscellaneous";
  notes: string;
  dice_modifiers: DiceModifier[];
}

export type WizardGearItem =
  | WizardRangedWeapon
  | WizardMeleeWeapon
  | WizardArmor
  | WizardElectronics
  | WizardAugmentation
  | WizardVehicle
  | WizardMiscGear;

export interface SR6Priorities {
  metatype?: string;
  attributes?: string;
  magic_resonance?: string;
  skills?: string;
  resources?: string;
}

export interface SR6PersonalInfo {
  player_name?: string;
  ethnicity?: string;
  age?: number;
  sex?: string;
  height?: string;
  weight?: string;
  street_cred?: number;
  notoriety?: number;
  public_awareness?: number;
  description?: string;
  backstory?: string;
}

export interface SR6IdsLifestyles {
  sins: { id: string; name: string; rating: number }[];
  licenses: { id: string; name: string; rating: number; sin_id: string }[];
  lifestyles: { id: string; name: string; tier: string; months_paid: number }[];
  nuyen: number;
  knowledge_skills?: string[];
  heat?: number;
}

// Dice pool breakdown for display
export interface DicePoolBreakdown {
  skill_name: string;
  attribute_name: string;
  attribute_value: number;
  skill_rating: number;
  modifiers: { source: string; value: number }[];
  total: number;
}

// SR6 core skill list with linked attributes, specializations, and expertise
export const SR6_CORE_SKILLS: {
  name: string;
  attribute: keyof SR6Attributes;
  specializations: string[];
}[] = [
  { name: "Astral", attribute: "intuition", specializations: ["Astral Combat", "Astral Signatures", "Emotional States", "Spirit Types"] },
  { name: "Athletics", attribute: "agility", specializations: ["Archery", "Climbing", "Flying", "Gymnastics", "Sprinting", "Swimming", "Throwing"] },
  { name: "Biotech", attribute: "logic", specializations: ["Biotechnology", "Cybertechnology", "First Aid", "Medicine"] },
  { name: "Close Combat", attribute: "agility", specializations: ["Blades", "Clubs", "Unarmed"] },
  { name: "Con", attribute: "charisma", specializations: ["Acting", "Disguise", "Impersonation", "Performance"] },
  { name: "Conjuring", attribute: "magic", specializations: ["Banishing", "Summoning"] },
  { name: "Cracking", attribute: "logic", specializations: ["Cybercombat", "Electronic Warfare", "Hacking"] },
  { name: "Electronics", attribute: "logic", specializations: ["Computer", "Hardware", "Software"] },
  { name: "Enchanting", attribute: "magic", specializations: ["Alchemy", "Artificing", "Disenchanting"] },
  { name: "Engineering", attribute: "logic", specializations: ["Aeronautics Mechanic", "Armorer", "Automotive Mechanic", "Demolitions", "Gunnery", "Industrial Mechanic", "Lockpicking", "Nautical Mechanic"] },
  { name: "Exotic Weapons", attribute: "agility", specializations: [] },
  { name: "Firearms", attribute: "agility", specializations: ["Tasers", "Hold-Outs", "Light Pistols", "Machine Pistols", "Heavy Pistols", "Submachine Guns", "Shotguns", "Rifles", "Machine Guns", "Assault Cannons"] },
  { name: "Influence", attribute: "charisma", specializations: ["Etiquette", "Instruction", "Intimidation", "Leadership", "Negotiation"] },
  { name: "Outdoors", attribute: "intuition", specializations: ["Navigation", "Survival", "Tracking"] },
  { name: "Perception", attribute: "intuition", specializations: ["Auditory", "Environmental", "Olfactory", "Tactile", "Visual"] },
  { name: "Piloting", attribute: "reaction", specializations: ["Ground Craft", "Aircraft", "Watercraft"] },
  { name: "Sorcery", attribute: "magic", specializations: ["Counterspelling", "Ritual Spellcasting", "Spellcasting"] },
  { name: "Stealth", attribute: "agility", specializations: ["Camouflage", "Palming", "Sneaking"] },
  { name: "Tasking", attribute: "resonance", specializations: ["Compiling", "Decompiling", "Registering"] },
];
