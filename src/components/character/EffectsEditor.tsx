import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, X } from "lucide-react";
import type { DiceModifier } from "@/types/character";

const ATTRIBUTE_OPTIONS = [
  { value: "body", label: "Body" },
  { value: "agility", label: "Agility" },
  { value: "reaction", label: "Reaction" },
  { value: "strength", label: "Strength" },
  { value: "willpower", label: "Willpower" },
  { value: "logic", label: "Logic" },
  { value: "intuition", label: "Intuition" },
  { value: "charisma", label: "Charisma" },
  { value: "edge", label: "Edge" },
];

const SPECIAL_EFFECTS = [
  { attribute: "initiative", label: "Initiative Bonus" },
  { attribute: "initiative_dice", label: "Initiative Dice" },
  { attribute: "defense_rating", label: "Defense Rating" },
];

interface Props {
  /** The full dice_modifiers array for this item */
  modifiers: DiceModifier[];
  /** Called with the full updated array (effects + skill mods merged) */
  onChange: (mods: DiceModifier[]) => void;
}

/**
 * Manages attribute-based effects (attribute bonuses, initiative, DR).
 * Reads/writes the same DiceModifier[] as DiceModifierEditor, but only
 * touches entries where `attribute` is set.
 */
export function EffectsEditor({ modifiers, onChange }: Props) {
  const effects = modifiers.filter((m) => m.attribute);
  const skillMods = modifiers.filter((m) => !m.attribute);

  const merge = (newEffects: DiceModifier[]) => onChange([...newEffects, ...skillMods]);

  // --- Attribute bonus rows ---
  const attrBonuses = effects.filter(
    (m) => m.attribute && !SPECIAL_EFFECTS.some((s) => s.attribute === m.attribute)
  );

  const addAttrBonus = () =>
    merge([...effects, { attribute: "body", value: 1, source: "" }]);

  const updateAttrBonus = (i: number, patch: Partial<DiceModifier>) => {
    const updated = [...effects];
    // Find the actual index in the effects array for this attr bonus
    let attrIdx = 0;
    for (let j = 0; j < effects.length; j++) {
      if (!SPECIAL_EFFECTS.some((s) => s.attribute === effects[j].attribute)) {
        if (attrIdx === i) {
          updated[j] = { ...updated[j], ...patch };
          break;
        }
        attrIdx++;
      }
    }
    merge(updated);
  };

  const removeAttrBonus = (i: number) => {
    const updated = [...effects];
    let attrIdx = 0;
    for (let j = 0; j < updated.length; j++) {
      if (!SPECIAL_EFFECTS.some((s) => s.attribute === updated[j].attribute)) {
        if (attrIdx === i) {
          updated.splice(j, 1);
          break;
        }
        attrIdx++;
      }
    }
    merge(updated);
  };

  // --- Special effect helpers ---
  const getSpecialValue = (attr: string): number => {
    const found = effects.find((m) => m.attribute === attr);
    return found ? found.value : 0;
  };

  const setSpecialValue = (attr: string, value: number) => {
    const idx = effects.findIndex((m) => m.attribute === attr);
    if (value === 0 && idx >= 0) {
      // Remove
      merge(effects.filter((_, j) => j !== idx));
    } else if (idx >= 0) {
      const updated = [...effects];
      updated[idx] = { ...updated[idx], value };
      merge(updated);
    } else if (value !== 0) {
      merge([...effects, { attribute: attr, value, source: "" }]);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-display tracking-wide">Effects</Label>

      {/* Special single-value fields */}
      <div className="flex flex-wrap gap-3">
        {SPECIAL_EFFECTS.map((se) => (
          <div key={se.attribute} className="flex items-center gap-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest whitespace-nowrap">
              {se.label}
            </Label>
            <Input
              type="number"
              value={getSpecialValue(se.attribute) || ""}
              onChange={(e) => setSpecialValue(se.attribute, parseInt(e.target.value) || 0)}
              className="w-16 h-7 font-mono text-xs"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {/* Attribute bonus rows */}
      {attrBonuses.length > 0 && (
        <div className="flex gap-1 items-center text-[10px] text-muted-foreground uppercase tracking-widest">
          <span className="flex-1 min-w-[120px]">Attribute</span>
          <span className="w-16">Value</span>
          <span className="h-6 w-6" />
        </div>
      )}
      {attrBonuses.map((mod, i) => (
        <div key={i} className="flex gap-1 items-center">
          <Select
            value={mod.attribute || "body"}
            onValueChange={(v) => updateAttrBonus(i, { attribute: v })}
          >
            <SelectTrigger className="font-mono text-xs h-8 flex-1 min-w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTRIBUTE_OPTIONS.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={mod.value}
            onChange={(e) => updateAttrBonus(i, { value: parseInt(e.target.value) || 0 })}
            className="w-16 h-8 font-mono text-xs"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={() => removeAttrBonus(i)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={addAttrBonus} className="text-xs h-7">
        <PlusCircle className="h-3 w-3 mr-1" /> Add Attribute Bonus
      </Button>
    </div>
  );
}
