#!/usr/bin/env node
/**
 * Audit script for SR6 Core Rulebook magic reference data.
 * Compares YAML files against known rulebook contents and reports:
 * - MISSING: Items in rulebook but not in YAML
 * - NEEDS_DESCRIPTION: Items in YAML with empty or short description
 *
 * Run: node scripts/audit-magic-refs.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Known SR6 Core Rulebook spells (from Spell Descriptions, p. 131+)
const RULEBOOK_SPELLS = [
  "Acid Stream",
  "Toxic Wave",
  "Clout",
  "Blast",
  "Flamestrike",
  "Fireball",
  "Ice Spear",
  "Ice Storm",
  "Lightning Bolt",
  "Lightning Ball",
  "Manabolt",
  "Manaball",
  "Powerbolt",
  "Powerball",
  "Stunbolt",
  "Stunball",
  "Analyze Device",
  "Analyze Magic",
  "Analyze Truth",
  "Clairaudience",
  "Clairvoyance",
  "Combat Sense",
  "Detect Enemies",
  "Detect Life",
  "Detect Magic",
  "Mindlink",
  "Mind Probe",
  "Antidote",
  "Cleansing Heal",
  "Cooling Heal",
  "Decrease Attribute",
  "Heal",
  "Increase Attribute",
  "Increase Reflexes",
  "Resist Pain",
  "Stabilize",
  "Warming Heal",
  "Agony",
  "Chaos",
  "Confusion",
  "Hush",
  "Silence",
  "Invisibility",
  "Improved Invisibility",
  "Mask",
  "Physical Mask",
  "Phantasm",
  "Trid Phantasm",
  "Sensor Sneak",
  "Animate Metal",
  "Animate Plastic",
  "Animate Stone",
  "Animate Wood",
  "Armor",
  "Darkness",
  "Light",
  "Elemental Armor",
  "Control Actions",
  "Control Thoughts",
  "Focus Burst",
  "Fling",
  "Levitate",
  "Mana Barrier",
  "Mystic Armor",
  "Overclock",
  "Physical Barrier",
  "Shape Metal",
  "Shape Plastic",
  "Shape Stone",
  "Shape Wood",
  "Strengthen Wall",
  "Thunder",
  "Vehicle Armor",
];

// Known SR6 Core Rulebook rituals (p. 143-146)
const RULEBOOK_RITUALS = [
  "Watcher",
  "Ward",
  "Renascence",
  "Remote Sensing",
  "Prodigal Spell",
  "Curse",
  "Circle of Protection",
  "Circle of Healing",
];

// Known SR6 Core Rulebook adept powers (p. 156-158)
const RULEBOOK_ADEPT_POWERS = [
  "Combat Sense",
  "Critical Strike",
  "Adrenaline Boost",
  "Danger Sense",
  "Direction Sense",
  "Improved Sense",
  "Enhanced Perception",
  "Enhanced Accuracy",
  "Improved Ability (Skill)",
  "Improved Physical Attribute",
  "Improved Reflexes",
  "Killing Hands",
  "Kinesics",
  "Mystic Armor",
  "Pain Resistance",
  "Rapid Healing",
  "Spell Resistance",
  "Traceless Walk",
  "Vocal Control",
  "Wall Running",
];

// Known SR6 Core Rulebook complex forms (p. 189-191)
// Puppeteer removed from Technomancer archetype example only; remains in rules. Transcend Grid removed from rules per p. 191.
const RULEBOOK_COMPLEX_FORMS = [
  "Cleaner",
  "Diffusion (Matrix Attribute)",
  "Editor",
  "Emulate (Program)",
  "Infusion (Matrix Attribute)",
  "Mirrored Persona",
  "Pulse Storm",
  "Puppeteer",
  "Resonance Channel",
  "Resonance Spike",
  "Resonance Veil",
  "Static Bomb",
  "Static Veil",
  "Stitches",
  "Tattletale",
];

function extractYamlNames(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const names = [];
  const regex = /^\s*name:\s*(.+)$/gm;
  let m;
  while ((m = regex.exec(content)) !== null) {
    names.push(m[1].trim());
  }
  return names;
}

function extractYamlNamesWithDescriptions(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const items = [];
  const blocks = content.split(/^-\s+name:/m).filter((b) => b.trim());
  for (const block of blocks) {
    const firstLine = block.trim().split("\n")[0];
    const name = firstLine.trim();
    if (name.startsWith("#")) continue; // skip comment blocks
    const descMatch = block.match(/description:\s*(.+?)(?:\n\s+\w|\n\n|$)/s);
    const description = descMatch ? descMatch[1].trim() : "";
    items.push({ name, description });
  }
  return items;
}

function normalizeForComparison(name) {
  // Improved Reflexes (1) -> Improved Reflexes for base comparison
  return name.replace(/\s*\(\d+\)\s*$/, "").trim();
}

/** Match logic used by main() - use same in writeChecklist for consistency */
function spellMatchesRulebook(rulebookName, yamlName) {
  return normalizeForComparison(yamlName) === normalizeForComparison(rulebookName) || yamlName === rulebookName;
}

function adeptMatchesRulebook(rulebookName, yamlName) {
  return (
    normalizeForComparison(yamlName) === normalizeForComparison(rulebookName) ||
    yamlName === rulebookName ||
    yamlName.startsWith(rulebookName + " (")
  );
}

function complexMatchesRulebook(rulebookName, yamlName) {
  return (
    yamlName === rulebookName ||
    yamlName.replace(/\(.*\)/, "").trim() === rulebookName.replace(/\(.*\)/, "").trim()
  );
}

