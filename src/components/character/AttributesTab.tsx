import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import type { SR6Attributes, AttributeSources, SR6Augmentation, SR6Gear, SR6Armor, SR6Quality, DiceModifier } from "@/types/character";
import { useMemo } from "react";

type AttrField = { key: keyof SR6Attributes; label: string; type?: string };

const LEFT_COLUMN: AttrField[] = [
  { key: "body", label: "Body" },
  { key: "agility", label: "Agility" },
  { key: "reaction", label: "Reaction" },
  { key: "strength", label: "Strength" },
  { key: "willpower", label: "Willpower" },
  { key: "logic", label: "Logic" },
  { key: "intuition", label: "Intuition" },
  { key: "charisma", label: "Charisma" },
  { key: "edge", label: "Edge" },
  { key: "edge_points", label: "Edge Points" },
  { key: "unarmed", label: "Unarmed", type: "text" },
];

const RIGHT_EDITABLE: AttrField[] = [
  { key: "essence", label: "Essence", type: "number" },
  { key: "magic", label: "Magic/Resonance" },
];

interface DerivedStat {
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

  // Collect DR modifiers from qualities, augmentations, gear
  const drMods = collectDiceModifiers("defense_rating", qualities, augmentations, gear);

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

  // Initiative dice modifiers (e.g. Wired Reflexes, Synaptic Booster)
  const initDiceMods = collectDiceModifiers("initiative_dice", qualities, augmentations, gear);
  const initFlatMods = collectDiceModifiers("initiative", qualities, augmentations, gear);

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
    { label: "Initiative", value: `${initScore}+${totalInitDice}D6`, tooltip: initLines.join("\n") },
    { label: "Matrix Initiative", value: `${a.resonance ? (int + (a.resonance || 0)) : int}+${a.resonance ? "4" : "2"}D6`, tooltip: "Depends on interface mode" },
    { label: "Astral Initiative", value: a.magic ? `${int + int}+3D6` : "—", tooltip: "INT×2 + 3D6 (if magical)" },
    { label: "Composure", value: `${wil + cha}`, tooltip: "WIL + CHA" },
    { label: "Judge Intentions", value: `${wil + int}`, tooltip: "WIL + INT" },
    { label: "Memory", value: `${log + wil}`, tooltip: "LOG + WIL" },
    { label: "Lift/Carry", value: `${str + bod}(${(str + bod) * 2})`, tooltip: "STR + BOD (carry), ×2 (lift)" },
    { label: "Movement", value: `${Math.max(1, Math.floor((rea + str) / 2))}m`, tooltip: "Walk = (REA+STR)/2" },
    { label: "Defense Rating", value: `${totalDR}`, tooltip: drLines.join("\n") },
  ];
}

/** Collect dice modifiers for a given attribute key from qualities, augmentations, and gear */
function collectDiceModifiers(
  attrKey: string,
  qualities?: { name: string; dice_modifiers?: DiceModifier[]; equipped?: boolean }[],
  augmentations?: { name: string; dice_modifiers?: DiceModifier[]; equipped?: boolean }[],
  gear?: { name: string; dice_modifiers?: DiceModifier[]; equipped?: boolean }[],
): { source: string; value: number }[] {
  const mods: { source: string; value: number }[] = [];
  const scan = (items: { name: string; dice_modifiers?: DiceModifier[]; equipped?: boolean }[], alwaysEquipped = false) => {
    for (const item of items) {
      if (!alwaysEquipped && item.equipped === false) continue;
      for (const dm of item.dice_modifiers || []) {
        if (dm.attribute === attrKey) mods.push({ source: item.name, value: dm.value });
      }
    }
  };
  scan(qualities || []);
  scan(augmentations || [], true);
  scan((gear || []).filter((g) => g.equipped !== false));
  return mods;
}

