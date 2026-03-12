// SR6 Character Creation Reference Data

import type { SR6Attributes, SR6CoreAttributes } from "@/types/character";

// Priority table: each priority level maps to values for each column
export type PriorityLevel = "A" | "B" | "C" | "D" | "E";
export type PriorityColumn = "metatype" | "attributes" | "skills" | "magic_resonance" | "resources";

export interface PriorityMetatypeEntry {
  metatypes: string[];
  adjustmentPoints: number;
}

export interface PriorityMagicEntry {
  label: string;
  type: "mundane" | "full" | "aspected" | "mystic_adept" | "adept" | "technomancer";
  magicOrResonance: number;
}

export interface PriorityRow {
  metatype: PriorityMetatypeEntry;
  attributes: number;
  skills: number;
  magic_resonance: PriorityMagicEntry[];
  resources: number;
}

export const PRIORITY_TABLE: Record<PriorityLevel, PriorityRow> = {
  A: {
    metatype: { metatypes: ["Dwarf", "Ork", "Troll"], adjustmentPoints: 13 },
    attributes: 24,
    skills: 32,
    magic_resonance: [
      { label: "Full Magician (Magic 4)", type: "full", magicOrResonance: 4 },
      { label: "Aspected Magician (Magic 5)", type: "aspected", magicOrResonance: 5 },
      { label: "Mystic Adept (Magic 4)", type: "mystic_adept", magicOrResonance: 4 },
      { label: "Adept (Magic 4)", type: "adept", magicOrResonance: 4 },
      { label: "Technomancer (Resonance 4)", type: "technomancer", magicOrResonance: 4 },
    ],
    resources: 450000,
  },
  B: {
    metatype: { metatypes: ["Dwarf", "Elf", "Ork", "Troll"], adjustmentPoints: 11 },
    attributes: 16,
    skills: 24,
    magic_resonance: [
      { label: "Full Magician (Magic 3)", type: "full", magicOrResonance: 3 },
      { label: "Aspected Magician (Magic 4)", type: "aspected", magicOrResonance: 4 },
      { label: "Mystic Adept (Magic 3)", type: "mystic_adept", magicOrResonance: 3 },
      { label: "Adept (Magic 3)", type: "adept", magicOrResonance: 3 },
      { label: "Technomancer (Resonance 3)", type: "technomancer", magicOrResonance: 3 },
    ],
    resources: 275000,
  },
  C: {
    metatype: { metatypes: ["Dwarf", "Elf", "Human", "Ork", "Troll"], adjustmentPoints: 9 },
    attributes: 12,
    skills: 20,
    magic_resonance: [
      { label: "Full Magician (Magic 2)", type: "full", magicOrResonance: 2 },
      { label: "Aspected Magician (Magic 3)", type: "aspected", magicOrResonance: 3 },
      { label: "Mystic Adept (Magic 2)", type: "mystic_adept", magicOrResonance: 2 },
      { label: "Adept (Magic 2)", type: "adept", magicOrResonance: 2 },
      { label: "Technomancer (Resonance 2)", type: "technomancer", magicOrResonance: 2 },
    ],
    resources: 150000,
  },
  D: {
    metatype: { metatypes: ["Dwarf", "Elf", "Human", "Ork", "Troll"], adjustmentPoints: 4 },
    attributes: 8,
    skills: 16,
    magic_resonance: [
      { label: "Full Magician (Magic 1)", type: "full", magicOrResonance: 1 },
      { label: "Aspected Magician (Magic 2)", type: "aspected", magicOrResonance: 2 },
      { label: "Mystic Adept (Magic 1)", type: "mystic_adept", magicOrResonance: 1 },
      { label: "Adept (Magic 1)", type: "adept", magicOrResonance: 1 },
      { label: "Technomancer (Resonance 1)", type: "technomancer", magicOrResonance: 1 },
    ],
    resources: 50000,
  },
  E: {
    metatype: { metatypes: ["Dwarf", "Elf", "Human", "Ork", "Troll"], adjustmentPoints: 1 },
    attributes: 2,
    skills: 10,
    magic_resonance: [
      { label: "Mundane", type: "mundane", magicOrResonance: 0 },
    ],
    resources: 8000,
  },
};

// Metatype attribute limits [min, max]
export interface MetatypeData {
  name: string;
  attributes: Record<keyof Omit<SR6CoreAttributes, "edge" | "essence" | "magic" | "resonance">, [number, number]>;
  edge: [number, number];
  racialQualities: string[];
  // Which attributes can be raised with adjustment points (those above 6, plus edge)
  adjustableAttributes: (keyof SR6Attributes)[];
}

