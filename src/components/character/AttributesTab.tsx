import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { SR6Attributes, AttributeSources, SR6Augmentation, SR6Gear, SR6Armor, SR6Quality, SR6AdeptPower, DiceModifier } from "@/types/character";
import { useMemo } from "react";

type AttrField = { key: keyof SR6Attributes; label: string; type?: string };

/** Attribute descriptions from the SR6 rulebook */
const ATTR_TOOLTIPS: Record<string, string> = {
  body: "General sturdiness, integrity, and health. Used for resisting damage and toxins.",
  agility: "Nimbleness, speed, flexibility, and hand-eye coordination. Key for combat and athletics.",
  reaction: "Quickness, the ability to respond with alacrity. Key defensive attribute; used in piloting and vehicle/drone control.",
  strength: "Raw muscle power—ability to lift, carry, and punch. Important in Athletics and unarmed combat.",
  willpower: "Ability to persevere through hardship, pushing through pain, deception, and obstacles. Important for magic users and resisting attacks/illusions.",
  logic: "The coldly calculating part of the mind—rational, analytical, puzzle-solving. Used by deckers and technomancers.",
  intuition: "Gut instinct, sudden inspiration, flash of insight. Helps react to danger, perceive threats, resist magic.",
  charisma: "The pull you exert on others—looks, speaking ability, fashion sense, power. Important for persuading others.",
  edge: "Combination of guts, risk, and heedless ignorance of danger. Lets shadowrunners survive where others do not.",
  essence: "Capacity for cyberware and bioware. Magic use is limited as Essence declines; healing magic has less effect with more augmentations.",
  magic: "Magic: strength in channeling mana for Awakened characters. Resonance: strength in manipulating the Matrix for technomancers.",
  resonance: "Strength in manipulating the Matrix for technomancers. Exclusive to technomancers.",
  edge_points: "Current Edge available to spend. Regained through gameplay.",
  unarmed: "Unarmed attack rating for melee combat.",
};

/** Attribute + paired derived stat per official sheet layout */
const PAIRED_ATTRS: { attr: AttrField; derivedKey: string }[] = [
  { attr: { key: "body", label: "Body" }, derivedKey: "essence" },
  { attr: { key: "agility", label: "Agility" }, derivedKey: "magic" },
  { attr: { key: "reaction", label: "Reaction" }, derivedKey: "initiative" },
  { attr: { key: "strength", label: "Strength" }, derivedKey: "matrix_initiative" },
  { attr: { key: "willpower", label: "Willpower" }, derivedKey: "astral_initiative" },
  { attr: { key: "logic", label: "Logic" }, derivedKey: "composure" },
  { attr: { key: "intuition", label: "Intuition" }, derivedKey: "edge_points" },
  { attr: { key: "charisma", label: "Charisma" }, derivedKey: "memory" },
  { attr: { key: "edge", label: "Edge" }, derivedKey: "movement" },
];

interface DerivedStat {
  key: string;
  label: string;
  value: string;
  tooltip?: string;
}

