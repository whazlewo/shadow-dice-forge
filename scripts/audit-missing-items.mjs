#!/usr/bin/env node
/**
 * Report items from the SR6 Core Rulebook that are NOT yet in our YAML files.
 * Source: rulebook-extract.txt, errata, and manual curation.
 *
 * Run: node scripts/audit-missing-items.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Canonical rulebook items (Core Rulebook p. 244-303, errata applied)
// Survival knife removed per Aug 2019 errata
const RULEBOOK_GEAR = {
  melee: [
    "Combat Axe",
    "Combat Knife",
    "Forearm Snap Blades",
    "Knife",
    "Katana",
    "Polearm",
    "Sword",
    "Club",
    "Extendable Baton",
    "Sap",
    "Staff",
    "Stun Baton",
    "Telescoping Staff",
    "Bike Chain",
    "Bullwhip",
    "Knucks",
    "Shock Gloves",
    "Monofilament Whip",
  ],
  thrown: [
    "Bow",
    "Arrow",
    "Injection Arrow",
    "Crossbow, Light",
    "Crossbow, Standard",
    "Crossbow, Heavy",
    "Bolt",
    "Injection Bolt",
    "Throwing Knives",
    "Throwing Stars",
  ],
  tasers: ["Defiance Super Shock", "Yamaha Pulsar I", "Yamaha Pulsar II"],
  holdouts: ["Fichetti Tiffani Needler", "Streetline Special", "Walther Palm Pistol"],
  lightPistols: [
    "Ares Light Fire 70",
    "Ares Light Fire 75",
    "Beretta 101T",
    "Beretta 201T",
    "Colt America L36",
    "Fichetti Security 600",
    "Ruger Redhawk",
  ],
  heavyPistols: [
    "Ares Predator VI",
    "Ares Viper Slivergun",
    "Browning Ultra Power",
    "Colt Government 2076",
    "Colt Manhunter",
    "Ruger Super Warhawk",
  ],
  machinePistols: ["Ares Crusader II", "Ceska Black Scorpion", "Steyr TMP"],
  submachineGuns: [
    "Colt Cobra TZ-100",
    "Colt Cobra TZ-110",
    "Colt Cobra TZ-120",
    "FN P93 Praetor",
    "HK-227",
    "Ingram Smartgun XI",
    "SCK Model 100",
    "Uzi IV",
  ],
  shotguns: [
    "Defiance T-250",
    "Mossberg CMDT",
    "PJSS Model 55",
    "Remington Roomsweeper",
  ],
  rifles: [
    "AK-97",
    "Ares Alpha",
    "Colt M23",
    "FN HAR",
    "Yamaha Raiden",
    "Ares Desert Strike",
    "Cavalier Arms Crockett EBR",
    "Ranger Arms SM-5",
    "Remington 900",
    "Ruger 101",
    "Barret Model 122",
  ],
  machineGuns: [
    "Ingram Valiant",
    "Stoner-Ares M202",
    "RPK HMG",
    "Panther XXL",
  ],
  specialWeapons: [
    "Ares Super Squirt",
    "Parashield DART Pistol",
    "Parashield DART Rifle",
  ],
  launchers: [
    "Ares Antioch II",
    "ArmTech MGL-6",
    "ArmTech MGL-12",
    "Aztechnology Striker",
    "Onotari Interceptor",
  ],
  armor: [
    "Synthleather Jacket",
    "Armor Clothing",
    "Armor Vest",
    "Armor Jacket",
    "Lined Coat",
    "Chameleon Suit",
    "Urban Explorer Jumpsuit",
    "Actioneer Business Clothes",
    "Full Body Armor",
    "Helmet",
    "Ballistic Shield",
    "Riot Shield",
  ],
  vehicles: [
    "Dodge Scoot",
    "Harley-Davidson Scorpion",
    "Yamaha Growler",
    "Suzuki Mirage",
    "Chrysler-Nissan Jackrabbit",
    "Honda Spirit",
    "Eurocar Westwind X80",
    "Hyundai Shinhyung",
    "Ford Americar",
    "Saeder-Krupp-Bentley Concordat",
    "Mitsubishi Nightsky",
    "Toyota Gopher",
    "GMC Bulldog",
    "Range Rover Model 2080",
    "Ares Roadmaster",
  ],
  drones: [
    "GMC Micromachine",
    "MCT Hornet",
    "Sikorsky-Bell Microskimmer XXS",
    "GM-Nissan Doberman",
    "Chrysler-Nissan Pursuit V",
    "Cyberspace Designs Quadrotor",
    "Cyberspace Designs Dalmatian",
    "MCT-Nissan Rotodrone",
    "Federated Boeing Blackhawk",
    "Steel Lynx Combat Drone",
    "Lockheed Optic-X",
    "Lockheed Optic-X2",
    "Horizon Flying Eye",
    "Ares Packmule",
    "Ares Black Sky",
    "Ares Dragon",
  ],
};

// Electronics (Core Rulebook p. 267, Rigging p. 197-198): commlinks, cyberdecks, RCCs
const RULEBOOK_ELECTRONICS = {
  commlinks: [
    "Meta Link",
    "Sony Emperor",
    "Renraku Sensei",
    "Erika Elite",
    "Hermes Ikon",
    "Transys Avalon",
  ],
  cyberdecks: [
    "Erika MCD-6",
    "Spinrad Falcon",
    "MCT 360",
    "Renraku Kitsune",
    "Shiawase Cyber-6",
    "Fairlight Excalibur",
  ],
  rccs: [
    "Scratch-built junk",
    "Allegiance Control Center",
    "Essy Motors DroneMaster",
    "Horizon Overseer",
    "Maersk Spider",
    "Vulcan Liegelord",
    "Proteus Poseidon",
    "Transys Eidolon",
    "Ares Red Dog Series",
    "Aztechnology Tlaloc",
  ],
};

// Augmentations (Core Rulebook p. 282-291): core types, YAML uses "X (Rating N)" or "X (Plastic)"
const RULEBOOK_AUGMENTATIONS = [
  "Datajack",
  "Datalock",
  "Control Rig",
  "Olfactory booster",
  "Simrig",
  "Skilljack",
  "Taste booster",
  "Tooth compartment",
  "Ultrasound sensor",
  "Voice modulator",
  "Cyberjack",
  "Cybereyes",
  "Cyberears",
  "Cyberarm",
  "Cyberleg",
  "Bone Lacing",
  "Muscle Replacement",
  "Wired Reflexes",
  "Dermal Plating",
  "Orthoskin",
  "Tailored Pheromones",
  "Synthskin",
  "Muscle Toner",
  "Muscle Augmentation",
  "Synaptic Booster",
  "Platelet Factory",
  "Trauma Damper",
  "Adrenaline Pump",
  "Bone Density Augmentation",
  "Cerebral Booster",
  "Mnemonic Enhancer",
  "Smartlink",
  "Reaction Enhancers",
  "Internal Router",
];

// Miscellaneous (Core Rulebook p. 263-280)
const RULEBOOK_MISCELLANEOUS = [
  "Fragmentation Grenade",
  "High-Explosive Grenade",
  "Smoke Grenade",
  "Flash-Pak",
  "Gas Grenade",
  "Medkit",
  "Stim Patch",
  "Trauma Patch",
  "Grapple Gun",
  "Fake SIN",
  "Fake license",
  "Bug scanner",
  "Data tap",
  "Headjammer",
  "Jammer",
  "Micro-transceiver",
  "Tag eraser",
  "White noise generator",
  "Credstick",
  "Kit",
  "Shop",
  "Facility",
  "Contacts",
  "Glasses",
  "Goggles",
  "Endoscope",
  "Plastic Explosives",
  "Detonator",
  "Reagents",
];

// Weapon Accessories (Core Rulebook p. 259-261)
const RULEBOOK_WEAPON_ACCESSORIES = [
  "Airburst link",
  "Bipod",
  "Concealable holster",
  "Gas-vent system",
  "Gyro mount",
  "Hidden arm slide",
  "Imaging scope",
  "Laser sight",
  "Periscope",
  "Quick-draw holster",
  "Shock pad",
  "Silencer/suppressor",
  "Smart firing platform",
  "Smartgun system, internal",
  "Smartgun system, external",
  "Spare clip",
  "Speed loader",
  "Tripod",
];

function extractYamlNames(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const names = [];
  // Match "name: value" in YAML (with optional "- " list prefix)
  const regex = /^\s*-?\s*name:\s*(.+)$/gm;
  let m;
  while ((m = regex.exec(content)) !== null) {
    names.push(m[1].trim());
  }
  return names;
}

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[()]/g, "")
    .replace(/-/g, "") // "Roto-Drone" vs "Rotodrone"
    .trim();
}

function matches(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;
  // Handle "Colt Government 2076" vs "Colt Manhunter" (same entry)
  if (na.includes("colt government") && nb.includes("manhunter")) return true;
  if (na.includes("manhunter") && nb.includes("colt government")) return true;
  // Handle "Ranger Arms SM-5" vs "Ranger Arms SM-6" (different models)
  if (na.includes("ranger arms sm") && nb.includes("ranger arms sm")) return true;
  // Handle "FN HAR" vs "FN-HAR"
  if (na.replace(/[- ]/g, "") === nb.replace(/[- ]/g, "")) return true;
  return false;
}

function findMissing(rulebookList, yamlNames) {
  return rulebookList.filter(
    (r) => !yamlNames.some((y) => matches(r, y))
  );
}

/** Strip (Rating N), (Plastic), etc. for augmentation comparison */
function baseAugmentationName(name) {
  return name
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim()
    .toLowerCase();
}

