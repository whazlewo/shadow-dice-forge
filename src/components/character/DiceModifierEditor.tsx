import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, X } from "lucide-react";
import { SR6_CORE_SKILLS } from "@/types/character";
import type { DiceModifier } from "@/types/character";

interface Props {
  modifiers: DiceModifier[];
  onChange: (mods: DiceModifier[]) => void;
}

export function DiceModifierEditor({ modifiers, onChange }: Props) {
  // Filter out attribute-based modifiers (handled by EffectsEditor)
  const skillModifiers = modifiers.filter((m) => !m.attribute);
  const attrModifiers = modifiers.filter((m) => m.attribute);

  const merge = (newSkillMods: DiceModifier[]) => onChange([...attrModifiers, ...newSkillMods]);

  const add = () => merge([...skillModifiers, { skill: "", value: 1, source: "" }]);
  const remove = (i: number) => merge(skillModifiers.filter((_, idx) => idx !== i));
  const update = (i: number, u: Partial<DiceModifier>) =>
    merge(skillModifiers.map((m, idx) => (idx === i ? { ...m, ...u } : m)));

  return (
    <div className="space-y-1">
      <Label className="text-xs font-display tracking-wide">Dice Modifiers</Label>
      {skillModifiers.length > 0 && (
        <div className="flex gap-1 items-center flex-wrap text-[10px] text-muted-foreground uppercase tracking-widest">
          <span className="flex-1 min-w-[120px]">Skill</span>
          <span className="w-16">Value</span>
          <span className="flex-1 min-w-[100px]">Requires Accessory</span>
          <span className="h-6 w-6" />
        </div>
      )}
      {skillModifiers.map((mod, i) => (
        <div key={i} className="flex gap-1 items-center flex-wrap">
          <Select value={mod.skill || "__all__"} onValueChange={(v) => update(i, { skill: v === "__all__" ? undefined : v })}>
            <SelectTrigger className="font-mono text-xs h-8 flex-1 min-w-[120px]">
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Skills</SelectItem>
              {SR6_CORE_SKILLS.map((s) => (
                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={mod.value}
            onChange={(e) => update(i, { value: parseInt(e.target.value) || 0 })}
            className="w-16 h-8 font-mono text-xs"
            placeholder="+/-"
          />
          <Input
            value={mod.requires_accessory || ""}
            onChange={(e) => update(i, { requires_accessory: e.target.value || undefined })}
            className="h-8 font-mono text-xs flex-1 min-w-[100px]"
            placeholder="Requires accessory (e.g. Smartgun)"
          />
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => remove(i)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add} className="text-xs h-7">
        <PlusCircle className="h-3 w-3 mr-1" /> Add Modifier
      </Button>
    </div>
  );
}