function computeDerived(
  a: SR6Attributes,
  armor?: SR6Armor[],
  qualities?: SR6Quality[],
  augmentations?: SR6Augmentation[],
  gear?: SR6Gear[],
  adeptPowers?: SR6AdeptPower[],
): DerivedStat[] {
  const rea = a.reaction || 0;
  const int = a.intuition || 0;
  const wil = a.willpower || 0;
  const cha = a.charisma || 0;
  const log = a.logic || 0;
  const str = a.strength || 0;
  const bod = a.body || 0;

  // Defense Rating: BOD + max(body armor) + max(helmet) + max(shield) + modifiers
  const equippedArmor = (armor || []).filter((a) => a.equipped !== false);
  const bySubtype = (st: string) => equippedArmor.filter((a) => (a.subtype || "body") === st);
  const bestOf = (items: SR6Armor[]) => items.length > 0 ? items.reduce((best, a) => (Number(a.rating) || 0) > (Number(best.rating) || 0) ? a : best) : null;
  const bestBody = bestOf(bySubtype("body"));
  const bestHelmet = bestOf(bySubtype("helmet"));
  const bestShield = bestOf(bySubtype("shield"));

  // Collect DR modifiers from qualities, augmentations, gear, adept powers
  const drMods = collectDiceModifiers("defense_rating", qualities, augmentations, gear, adeptPowers);

  const drBonus = drMods.reduce((sum, m) => sum + m.value, 0);
  const armorTotal = (Number(bestBody?.rating) || 0) + (Number(bestHelmet?.rating) || 0) + (Number(bestShield?.rating) || 0);
  const totalDR = bod + armorTotal + drBonus;

  // Build DR tooltip
  const drLines = [`Body: ${bod}`];
  if (bestBody) drLines.push(`Armor (${bestBody.name}): +${bestBody.rating}`);
  if (bestHelmet) drLines.push(`Helmet (${bestHelmet.name}): +${bestHelmet.rating}`);
  if (bestShield) drLines.push(`Shield (${bestShield.name}): +${bestShield.rating}`);
  drMods.forEach((m) => drLines.push(`${m.source}: ${m.value > 0 ? "+" : ""}${m.value}`));
  drLines.push(`Total: ${totalDR}`);

  // Defense dice modifiers (e.g. Combat Sense)
  const defDiceMods = collectDiceModifiers("defense_dice", qualities, augmentations, gear, adeptPowers);
  const defDiceBonus = defDiceMods.reduce((sum, m) => sum + m.value, 0);
  if (defDiceBonus > 0) {
    drLines.push(`Defense dice: +${defDiceBonus}`);
    defDiceMods.forEach((m) => drLines.push(`  ${m.source}: +${m.value}`));
  }

  // Initiative dice modifiers (e.g. Wired Reflexes, Synaptic Booster)
  const initDiceMods = collectDiceModifiers("initiative_dice", qualities, augmentations, gear, adeptPowers);
  const initFlatMods = collectDiceModifiers("initiative", qualities, augmentations, gear, adeptPowers);

  const initDiceBonus = initDiceMods.reduce((sum, m) => sum + m.value, 0);
  const totalInitDice = Math.min(1 + initDiceBonus, 5);
  const initFlatBonus = initFlatMods.reduce((sum, m) => sum + m.value, 0);
  const initScore = rea + int + initFlatBonus;

  // Build initiative tooltip
  const initLines = [`Base: REA(${rea}) + INT(${int}) + 1D6`];
  initFlatMods.forEach((m) => initLines.push(`${m.source}: ${m.value > 0 ? "+" : ""}${m.value} to score`));
  initDiceMods.forEach((m) => initLines.push(`${m.source}: +${m.value}D6`));
  if (totalInitDice !== 1 + initDiceBonus) initLines.push(`Capped at 5D6`);
  initLines.push(`Total: ${initScore}+${totalInitDice}D6`);

  return [
    { key: "initiative", label: "Initiative", value: `${initScore}+${totalInitDice}D6`, tooltip: initLines.join("\n") },
    { key: "matrix_initiative", label: "Matrix Initiative", value: `${a.resonance ? (int + (a.resonance || 0)) : int}+${a.resonance ? "4" : "2"}D6`, tooltip: "Depends on interface mode" },
    { key: "astral_initiative", label: "Astral Initiative", value: a.magic ? `${int + int}+3D6` : "—", tooltip: "INT×2 + 3D6 (if magical)" },
    { key: "composure", label: "Composure", value: `${wil + cha}`, tooltip: "WIL + CHA" },
    { key: "judge_intentions", label: "Judge Intentions", value: `${wil + int}`, tooltip: "WIL + INT" },
    { key: "memory", label: "Memory", value: `${log + wil}`, tooltip: "LOG + WIL" },
    { key: "lift_carry", label: "Lift/Carry", value: `${str + bod}(${(str + bod) * 2})`, tooltip: "STR + BOD (carry), ×2 (lift)" },
    { key: "movement", label: "Movement", value: `${Math.max(1, Math.floor((rea + str) / 2))}m`, tooltip: "Walk = (REA+STR)/2" },
    { key: "defense_rating", label: "Defense Rating", value: defDiceBonus > 0 ? `${totalDR} (+${defDiceBonus}d)` : `${totalDR}`, tooltip: drLines.join("\n") },
  ];
}

