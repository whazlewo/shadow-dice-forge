#!/usr/bin/env node
/**
 * Audit script for SR6 spell Drain Values (DV).
 * Compares spells.yaml drain values against the SR6 Core Rulebook.
 * SR6 uses fixed numeric DVs; SR5 used Force-based formulas (F/2, F/2+1, etc.).
 *
 * Run: node scripts/audit-spell-drain.mjs
 * Run with --fix to update spells.yaml: node scripts/audit-spell-drain.mjs --fix
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// SR6 Core Rulebook Drain Values (from docs/rulebook-extract.txt)
const SR6_SPELL_DV = {
  // Combat
  "Acid Stream": "5",
  "Toxic Wave": "6",
  Clout: "3",
  Blast: "4",
  Flamestrike: "5",
  Fireball: "6",
  "Ice Spear": "5",
  "Ice Storm": "6",
  "Lightning Bolt": "5",
  "Lightning Ball": "6",
  Manabolt: "4",
  Manaball: "5",
  Powerbolt: "4",
  Powerball: "5",
  Stunbolt: "3",
  Stunball: "4",
  // Detection
  "Analyze Device": "2",
  "Analyze Magic": "3",
  "Analyze Truth": "3",
  Clairaudience: "3",
  Clairvoyance: "3",
  "Combat Sense": "3",
  "Detect Enemies": "3",
  "Detect Life": "3",
  "Detect Magic": "4",
  Mindlink: "3",
  "Mind Probe": "5",
  // Health
  Antidote: "5",
  "Cleansing Heal": "5",
  "Cooling Heal": "5",
  "Decrease Attribute": "3",
  Heal: "3",
  "Increase Attribute": "3",
  "Increase Reflexes": "5",
  "Resist Pain": "3",
  Stabilize: "3",
  "Warming Heal": "5",
  // Illusion
  Agony: "3",
  Chaos: "4",
  Confusion: "3",
  Hush: "3",
  Silence: "4",
  Invisibility: "3",
  "Improved Invisibility": "4",
  Mask: "3",
  "Physical Mask": "4",
  Phantasm: "3",
  "Trid Phantasm": "4",
  "Sensor Sneak": "2",
  // Manipulation
  "Animate Metal": "6",
  "Animate Plastic": "3",
  "Animate Stone": "5",
  "Animate Wood": "4",
  Armor: "4",
  Darkness: "3",
  Light: "3",
  "Elemental Armor": "5",
  "Control Actions": "4",
  "Control Thoughts": "4",
  Fling: "5",
  "Focus Burst": "7",
  Levitate: "6",
  "Mana Barrier": "5",
  "Mystic Armor": "3",
  Overclock: "4",
  "Physical Barrier": "6",
  "Shape Metal": "5",
  "Shape Plastic": "2",
  "Shape Stone": "4",
  "Shape Wood": "3",
  "Strengthen Wall": "4",
  Thunder: "3",
  "Vehicle Armor": "6",
};

// Rituals: expected drain values (unchanged)
const SR6_RITUAL_DV = {
  Watcher: "Varies",
  Ward: "Varies",
  Renascence: "Threshold 6",
  "Remote Sensing": "Varies",
  "Prodigal Spell": "Varies",
  Curse: "Threshold 5",
  "Circle of Protection": "Varies",
  "Circle of Healing": "Varies",
};

function extractSpellBlocks(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const blocks = content.split(/^-\s+name:/m).filter((b) => b.trim());
  const items = [];
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const name = lines[0].trim();
    if (name.startsWith("#")) continue;
    const drainMatch = block.match(/^\s+drain:\s*(.+)$/m);
    const drain = drainMatch ? drainMatch[1].trim().replace(/^["']|["']$/g, "") : "";
    const categoryMatch = block.match(/^\s+category:\s*(.+)$/m);
    const category = categoryMatch ? categoryMatch[1].trim() : "";
    items.push({ name, drain, category, rawBlock: block });
  }
  return items;
}

function main() {
  const fix = process.argv.includes("--fix");
  const spellsPath = path.join(ROOT, "src/data/magic/spells.yaml");

  const items = extractSpellBlocks(spellsPath);
  const report = [];
  let mismatchCount = 0;

  for (const item of items) {
    const expected = SR6_SPELL_DV[item.name] ?? SR6_RITUAL_DV[item.name];
    let status;
    if (expected === undefined) {
      status = "UNKNOWN";
    } else if (item.drain === expected) {
      status = "OK";
    } else {
      status = "MISMATCH";
      mismatchCount++;
    }
    report.push({
      name: item.name,
      current: item.drain,
      expected: expected ?? "(not in reference)",
      status,
      category: item.category,
      rawBlock: item.rawBlock,
    });
  }

  // Print report
  console.log("=== SPELL DRAIN VALUE AUDIT (SR6) ===\n");

  const mismatches = report.filter((r) => r.status === "MISMATCH");
  const unknowns = report.filter((r) => r.status === "UNKNOWN");

  if (mismatches.length > 0) {
    console.log("MISMATCHES (current -> expected):");
    mismatches.forEach((r) => {
      console.log(`  ${r.name}: "${r.current}" -> "${r.expected}"`);
    });
    console.log();
  }

  if (unknowns.length > 0) {
    console.log("UNKNOWN (not in SR6 reference):");
    unknowns.forEach((r) => console.log(`  ${r.name}: "${r.current}"`));
    console.log();
  }

  const okCount = report.filter((r) => r.status === "OK").length;
  console.log(`--- SUMMARY ---`);
  console.log(`OK: ${okCount} | MISMATCH: ${mismatchCount} | UNKNOWN: ${unknowns.length}`);

  if (fix && mismatchCount > 0) {
    console.log("\nApplying fixes to spells.yaml...");
    let content = fs.readFileSync(spellsPath, "utf-8");

    for (const r of mismatches) {
      if (r.expected && r.expected !== "(not in reference)") {
        // Replace drain value for this spell block
        const blockPattern = new RegExp(
          `(-\\s+name:\\s*${r.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n(?:[\\s\\S]*?)^\\s+drain:\\s*)[^\\n]+`,
          "m"
        );
        content = content.replace(blockPattern, `$1"${r.expected}"`);
      }
    }

    fs.writeFileSync(spellsPath, content, "utf-8");
    console.log("Done. Re-run without --fix to verify.");
  }

  return { report, mismatchCount };
}

main();