function main() {
  const spellsPath = path.join(ROOT, "src/data/magic/spells.yaml");
  const adeptPath = path.join(ROOT, "src/data/magic/adept-powers.yaml");
  const complexPath = path.join(ROOT, "src/data/magic/complex-forms.yaml");

  const spellItems = extractYamlNamesWithDescriptions(spellsPath);
  const adeptItems = extractYamlNamesWithDescriptions(adeptPath);
  const complexItems = extractYamlNamesWithDescriptions(complexPath);

  const spellNames = spellItems.map((i) => i.name);
  const adeptNames = adeptItems.map((i) => i.name);
  const complexNames = complexItems.map((i) => i.name);

  const allSpellsAndRituals = [...RULEBOOK_SPELLS, ...RULEBOOK_RITUALS];

  const missingSpells = allSpellsAndRituals.filter(
    (n) => !spellNames.some((y) => spellMatchesRulebook(n, y))
  );
  const missingAdept = RULEBOOK_ADEPT_POWERS.filter(
    (n) => !adeptNames.some((y) => adeptMatchesRulebook(n, y))
  );
  const missingComplex = RULEBOOK_COMPLEX_FORMS.filter(
    (n) => !complexNames.some((y) => complexMatchesRulebook(n, y))
  );

  const needsDescSpells = spellItems.filter(
    (i) => !i.description || i.description.length < 50
  );
  const needsDescAdept = adeptItems.filter(
    (i) => !i.description || i.description.length < 50
  );
  const needsDescComplex = complexItems.filter(
    (i) => !i.description || i.description.length < 50
  );

  console.log("=== MAGIC REFERENCE AUDIT ===\n");

  console.log("MISSING SPELLS/RITUALS:", missingSpells.length);
  if (missingSpells.length > 0) {
    missingSpells.forEach((n) => console.log("  -", n));
  }

  console.log("\nMISSING ADEPT POWERS:", missingAdept.length);
  if (missingAdept.length > 0) {
    missingAdept.forEach((n) => console.log("  -", n));
  }

  console.log("\nMISSING COMPLEX FORMS:", missingComplex.length);
  if (missingComplex.length > 0) {
    missingComplex.forEach((n) => console.log("  -", n));
  }

  console.log("\nNEEDS DESCRIPTION (spells):", needsDescSpells.length);
  if (needsDescSpells.length > 0) {
    needsDescSpells.forEach((i) => console.log("  -", i.name));
  }

  console.log("\nNEEDS DESCRIPTION (adept powers):", needsDescAdept.length);
  if (needsDescAdept.length > 0) {
    needsDescAdept.forEach((i) => console.log("  -", i.name));
  }

  console.log("\nNEEDS DESCRIPTION (complex forms):", needsDescComplex.length);
  if (needsDescComplex.length > 0) {
    needsDescComplex.forEach((i) => console.log("  -", i.name));
  }

  const totalMissing =
    missingSpells.length + missingAdept.length + missingComplex.length;
  const totalNeedsDesc =
    needsDescSpells.length + needsDescAdept.length + needsDescComplex.length;

  console.log("\n--- SUMMARY ---");
  console.log(
    `Total missing: ${totalMissing} | Total needing description: ${totalNeedsDesc}`
  );

  const result = {
    missingSpells,
    missingAdept,
    missingComplex,
    needsDescSpells,
    needsDescAdept,
    needsDescComplex,
    spellItems,
    adeptItems,
    complexItems,
  };

  writeChecklist(result);
  return result;
}

function writeChecklist(result) {
  const { spellItems, adeptItems, complexItems } = result;
  const lines = [
    "# Magic Reference Audit Checklist",
    "",
    "Generated by `node scripts/audit-magic-refs.mjs`",
    "",
    "## Spells & Rituals",
    "",
    "| Name | In YAML? | Has Full Description? | Page/Notes |",
    "|------|----------|----------------------|------------|",
  ];

  const allSpellsAndRituals = [...RULEBOOK_SPELLS, ...RULEBOOK_RITUALS];

  for (const name of allSpellsAndRituals) {
    const item = spellItems.find((i) => spellMatchesRulebook(name, i.name));
    const inYaml = !!item;
    const hasDesc = item && item.description && item.description.length >= 50;
    lines.push(`| ${name} | ${inYaml ? "Yes" : "No"} | ${hasDesc ? "Yes" : "No"} | |`);
  }

  lines.push("", "## Adept Powers", "");
  lines.push("| Name | In YAML? | Has Full Description? | Page/Notes |");
  lines.push("|------|----------|----------------------|------------|");

  for (const name of RULEBOOK_ADEPT_POWERS) {
    const item = adeptItems.find((i) => adeptMatchesRulebook(name, i.name));
    const inYaml = !!item;
    const hasDesc = item && item.description && item.description.length >= 50;
    lines.push(`| ${name} | ${inYaml ? "Yes" : "No"} | ${hasDesc ? "Yes" : "No"} | |`);
  }

  lines.push("", "## Complex Forms", "");
  lines.push("| Name | In YAML? | Has Full Description? | Page/Notes |");
  lines.push("|------|----------|----------------------|------------|");

  for (const name of RULEBOOK_COMPLEX_FORMS) {
    const item = complexItems.find((i) => complexMatchesRulebook(name, i.name));
    const inYaml = !!item;
    const hasDesc = item && item.description && item.description.length >= 50;
    lines.push(`| ${name} | ${inYaml ? "Yes" : "No"} | ${hasDesc ? "Yes" : "No"} | |`);
  }

  fs.writeFileSync(
    path.join(ROOT, "docs/magic-audit-checklist.md"),
    lines.join("\n"),
    "utf-8"
  );
  console.log("\nWrote docs/magic-audit-checklist.md");
}

main();