type ExcludableItem = { name: string; dice_modifiers?: DiceModifier[]; exclusion_group?: string };

/** Collect dice modifiers for a given attribute key from qualities, augmentations, gear, and adept powers.
 *  When maxBonus is set, positive modifiers are clamped so the total bonus does not exceed maxBonus.
 *  A "⚠ Capped" entry is appended when clamping occurs.
 *  Enforces exclusion groups: when multiple augmentations/powers share a group, only the best is kept. */
function collectDiceModifiers(
  attrKey: string,
  qualities?: { name: string; dice_modifiers?: DiceModifier[]; equipped?: boolean }[],
  augmentations?: (ExcludableItem & { equipped?: boolean })[],
  gear?: { name: string; dice_modifiers?: DiceModifier[]; equipped?: boolean }[],
  adeptPowers?: (ExcludableItem & { enabled?: boolean })[],
  maxBonus?: number,
): { source: string; value: number }[] {
  const mods: { source: string; value: number }[] = [];

  // Qualities and gear have no exclusion groups
  for (const q of qualities || []) {
    for (const dm of q.dice_modifiers || []) {
      if (dm.attribute === attrKey) mods.push({ source: q.name, value: dm.value });
    }
  }
  for (const g of gear || []) {
    if (g.equipped === false) continue;
    for (const dm of g.dice_modifiers || []) {
      if (dm.attribute === attrKey) mods.push({ source: g.name, value: dm.value });
    }
  }

  // Collect augmentations and adept powers, respecting exclusion groups
  const groupedItems: Map<string, { name: string; totalValue: number }[]> = new Map();
  const ungroupedMods: { source: string; value: number }[] = [];

  const processExcludable = (items: ExcludableItem[], skipFn?: (item: ExcludableItem) => boolean) => {
    for (const item of items) {
      if (skipFn?.(item)) continue;
      const itemMods = (item.dice_modifiers || []).filter((dm) => dm.attribute === attrKey);
      if (itemMods.length === 0) continue;
      const totalVal = itemMods.reduce((sum, dm) => sum + dm.value, 0);

      if (item.exclusion_group) {
        const group = groupedItems.get(item.exclusion_group) || [];
        group.push({ name: item.name, totalValue: totalVal });
        groupedItems.set(item.exclusion_group, group);
      } else {
        itemMods.forEach((dm) => ungroupedMods.push({ source: item.name, value: dm.value }));
      }
    }
  };

  processExcludable(augmentations || []);
  processExcludable((adeptPowers || []) as ExcludableItem[], (item) => (item as any).enabled === false);

  // For each exclusion group, keep only the best item
  for (const [, groupItems] of groupedItems) {
    groupItems.sort((a, b) => b.totalValue - a.totalValue);
    const best = groupItems[0];
    mods.push({ source: best.name, value: best.totalValue });
    for (let i = 1; i < groupItems.length; i++) {
      mods.push({ source: `⚠ ${groupItems[i].name} (excluded — conflicts with ${best.name})`, value: 0 });
    }
  }

  mods.push(...ungroupedMods);

  if (maxBonus !== undefined) {
    const total = mods.reduce((sum, m) => sum + m.value, 0);
    if (total > maxBonus) {
      const excess = total - maxBonus;
      mods.push({ source: `⚠ Capped at +${maxBonus} augmented max`, value: -excess });
    }
  }
  return mods;
}

const CORE_ATTR_KEYS = new Set(["body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma"]);

/** Build tooltip showing how an attribute value was calculated */
function buildAttrValueTooltip(
  key: keyof SR6Attributes,
  value: any,
  sources?: AttributeSources,
  augmentations?: SR6Augmentation[],
  gear?: SR6Gear[],
  qualities?: SR6Quality[],
  adeptPowers?: SR6AdeptPower[],
): string {
  const cap = CORE_ATTR_KEYS.has(key) ? 4 : undefined;
  const gearMods = collectDiceModifiers(key, qualities || [], augmentations, gear, adeptPowers, cap);
  const src = sources?.[key as keyof typeof sources];

  const lines: string[] = [];
  if (key === "essence") {
    const base = src?.base ?? 6;
    lines.push(`Base: ${base}`);
    const numVal = typeof value === "number" ? value : 6;
    const loss = base - numVal;
    if (loss > 0) lines.push(`Augmentations: -${loss.toFixed(1)}`);
  } else if (src) {
    lines.push(`Base: ${src.base}`);
    if (src.adjustment) lines.push(`Metatype Adj: +${src.adjustment}`);
    if (src.attribute_points) lines.push(`Attr Points: +${src.attribute_points}`);
    if (src.karma) lines.push(`Karma: +${src.karma}`);
  }
  gearMods.forEach((m) => lines.push(`${m.source}: ${m.value > 0 ? "+" : ""}${m.value}`));
  lines.push(`Total: ${value}`);
  return lines.join("\n");
}

