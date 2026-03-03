// SR6 Character Creation Reference Data

import type { SR6Attributes } from "@/types/character";

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
  attributes: Record<keyof Omit<SR6Attributes, "edge" | "essence" | "magic" | "resonance">, [number, number]>;
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

// All base attributes that start at 1 and use attribute points
export const BASE_ATTRIBUTES: (keyof Omit<SR6Attributes, "edge" | "essence" | "magic" | "resonance">)[] = [
  "body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma",
];

// Canonical SR6 specializations per skill
export const SKILL_SPECIALIZATIONS: Record<string, string[]> = {
  Astral: ["Astral Combat", "Astral Signatures", "Emotional States", "Spirit Types"],
  Athletics: ["Archery", "Climbing", "Flying", "Gymnastics", "Sprinting", "Swimming", "Throwing"],
  Biotech: ["Biotechnology", "Cybertechnology", "First Aid", "Medicine"],
  "Close Combat": ["Blades", "Clubs", "Unarmed Combat"],
  Con: ["Acting", "Disguise", "Impersonation", "Performance"],
  Conjuring: ["Banishing", "Binding", "Summoning"],
  Cracking: ["Cybercombat", "Electronic Warfare", "Hacking"],
  Electronics: ["Computer", "Hardware", "Software"],
  Enchanting: ["Alchemy", "Artificing", "Disenchanting"],
  Engineering: ["Aeronautics Mechanic", "Automotive Mechanic", "Demolitions", "Gunnery", "Industrial Mechanic", "Lockpicking", "Nautical Mechanic"],
  "Exotic Weapons": ["Lasers", "Flamethrowers", "Monofilament Whip", "Gyrojet Pistol", "Net Gun", "Bola", "Garrote"],
  Firearms: ["Automatics", "Longarms", "Pistols", "Rifles", "Shotguns"],
  Influence: ["Etiquette", "Instruction", "Intimidation", "Leadership", "Negotiation"],
  Outdoors: ["Navigation", "Survival", "Tracking"],
  Perception: ["Visual", "Aural", "Tactile"],
  Piloting: ["Ground Craft", "Aircraft", "Watercraft"],
  Sorcery: ["Counterspelling", "Ritual Spellcasting", "Spellcasting"],
  Stealth: ["Camouflage", "Disguise", "Palming", "Sneaking"],
  Tasking: ["Compiling", "Decompiling", "Registering"],
};

export function formatNuyen(amount: number): string {
  return amount.toLocaleString() + "¥";
}