export const METATYPE_DATA: Record<string, MetatypeData> = {
  Human: {
    name: "Human",
    attributes: {
      body: [1, 6], agility: [1, 6], reaction: [1, 6], strength: [1, 6],
      willpower: [1, 6], logic: [1, 6], intuition: [1, 6], charisma: [1, 6],
    },
    edge: [1, 7],
    racialQualities: [],
    adjustableAttributes: ["edge"],
  },
  Dwarf: {
    name: "Dwarf",
    attributes: {
      body: [1, 7], agility: [1, 6], reaction: [1, 5], strength: [1, 8],
      willpower: [1, 7], logic: [1, 6], intuition: [1, 6], charisma: [1, 6],
    },
    edge: [1, 6],
    racialQualities: ["Toxin Resistance", "Thermographic Vision"],
    adjustableAttributes: ["edge", "body", "strength", "willpower"],
  },
  Elf: {
    name: "Elf",
    attributes: {
      body: [1, 6], agility: [1, 7], reaction: [1, 6], strength: [1, 6],
      willpower: [1, 6], logic: [1, 6], intuition: [1, 6], charisma: [1, 8],
    },
    edge: [1, 6],
    racialQualities: ["Low-light Vision"],
    adjustableAttributes: ["edge", "agility", "charisma"],
  },
  Ork: {
    name: "Ork",
    attributes: {
      body: [1, 8], agility: [1, 6], reaction: [1, 6], strength: [1, 8],
      willpower: [1, 6], logic: [1, 6], intuition: [1, 6], charisma: [1, 5],
    },
    edge: [1, 6],
    racialQualities: ["Low-light Vision", "Built Tough 1"],
    adjustableAttributes: ["edge", "body", "strength"],
  },
  Troll: {
    name: "Troll",
    attributes: {
      body: [1, 9], agility: [1, 5], reaction: [1, 6], strength: [1, 9],
      willpower: [1, 6], logic: [1, 6], intuition: [1, 6], charisma: [1, 5],
    },
    edge: [1, 6],
    racialQualities: ["Dermal Deposits", "Thermographic Vision", "Built Tough 2"],
    adjustableAttributes: ["edge", "body", "strength"],
  },
};

/** Brief skill descriptions for tooltips */
export const SKILL_DESCRIPTIONS: Record<string, string> = {
  Astral: "Navigating and interacting with the astral plane, including astral combat and projection.",
  Athletics: "Running, climbing, swimming, jumping, and other physical feats of coordination.",
  Biotech: "First aid, medicine, cybertechnology, and biotechnology knowledge.",
  "Close Combat": "Melee fighting with blades, clubs, unarmed strikes, and other close-range weapons.",
  Con: "Deception, disguise, impersonation, and fast-talking.",
  Conjuring: "Summoning, binding, and banishing spirits.",
  Cracking: "Hacking, cybercombat, and electronic warfare in the Matrix.",
  Electronics: "Computer use, software, hardware, and electronic devices.",
  Enchanting: "Creating magical preparations, foci, and other enchanted items.",
  Engineering: "Building, repairing, and modifying mechanical and structural systems.",
  "Exotic Weapons": "Proficiency with unusual or specialized weaponry.",
  Firearms: "Shooting pistols, rifles, shotguns, and other ranged projectile weapons.",
  Influence: "Negotiation, leadership, etiquette, and social persuasion.",
  Outdoors: "Survival, tracking, navigation, and wilderness knowledge.",
  Perception: "Noticing details, searching areas, and general awareness of surroundings.",
  Piloting: "Operating ground vehicles, drones, watercraft, and aircraft.",
  Sorcery: "Casting spells, counterspelling, and sustaining magical effects.",
  Stealth: "Sneaking, palming objects, and avoiding detection.",
  Tasking: "Compiling, registering, and decompiling sprites in the Matrix.",
};

/** Errata-corrected descriptions for racial qualities (Feb 2020) */
export const RACIAL_QUALITY_EFFECTS: Record<string, string> = {
  "Dermal Deposits": "You gain 1 level of natural Armor. Your Unarmed Melee attacks inflict Physical damage.",
};

// All base attributes that start at 1 and use attribute points
export const BASE_ATTRIBUTES: (keyof Omit<SR6Attributes, "edge" | "essence" | "magic" | "resonance">)[] = [
  "body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma",
];

export function formatNuyen(amount: number): string {
  return amount.toLocaleString() + "¥";
}