interface Props {
  attributes: SR6Attributes;
  attributeSources?: AttributeSources;
  augmentations?: SR6Augmentation[];
  gear?: SR6Gear[];
  armor?: SR6Armor[];
  qualities?: SR6Quality[];
  adeptPowers?: SR6AdeptPower[];
  onUpdate?: (attrs: SR6Attributes) => void;
}

const THIRD_COLUMN_KEYS = ["unarmed", "judge_intentions", "lift_carry", "defense_rating"];

function LabelWithTooltip({ label, definition, valueTooltip }: { label: string; definition?: string; valueTooltip?: string }) {
  const hasTooltip = definition || valueTooltip;
  return (
    <>
      <Label className="font-display text-xs tracking-wide text-muted-foreground text-left">
        {label}
      </Label>
      {hasTooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground/60 cursor-help shrink-0" />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[260px] text-xs whitespace-pre-line">
            {definition && <span className="font-normal">{definition}</span>}
            {definition && valueTooltip && <>{"\n\n"}</>}
            {valueTooltip && <span className="font-mono text-muted-foreground">{valueTooltip}</span>}
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}

function PairedAttrRow({
  attrField,
  attrValue,
  derivedLabel,
  derivedValue,
  derivedKey,
  attrValueTooltip,
  derivedValueTooltip,
  thirdCol,
}: {
  attrField: AttrField;
  attrValue: any;
  derivedLabel: string;
  derivedValue: string | number;
  derivedKey: string;
  attrValueTooltip?: string;
  derivedValueTooltip?: string;
  thirdCol?: { label: string; value: string | number; valueTooltip?: string; definition?: string } | null;
}) {
  const attrDisplay = attrValue ?? (attrField.type === "text" ? "—" : 0);
  const derivedDisplay = derivedValue ?? "—";
  const attrDefinition = ATTR_TOOLTIPS[attrField.key];
  const derivedDefinition = ATTR_TOOLTIPS[derivedKey] || DERIVED_TOOLTIPS[derivedKey];

  const cell = "flex items-center border-b border-border/30 py-1 min-w-0";
  const spacer = "border-b border-border/30";
  const labelCell = `${cell} justify-start gap-1`;
  const valueCell = `${cell} font-mono text-sm h-8 px-1 text-foreground`;
  return (
    <>
      <div className={labelCell}>
        <LabelWithTooltip label={attrField.label} definition={attrDefinition} valueTooltip={attrValueTooltip} />
      </div>
      <span className={`${valueCell} justify-end`}>{attrDisplay}</span>
      <div className={spacer} aria-hidden />
      <div className={labelCell}>
        <LabelWithTooltip label={derivedLabel} definition={derivedDefinition} valueTooltip={derivedValueTooltip} />
      </div>
      <span className={`${valueCell} justify-start`}>{derivedDisplay}</span>
      <div className={spacer} aria-hidden />
      {thirdCol ? (
        <>
          <div className={labelCell}>
            <LabelWithTooltip label={thirdCol.label} definition={thirdCol.definition} valueTooltip={thirdCol.valueTooltip} />
          </div>
          <span className={`${valueCell} justify-end`}>{thirdCol.value ?? "—"}</span>
        </>
      ) : (
        <>
          <div className={spacer} aria-hidden />
          <div className={spacer} aria-hidden />
        </>
      )}
    </>
  );
}

const DERIVED_TOOLTIPS: Record<string, string> = {
  initiative: "REA + INT + dice. Determines how many actions you get per combat round.",
  matrix_initiative: "Matrix initiative for deckers/technomancers. Depends on interface mode.",
  astral_initiative: "INT×2 + 3D6 for astral combat. Only for magical characters.",
  composure: "WIL + CHA. Used for resisting social manipulation.",
  judge_intentions: "WIL + INT. Used to read another's intentions.",
  memory: "LOG + WIL. Used for memory-related tests.",
  movement: "Walk speed in meters. (REA + STR) / 2.",
  lift_carry: "STR + BOD for carry capacity; ×2 for lift.",
  defense_rating: "BOD + armor rating. Used for Damage Resistance tests.",
};

export function AttributesTab({ attributes, attributeSources, augmentations, gear, armor, qualities = [], adeptPowers }: Props) {
  const derived = useMemo(() => computeDerived(attributes, armor, qualities, augmentations, gear, adeptPowers), [attributes, armor, qualities, augmentations, gear, adeptPowers]);
  const derivedByKey = useMemo(() => Object.fromEntries(derived.map((d) => [d.key, d])), [derived]);

  const getDerivedFor = (derivedKey: string): { label: string; value: string | number; valueTooltip?: string } => {
    if (derivedKey === "essence" || derivedKey === "magic" || derivedKey === "edge_points") {
      const labels: Record<string, string> = { essence: "Essence", magic: "Magic/Resonance", edge_points: "Edge Points" };
      const value = attributes[derivedKey as keyof SR6Attributes] ?? (derivedKey === "essence" ? 6 : 0);
      return {
        label: labels[derivedKey] ?? derivedKey,
        value,
        valueTooltip: buildAttrValueTooltip(derivedKey as keyof SR6Attributes, value, attributeSources, augmentations, gear, qualities, adeptPowers),
      };
    }
    const d = derivedByKey[derivedKey];
    return d ? { label: d.label, value: d.value, valueTooltip: d.tooltip } : { label: derivedKey, value: "—" };
  };

  const thirdColItems: { label: string; value: string | number; valueTooltip?: string; definition?: string }[] = [
    { label: "Unarmed", value: attributes.unarmed ?? "—", valueTooltip: buildAttrValueTooltip("unarmed", attributes.unarmed, attributeSources, augmentations, gear, qualities, adeptPowers), definition: ATTR_TOOLTIPS.unarmed },
    ...(derivedByKey.judge_intentions ? [{ label: derivedByKey.judge_intentions.label, value: derivedByKey.judge_intentions.value, valueTooltip: derivedByKey.judge_intentions.tooltip, definition: DERIVED_TOOLTIPS.judge_intentions }] : []),
    ...(derivedByKey.lift_carry ? [{ label: derivedByKey.lift_carry.label, value: derivedByKey.lift_carry.value, valueTooltip: derivedByKey.lift_carry.tooltip, definition: DERIVED_TOOLTIPS.lift_carry }] : []),
    ...(derivedByKey.defense_rating ? [{ label: derivedByKey.defense_rating.label, value: derivedByKey.defense_rating.value, valueTooltip: derivedByKey.defense_rating.tooltip, definition: DERIVED_TOOLTIPS.defense_rating }] : []),
  ];

  return (
    <Card className="border-border/50 bg-card/80 h-full flex flex-col min-h-0">
      <CardHeader className="shrink-0">
        <CardTitle className="font-display tracking-wider text-sm sm:text-base">ATTRIBUTES</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-auto">
        <div className="grid w-full grid-cols-[auto_auto_1fr_auto_auto_1fr_auto_auto] gap-x-2 gap-y-0">
          {PAIRED_ATTRS.map(({ attr, derivedKey }, index) => {
            const derived = getDerivedFor(derivedKey);
            const thirdCol = thirdColItems[index] ?? null;
            return (
              <PairedAttrRow
                key={attr.key}
                attrField={attr}
                attrValue={attributes[attr.key]}
                derivedLabel={derived.label}
                derivedValue={derived.value}
                derivedKey={derivedKey}
                attrValueTooltip={buildAttrValueTooltip(attr.key, attributes[attr.key], attributeSources, augmentations, gear, qualities, adeptPowers)}
                derivedValueTooltip={derived.valueTooltip}
                thirdCol={thirdCol}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