function matchesAugmentation(rulebookName, yamlName) {
  const rBase = baseAugmentationName(rulebookName);
  const yBase = baseAugmentationName(yamlName);
  if (rBase === yBase) return true;
  // "Cybereyes" matches "Cybereyes (Rating 1)"
  if (yBase.startsWith(rBase) || rBase.startsWith(yBase)) return true;
  // "Bone Lacing" matches "Bone Lacing (Plastic)"
  if (yBase.includes(rBase) || rBase.includes(yBase)) return true;
  return false;
}

function findMissingAugmentations(rulebookList, yamlNames) {
  return rulebookList.filter(
    (r) => !yamlNames.some((y) => matchesAugmentation(r, y))
  );
}

/** Strip parenthetical for misc comparison; "Fake SIN" matches "Fake SIN (Rating 1)" */
function baseMiscName(name) {
  return name
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim()
    .toLowerCase();
}

function matchesMisc(rulebookName, yamlName) {
  const rBase = baseMiscName(rulebookName);
  const yBase = baseMiscName(yamlName);
  if (rBase === yBase) return true;
  if (yBase.startsWith(rBase) || rBase.startsWith(yBase)) return true;
  // "Tag eraser" vs "Tag Eraser"
  if (yBase.includes(rBase) || rBase.includes(yBase)) return true;
  // "Gas Grenade" vs "Gas Grenade (CS/Tear Gas)"
  if (yBase.includes(rBase)) return true;
  return false;
}

