import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, X, Pencil } from "lucide-react";
import { SR6_CORE_SKILLS } from "@/types/character";
import type { DiceModifier } from "@/types/character";

interface Props {
  modifiers: DiceModifier[];
  onChange: (mods: DiceModifier[]) => void;
}

export function DiceModifierEditor({ modifiers, onChange }: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const skillModifiers = modifiers.filter((m) => !m.attribute);
  const attrModifiers = modifiers.filter((m) => m.attribute);

  const merge = (newSkillMods: DiceModifier[]) => onChange([...attrModifiers, ...newSkillMods]);

  const add = () => {
    merge([...skillModifiers, { skill: "", value: 1, source: "" }]);
    setEditingIdx(skillModifiers.length);
  };
  const remove = (i: number) => {
    merge(skillModifiers.filter((_, idx) => idx !== i));
    setEditingIdx(null);
  };
  const update = (i: number, u: Partial<DiceModifier>) =>
    merge(skillModifiers.map((m, idx) => (idx === i ? { ...m, ...u } : m)));

  const formatSign = (v: number) => (v > 0 ? `+${v}` : `${v}`);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {skillModifiers.map((mod, i) =>
          editingIdx === i ? (
            <div key={i} className="flex gap-1 items-center w-full">
              <Select value={mod.skill || "__all__"} onValueChange={(v) => update(i, { skill: v === "__all__" ? undefined : v })}>
                <SelectTrigger className="font-mono text-xs h-7 flex-1 min-w-[120px]">
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
                className="w-14 h-7 font-mono text-xs"
                placeholder="+/-"
              />
              <Input
                value={mod.requires_accessory || ""}
                onChange={(e) => update(i, { requires_accessory: e.target.value || undefined })}
                className="h-7 font-mono text-xs flex-1 min-w-[80px]"
                placeholder="Requires (e.g. Smartgun)"
              />
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingIdx(null)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => remove(i)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Badge
              key={i}
              variant="outline"
              className="gap-1 pl-2 pr-1 py-0.5 font-mono text-xs cursor-pointer hover:bg-muted/50"
              onClick={() => setEditingIdx(i)}
            >
              {mod.skill || "All Skills"} {formatSign(mod.value)}
              {mod.requires_accessory && (
                <span className="text-muted-foreground font-normal">(req: {mod.requires_accessory})</span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); remove(i); }}
                className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5"
              >
                <X className="h-2.5 w-2.5 text-destructive" />
              </button>
            </Badge>
          )
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={add} className="text-xs h-6 px-2">
        <PlusCircle className="h-3 w-3 mr-1" /> Add Modifier
      </Button>
    </div>
  );
}
