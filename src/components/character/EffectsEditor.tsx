import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  { attribute: "initiative", label: "Initiative" },
  { attribute: "initiative_dice", label: "Init Dice" },
  { attribute: "defense_rating", label: "Def Rating" },
];

interface Props {
  modifiers: DiceModifier[];
  onChange: (mods: DiceModifier[]) => void;
}

export function EffectsEditor({ modifiers, onChange }: Props) {
  const [addingAttr, setAddingAttr] = useState(false);
  const [newAttr, setNewAttr] = useState("body");
  const [newAttrVal, setNewAttrVal] = useState(1);

  const effects = modifiers.filter((m) => m.attribute);
  const skillMods = modifiers.filter((m) => !m.attribute);
  const merge = (newEffects: DiceModifier[]) => onChange([...newEffects, ...skillMods]);

  const attrBonuses = effects.filter(
    (m) => m.attribute && !SPECIAL_EFFECTS.some((s) => s.attribute === m.attribute)
  );

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

  const commitNewAttr = () => {
    if (newAttrVal !== 0) {
      merge([...effects, { attribute: newAttr, value: newAttrVal, source: "" }]);
    }
    setAddingAttr(false);
    setNewAttr("body");
    setNewAttrVal(1);
  };

  const getSpecialValue = (attr: string): number => {
    const found = effects.find((m) => m.attribute === attr);
    return found ? found.value : 0;
  };

  const setSpecialValue = (attr: string, value: number) => {
    const idx = effects.findIndex((m) => m.attribute === attr);
    if (value === 0 && idx >= 0) {
      merge(effects.filter((_, j) => j !== idx));
    } else if (idx >= 0) {
      const updated = [...effects];
      updated[idx] = { ...updated[idx], value };
      merge(updated);
    } else if (value !== 0) {
      merge([...effects, { attribute: attr, value, source: "" }]);
    }
  };

  const formatSign = (v: number) => (v > 0 ? `+${v}` : `${v}`);

  return (
    <div className="space-y-3">
      {/* Special stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {SPECIAL_EFFECTS.map((se) => (
          <div key={se.attribute} className="rounded-md bg-muted/40 p-2 text-center">
            <Label className="text-[9px] text-muted-foreground uppercase tracking-widest block mb-1">
              {se.label}
            </Label>
            <Input
              type="number"
              value={getSpecialValue(se.attribute) || ""}
              onChange={(e) => setSpecialValue(se.attribute, parseInt(e.target.value) || 0)}
              className="w-full h-7 font-mono text-xs text-center bg-background/50"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {/* Attribute bonuses as pills */}
      <div className="space-y-1.5">
        <Label className="text-[9px] text-muted-foreground uppercase tracking-widest">Attribute Bonuses</Label>
        <div className="flex flex-wrap gap-1.5">
          {attrBonuses.map((mod, i) => (
            <Badge key={i} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1 font-mono text-xs">
              {ATTRIBUTE_OPTIONS.find((a) => a.value === mod.attribute)?.label || mod.attribute}{" "}
              {formatSign(mod.value)}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 text-destructive hover:bg-destructive/20 rounded-full"
                onClick={() => removeAttrBonus(i)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {addingAttr ? (
            <div className="flex items-center gap-1">
              <Select value={newAttr} onValueChange={setNewAttr}>
                <SelectTrigger className="h-7 text-xs w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTE_OPTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value} className="text-xs">{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={newAttrVal}
                onChange={(e) => setNewAttrVal(parseInt(e.target.value) || 0)}
                className="w-14 h-7 font-mono text-xs"
              />
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={commitNewAttr}>
                Add
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs px-1" onClick={() => setAddingAttr(false)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setAddingAttr(true)} className="text-xs h-6 px-2">
              <PlusCircle className="h-3 w-3 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
