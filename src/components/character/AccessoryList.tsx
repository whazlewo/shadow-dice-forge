import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Info, BookOpen } from "lucide-react";
import { WEAPON_ACCESSORIES_REFERENCE } from "@/data/gear-reference";
import { formatNuyen } from "@/data/sr6-reference";
import { referenceToWeaponAccessory } from "@/lib/gear-reference-utils";
import type { WeaponAccessory } from "@/types/character";

interface Props {
  accessories: WeaponAccessory[];
  onChange: (accessories: WeaponAccessory[]) => void;
}

const AR_FORMAT_TOOLTIP = "Format: +2/+2/+2/+2/+2 (Point Blank / Short / Medium / Long / Extreme)";

export function AccessoryList({ accessories, onChange }: Props) {
  const [refOpen, setRefOpen] = useState(false);

  const add = () => onChange([...accessories, { name: "", ar_modifier: "", notes: "" }]);
  const addFromReference = (acc: (typeof WEAPON_ACCESSORIES_REFERENCE)[number]) => {
    onChange([...accessories, referenceToWeaponAccessory(acc)]);
    setRefOpen(false);
  };
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
        <Popover open={refOpen} onOpenChange={setRefOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-5 gap-1 px-1.5 text-[10px] font-display">
              <BookOpen className="h-3 w-3" />
              From reference
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[360px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search accessories…" />
              <CommandList>
                <CommandEmpty>No accessories found.</CommandEmpty>
                <CommandGroup heading="Core Rulebook">
                  {WEAPON_ACCESSORIES_REFERENCE.map((acc, idx) => (
                    <CommandItem
                      key={idx}
                      value={`${acc.name} ${acc.notes ?? ""} ${acc.mount}`}
                      onSelect={() => addFromReference(acc)}
                      className="flex flex-col items-start gap-0.5 py-2"
                    >
                      <span className="font-mono text-sm">{acc.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatNuyen(acc.cost)} · {acc.availability}
                        {acc.ar_modifier ? ` · ${acc.ar_modifier}` : ""}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
