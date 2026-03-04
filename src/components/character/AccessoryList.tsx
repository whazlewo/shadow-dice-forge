import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Info } from "lucide-react";
import type { WeaponAccessory } from "@/types/character";

interface Props {
  accessories: WeaponAccessory[];
  onChange: (accessories: WeaponAccessory[]) => void;
}

const AR_FORMAT_TOOLTIP = "Format: +2/+2/+2/+2/+2 (Point Blank / Short / Medium / Long / Extreme)";

export function AccessoryList({ accessories, onChange }: Props) {
  const add = () => onChange([...accessories, { name: "", ar_modifier: "", notes: "" }]);
  const remove = (i: number) => onChange(accessories.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof WeaponAccessory, value: string) => {
    const updated = [...accessories];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  return (
    <div className="mt-1 space-y-1">
      <div className="flex items-center gap-1">
        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Accessories</Label>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={add}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      {accessories.map((acc, i) => (
        <div key={i} className="flex items-center gap-1">
          <Input
            value={acc.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Accessory name"
            className="h-7 text-xs font-mono bg-muted/50 flex-[2] min-w-[120px]"
          />
          <div className="relative flex-1 min-w-[120px]">
            <Input
              value={acc.ar_modifier || ""}
              onChange={(e) => update(i, "ar_modifier", e.target.value)}
              placeholder="+0/+0/+0/+0/+0"
              className="h-7 text-xs font-mono bg-muted/50 pr-6"
            />
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/60 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[240px]">{AR_FORMAT_TOOLTIP}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            value={acc.notes || ""}
            onChange={(e) => update(i, "notes", e.target.value)}
            placeholder="Notes"
            className="h-7 text-xs font-mono bg-muted/50 flex-1 min-w-[100px]"
          />
          <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive shrink-0" onClick={() => remove(i)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
