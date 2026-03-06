import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNuyen } from "@/data/sr6-reference";
import { GEAR_REFERENCE } from "@/data/gear-reference";
import type { GearCategory, GearReference } from "@/types/gear-reference";

type ReferenceItem = GearReference[GearCategory][number];

const CATEGORY_LABELS: Record<GearCategory, string> = {
  rangedWeapons: "Ranged Weapons",
  meleeWeapons: "Melee Weapons",
  armor: "Armor",
  electronics: "Electronics",
  augmentations: "Augmentations",
  vehicles: "Vehicles / Drones",
  miscellaneous: "Miscellaneous",
};

function getItemLabel(item: ReferenceItem): string {
  const name = "name" in item ? item.name : "";
  const cost = "cost" in item ? item.cost : 0;
  const subtype = "subtype" in item ? item.subtype : undefined;
  const parts = [name, subtype].filter(Boolean);
  return `${parts.join(" · ")} (${formatNuyen(cost)})`;
}

interface Props {
  category?: GearCategory;
  onSelect: (item: ReferenceItem, category: GearCategory) => void;
  placeholder?: string;
  triggerLabel?: string;
}

export function GearReferenceSelect({
  category,
  onSelect,
  placeholder = "Search gear…",
  triggerLabel = "Add from reference",
}: Props) {
  const [open, setOpen] = useState(false);

  const categories = category
    ? [category]
    : (Object.keys(GEAR_REFERENCE) as GearCategory[]);
  const hasItems = categories.some((c) => (GEAR_REFERENCE[c]?.length ?? 0) > 0);

  const handleSelect = (item: ReferenceItem, cat: GearCategory) => {
    onSelect(item, cat);
    setOpen(false);
  };

  if (!hasItems) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="font-display tracking-wide">
          {triggerLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <TooltipProvider delayDuration={300}>
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              {categories.map((cat) => {
                const items = GEAR_REFERENCE[cat] ?? [];
                if (items.length === 0) return null;
                return (
                  <CommandGroup key={cat} heading={CATEGORY_LABELS[cat]}>
                    {items.map((item, idx) => {
                      const label = getItemLabel(item);
                      const desc = "description" in item ? item.description : undefined;
                      const itemEl = (
                        <CommandItem
                          key={`${cat}-${idx}`}
                          value={`${cat} ${label}`}
                          onSelect={() => handleSelect(item, cat)}
                          className="flex flex-col items-start gap-0.5 py-2"
                        >
                          <span className="font-mono text-sm">{label}</span>
                        </CommandItem>
                      );
                      return desc ? (
                        <Tooltip key={`${cat}-${idx}`}>
                          <TooltipTrigger asChild>{itemEl}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="max-w-[320px] max-h-[200px] overflow-y-auto text-xs whitespace-pre-wrap"
                          >
                            {desc}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        itemEl
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </TooltipProvider>
      </PopoverContent>
    </Popover>
  );
}
