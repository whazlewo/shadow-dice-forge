export type MagicTraditionId =
  | "hermetic"
  | "shamanic"
  | "aztec"
  | "buddhist"
  | "christian"
  | "wuxing";

export interface MagicTradition {
  id: MagicTraditionId;
  name: string;
  drainAttributes: string;
  attribute: "logic" | "charisma";
  combat: string;
  detection: string;
  health: string;
  illusion: string;
  manipulation: string;
}

export const MAGIC_TRADITIONS: MagicTradition[] = [
  {
    id: "hermetic",
    name: "Hermetic",
    drainAttributes: "Willpower + Logic",
    attribute: "logic",
    combat: "Fire",
    detection: "Air",
    health: "Earth",
    illusion: "Water",
    manipulation: "Man (Kin)",
  },
  {
    id: "shamanic",
    name: "Shamanic",
    drainAttributes: "Willpower + Charisma",
    attribute: "charisma",
    combat: "Beasts",
    detection: "Air",
    health: "Plant",
    illusion: "Water",
    manipulation: "Man (Kin)",
  },
  {
    id: "aztec",
    name: "Aztec",
    drainAttributes: "Willpower + Charisma",
    attribute: "charisma",
    combat: "Fire",
    detection: "Air",
    health: "Plant",
    illusion: "Water",
    manipulation: "Earth",
  },
  {
    id: "buddhist",
    name: "Buddhist",
    drainAttributes: "Willpower + Logic",
    attribute: "logic",
    combat: "Air",
    detection: "Water",
    health: "Earth",
    illusion: "Fire",
    manipulation: "Man (Kin)",
  },
  {
    id: "christian",
    name: "Christian",
    drainAttributes: "Willpower + Charisma",
    attribute: "charisma",
    combat: "Fire",
    detection: "Air",
    health: "Man (Kin)",
    illusion: "Water",
    manipulation: "Earth",
  },
  {
    id: "wuxing",
    name: "Wuxing",
    drainAttributes: "Willpower + Logic",
    attribute: "logic",
    combat: "Fire",
    detection: "Earth",
    health: "Guidance",
    illusion: "Water",
    manipulation: "Plant",
  },
];
