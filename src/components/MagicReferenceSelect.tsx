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
import { SPELL_REFERENCE, ADEPT_POWER_REFERENCE, COMPLEX_FORM_REFERENCE } from "@/data/magic-reference";
import {
  referenceToCharacterSpell,
  referenceToCharacterAdeptPower,
  referenceToCharacterComplexForm,
} from "@/lib/magic-reference-utils";
import type { ReferenceSpell, ReferenceAdeptPower, ReferenceComplexForm } from "@/types/magic-reference";
import type { SR6Spell, SR6AdeptPower } from "@/types/character";

export type MagicReferenceCategory = "spells" | "adeptPowers" | "complexForms";

const CATEGORY_LABELS: Record<MagicReferenceCategory, string> = {
  spells: "Spells",
  adeptPowers: "Adept Powers",
  complexForms: "Complex Forms",
};

function getSpellLabel(item: ReferenceSpell): string {
  return `${item.name} (${item.type}, ${item.drain})`;
}

function getAdeptPowerLabel(item: ReferenceAdeptPower): string {
  return `${item.name} (${item.pp_cost} PP)`;
}

function getComplexFormLabel(item: ReferenceComplexForm): string {
  return `${item.name} (Fade: ${item.fade})`;
}

interface Props {
  category: MagicReferenceCategory;
  onSelect: (item: SR6Spell | SR6AdeptPower) => void;
  placeholder?: string;
  triggerLabel?: string;
}

export function MagicReferenceSelect({
  category,
  onSelect,
  placeholder = "Search…",
  triggerLabel = "Add from reference",
}: Props) {
  const [open, setOpen] = useState(false);

  const items =
    category === "spells"
      ? SPELL_REFERENCE
      : category === "adeptPowers"
        ? ADEPT_POWER_REFERENCE
        : COMPLEX_FORM_REFERENCE;

  const hasItems = items.length > 0;

  const handleSelectSpell = (ref: ReferenceSpell) => {
    onSelect(referenceToCharacterSpell(ref));
    setOpen(false);
  };

  const handleSelectAdeptPower = (ref: ReferenceAdeptPower) => {
    onSelect(referenceToCharacterAdeptPower(ref));
    setOpen(false);
  };

  const handleSelectComplexForm = (ref: ReferenceComplexForm) => {
    onSelect(referenceToCharacterComplexForm(ref));
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
              {category === "spells" && (
                <CommandGroup heading={CATEGORY_LABELS.spells}>
                  {(items as ReferenceSpell[]).map((item, idx) => {
                    const label = getSpellLabel(item);
                    const desc = item.description;
                    const itemEl = (
                      <CommandItem
                        key={idx}
                        value={`${item.name} ${item.type} ${item.drain}`}
                        onSelect={() => handleSelectSpell(item)}
                        className="flex flex-col items-start gap-0.5 py-2"
                      >
                        <span className="font-mono text-sm">{label}</span>
                      </CommandItem>
                    );
                    return desc ? (
                      <Tooltip key={idx}>
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
              )}
              {category === "adeptPowers" && (
                <CommandGroup heading={CATEGORY_LABELS.adeptPowers}>
                  {(items as ReferenceAdeptPower[]).map((item, idx) => {
                    const label = getAdeptPowerLabel(item);
                    const desc = item.description;
                    const itemEl = (
                      <CommandItem
                        key={idx}
                        value={`${item.name} ${item.pp_cost}`}
                        onSelect={() => handleSelectAdeptPower(item)}
                        className="flex flex-col items-start gap-0.5 py-2"
                      >
                        <span className="font-mono text-sm">{label}</span>
                      </CommandItem>
                    );
                    return desc ? (
                      <Tooltip key={idx}>
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
              )}
              {category === "complexForms" && (
                <CommandGroup heading={CATEGORY_LABELS.complexForms}>
                  {(items as ReferenceComplexForm[]).map((item, idx) => {
                    const label = getComplexFormLabel(item);
                    const desc = item.description;
                    const itemEl = (
                      <CommandItem
                        key={idx}
                        value={`${item.name} ${item.fade}`}
                        onSelect={() => handleSelectComplexForm(item)}
                        className="flex flex-col items-start gap-0.5 py-2"
                      >
                        <span className="font-mono text-sm">{label}</span>
                      </CommandItem>
                    );
                    return desc ? (
                      <Tooltip key={idx}>
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
              )}
            </CommandList>
          </Command>
        </TooltipProvider>
      </PopoverContent>
    </Popover>
  );
}