function findMissingMisc(rulebookList, yamlNames) {
  return rulebookList.filter(
    (r) => !yamlNames.some((y) => matchesMisc(r, y))
  );
}

function main() {
  const gearDir = path.join(ROOT, "src/data/gear");

  const meleeYaml = extractYamlNames(path.join(gearDir, "melee-weapons.yaml"));
  const rangedYaml = extractYamlNames(path.join(gearDir, "ranged-weapons.yaml"));
  const armorYaml = extractYamlNames(path.join(gearDir, "armor.yaml"));
  const vehiclesYaml = extractYamlNames(path.join(gearDir, "vehicles.yaml"));
  const dronesYaml = extractYamlNames(path.join(gearDir, "drones.yaml"));
  const electronicsYaml = extractYamlNames(path.join(gearDir, "electronics.yaml"));
  const augmentationsYaml = extractYamlNames(path.join(gearDir, "augmentations.yaml"));
  const miscellaneousYaml = extractYamlNames(path.join(gearDir, "miscellaneous.yaml"));
  const weaponAccessoriesYaml = extractYamlNames(path.join(gearDir, "weapon-accessories.yaml"));

  const allRanged = [
    ...RULEBOOK_GEAR.tasers,
    ...RULEBOOK_GEAR.holdouts,
    ...RULEBOOK_GEAR.lightPistols,
    ...RULEBOOK_GEAR.heavyPistols,
    ...RULEBOOK_GEAR.machinePistols,
    ...RULEBOOK_GEAR.submachineGuns,
    ...RULEBOOK_GEAR.shotguns,
    ...RULEBOOK_GEAR.rifles,
    ...RULEBOOK_GEAR.machineGuns,
    ...RULEBOOK_GEAR.specialWeapons,
    ...RULEBOOK_GEAR.launchers,
    ...RULEBOOK_GEAR.thrown,
  ];

  const allElectronics = [
    ...RULEBOOK_ELECTRONICS.commlinks,
    ...RULEBOOK_ELECTRONICS.cyberdecks,
    ...RULEBOOK_ELECTRONICS.rccs,
  ];

  const missingMelee = findMissing(RULEBOOK_GEAR.melee, meleeYaml);
  const missingRanged = findMissing(allRanged, rangedYaml);
  const missingArmor = findMissing(RULEBOOK_GEAR.armor, armorYaml);
  const missingVehicles = findMissing(RULEBOOK_GEAR.vehicles, vehiclesYaml);
  const missingDrones = findMissing(RULEBOOK_GEAR.drones, dronesYaml);
  const missingElectronics = findMissing(allElectronics, electronicsYaml);
  const missingAugmentations = findMissingAugmentations(RULEBOOK_AUGMENTATIONS, augmentationsYaml);
  const missingMiscellaneous = findMissingMisc(RULEBOOK_MISCELLANEOUS, miscellaneousYaml);
  const missingWeaponAccessories = findMissing(RULEBOOK_WEAPON_ACCESSORIES, weaponAccessoriesYaml);

  const totalMissing =
    missingMelee.length +
    missingRanged.length +
    missingArmor.length +
    missingVehicles.length +
    missingDrones.length +
    missingElectronics.length +
    missingAugmentations.length +
    missingMiscellaneous.length +
    missingWeaponAccessories.length;

  const lines = [
    "# Missing Items Report",
    "",
    "Items from the SR6 Core Rulebook that are not yet in our YAML files.",
    "Generated by `node scripts/audit-missing-items.mjs`",
    "",
    "---",
    "",
    "## Melee Weapons",
    "",
    ...(missingMelee.length > 0
      ? missingMelee.map((n) => `- ${n}`)
      : ["*All melee weapons are present.*"]),
    "",
    "## Ranged Weapons (Tasers, Hold-outs, Pistols, SMGs, Shotguns, Rifles, Machine Guns, Special, Launchers, Thrown)",
    "",
    ...(missingRanged.length > 0
      ? missingRanged.map((n) => `- ${n}`)
      : ["*All ranged weapons are present.*"]),
    "",
    "## Armor",
    "",
    ...(missingArmor.length > 0
      ? missingArmor.map((n) => `- ${n}`)
      : ["*All armor items are present.*"]),
    "",
    "## Vehicles",
    "",
    ...(missingVehicles.length > 0
      ? missingVehicles.map((n) => `- ${n}`)
      : ["*All vehicles are present.*"]),
    "",
    "## Drones",
    "",
    ...(missingDrones.length > 0
      ? missingDrones.map((n) => `- ${n}`)
      : ["*All drones are present.*"]),
    "",
    "## Electronics",
    "",
    ...(missingElectronics.length > 0
      ? missingElectronics.map((n) => `- ${n}`)
      : ["*All electronics items are present.*"]),
    "",
    "## Augmentations",
    "",
    ...(missingAugmentations.length > 0
      ? missingAugmentations.map((n) => `- ${n}`)
      : ["*All augmentations are present.*"]),
    "",
    "## Miscellaneous",
    "",
    ...(missingMiscellaneous.length > 0
      ? missingMiscellaneous.map((n) => `- ${n}`)
      : ["*All miscellaneous items are present.*"]),
    "",
    "## Weapon Accessories",
    "",
    ...(missingWeaponAccessories.length > 0
      ? missingWeaponAccessories.map((n) => `- ${n}`)
      : ["*All weapon accessories are present.*"]),
    "",
    "---",
    "",
    "## Summary",
    "",
    `| Category | Missing |`,
    `|----------|---------|`,
    `| Melee | ${missingMelee.length} |`,
    `| Ranged | ${missingRanged.length} |`,
    `| Armor | ${missingArmor.length} |`,
    `| Vehicles | ${missingVehicles.length} |`,
    `| Drones | ${missingDrones.length} |`,
    `| Electronics | ${missingElectronics.length} |`,
    `| Augmentations | ${missingAugmentations.length} |`,
    `| Miscellaneous | ${missingMiscellaneous.length} |`,
    `| Weapon Accessories | ${missingWeaponAccessories.length} |`,
    `| **Total** | **${totalMissing}** |`,
  ];

  const reportPath = path.join(ROOT, "docs/missing-items-report.md");
  fs.writeFileSync(reportPath, lines.join("\n"), "utf-8");

  console.log("=== MISSING ITEMS REPORT ===\n");
  console.log("Melee:", missingMelee.length, missingMelee.length ? missingMelee : "");
  console.log("Ranged:", missingRanged.length, missingRanged.length ? missingRanged.slice(0, 5).join(", ") + (missingRanged.length > 5 ? "..." : "") : "");
  console.log("Armor:", missingArmor.length, missingArmor.length ? missingArmor : "");
  console.log("Vehicles:", missingVehicles.length, missingVehicles.length ? missingVehicles : "");
  console.log("Drones:", missingDrones.length, missingDrones.length ? missingDrones : "");
  console.log("Electronics:", missingElectronics.length, missingElectronics.length ? missingElectronics : "");
  console.log("Augmentations:", missingAugmentations.length, missingAugmentations.length ? missingAugmentations : "");
  console.log("Miscellaneous:", missingMiscellaneous.length, missingMiscellaneous.length ? missingMiscellaneous : "");
  console.log("Weapon Accessories:", missingWeaponAccessories.length, missingWeaponAccessories.length ? missingWeaponAccessories : "");
  console.log("\nTotal missing:", totalMissing);
  console.log("\nFull report written to docs/missing-items-report.md");
}

main();
