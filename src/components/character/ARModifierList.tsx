import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Info } from "lucide-react";
import type { ARModifier } from "@/types/character";

interface Props {
  modifiers: ARModifier[];
  onChange: (modifiers: ARModifier[]) => void;
}

const FORMAT_TOOLTIP = "Format: +2/+2/+2/+2/+2 (Point Blank / Short / Medium / Long / Extreme)";

export function ARModifierList({ modifiers, onChange }: Props) {
  const add = () => onChange([...modifiers, { source: "", values: "" }]);
  const remove = (i: number) => onChange(modifiers.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof ARModifier, value: string) => {
    const updated = [...modifiers];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <div className="mt-1 space-y-1">
      <div className="flex items-center gap-1">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">AR Modifiers</Label>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={add}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      {modifiers.map((mod, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            value={mod.source}
            onChange={(e) => update(i, "source", e.target.value)}
            placeholder="Source (e.g. Smartgun)"
            className="h-7 text-xs font-mono bg-muted/50 flex-1 min-w-[120px]"
          />
          <div className="relative flex-1 min-w-[120px]">
            <Input
              value={mod.values}
              onChange={(e) => update(i, "values", e.target.value)}
              placeholder="+2/+2/+2/+2/+2"
              className="h-7 text-xs font-mono bg-muted/50 pr-6"
            />
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/60 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[240px]">{FORMAT_TOOLTIP}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive shrink-0" onClick={() => remove(i)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