function buildAttrTooltip(
  key: keyof SR6Attributes,
  value: any,
  sources?: AttributeSources,
  augmentations?: SR6Augmentation[],
  gear?: SR6Gear[],
): string {
  const gearMods = collectDiceModifiers(key, [], augmentations, gear);
  const src = sources?.[key as keyof typeof sources];

  if (!src) {
    const lines = [`Total: ${value}`];
    gearMods.forEach((m) => lines.push(`${m.source}: ${m.value > 0 ? "+" : ""}${m.value}`));
    return lines.join("\n");
  }

  const lines: string[] = [];
  if (key === "essence") {
    lines.push(`Base: ${src.base}`);
    // Essence loss shown as difference
    const loss = src.base - (typeof value === "number" ? value : 6);
    if (loss > 0) lines.push(`Augmentations: -${loss.toFixed(1)}`);
  } else {
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
  onUpdate: (attrs: SR6Attributes) => void;
}

function EditableRow({
  field,
  value,
  tooltipText,
  onChange,
}: {
  field: AttrField;
  value: any;
  tooltipText?: string;
  onChange: (key: keyof SR6Attributes, val: string) => void;
}) {
  const isText = field.type === "text";
  return (
    <div className="flex items-center gap-2 border-b border-border/30 py-1">
      <Label className="font-display text-xs tracking-wide text-muted-foreground text-right min-w-[110px] shrink-0 flex items-center justify-end gap-1">
        {field.label}
        {tooltipText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/60 cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="left" className="font-mono text-xs whitespace-pre-line">
              {tooltipText}
            </TooltipContent>
          </Tooltip>
        )}
      </Label>
      <Input
        type={isText ? "text" : "number"}
        value={value ?? (isText ? "" : 0)}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="font-mono text-sm h-8 bg-transparent border-none p-1 focus-visible:ring-0"
        min={field.key === "essence" ? 0 : undefined}
        step={field.key === "essence" ? 0.1 : undefined}
      />
    </div>
  );
}

function DerivedRow({ stat }: { stat: DerivedStat }) {
  return (
    <div className="flex items-center gap-2 border-b border-border/30 py-1">
      <Label className="font-display text-xs tracking-wide text-muted-foreground text-right min-w-[110px] shrink-0 flex items-center justify-end gap-1">
        {stat.label}
        {stat.tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/60 cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="left" className="font-mono text-xs">
              {stat.tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </Label>
      <span className="font-mono text-sm h-8 flex items-center px-1 text-foreground">
        {stat.value}
      </span>
    </div>
  );
}

export function AttributesTab({ attributes, attributeSources, augmentations, gear, armor, qualities, onUpdate }: Props) {
  const derived = useMemo(() => computeDerived(attributes, armor, qualities, augmentations, gear), [attributes, armor, qualities, augmentations, gear]);

  const handleChange = (key: keyof SR6Attributes, value: string) => {
    const field = [...LEFT_COLUMN, ...RIGHT_EDITABLE].find((f) => f.key === key);
    const isText = field?.type === "text";
    if (isText) {
      onUpdate({ ...attributes, [key]: value });
    } else {
      const num = parseFloat(value) || 0;
      onUpdate({ ...attributes, [key]: key === "essence" ? num : Math.max(0, Math.floor(num)) });
    }
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider">ATTRIBUTES</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            {LEFT_COLUMN.map((field) => (
              <EditableRow
                key={field.key}
                field={field}
                value={attributes[field.key]}
                tooltipText={buildAttrTooltip(field.key, attributes[field.key], attributeSources, augmentations, gear)}
                onChange={handleChange}
              />
            ))}
          </div>
          <div>
            {RIGHT_EDITABLE.map((field) => (
              <EditableRow
                key={field.key}
                field={field}
                value={attributes[field.key]}
                tooltipText={buildAttrTooltip(field.key, attributes[field.key], attributeSources, augmentations, gear)}
                onChange={handleChange}
              />
            ))}
            {derived.map((stat) => (
              <DerivedRow key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
