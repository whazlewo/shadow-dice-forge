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
import { QUALITY_REFERENCE } from "@/data/quality-reference";
import { referenceToCharacterQuality, referenceToWizardQuality } from "@/lib/quality-reference-utils";
import type { ReferenceQuality } from "@/types/quality-reference";
import type { SR6Quality, WizardQuality } from "@/types/character";

function getLabel(item: ReferenceQuality): string {
  const cost = item.karma_cost;
  return `${item.name} (${cost > 0 ? "+" : ""}${cost} Karma)`;
}

interface Props {
  onSelect: (item: SR6Quality | WizardQuality) => void;
  /** "character" uses referenceToCharacterQuality; "wizard" uses referenceToWizardQuality */
  mode?: "character" | "wizard";
  category?: "positive" | "negative";
  placeholder?: string;
  triggerLabel?: string;
}

export function QualityReferenceSelect({
  onSelect,
  mode = "character",
  category,
  placeholder = "Search qualities…",
  triggerLabel = "Add from reference",
}: Props) {
  const [open, setOpen] = useState(false);

  const positiveQualities = QUALITY_REFERENCE.filter(
    (q) => q.type === "positive" && (!category || category === "positive"),
  );
  const negativeQualities = QUALITY_REFERENCE.filter(
    (q) => q.type === "negative" && (!category || category === "negative"),
  );

  const hasItems = positiveQualities.length > 0 || negativeQualities.length > 0;

  const handleSelect = (ref: ReferenceQuality) => {
    const converted =
      mode === "wizard"
        ? referenceToWizardQuality(ref)
        : referenceToCharacterQuality(ref);
    onSelect(converted);
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
              <CommandEmpty>No qualities found.</CommandEmpty>
              {positiveQualities.length > 0 && (
                <CommandGroup heading="Positive Qualities">
                  {positiveQualities.map((item, idx) => {
                    const label = getLabel(item);
                    const desc = item.description;
                    const itemEl = (
                      <CommandItem
                        key={idx}
                        value={`${item.name} ${item.karma_cost} positive`}
                        onSelect={() => handleSelect(item)}
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
              {negativeQualities.length > 0 && (
                <CommandGroup heading="Negative Qualities">
                  {negativeQualities.map((item, idx) => {
                    const label = getLabel(item);
                    const desc = item.description;
                    const itemEl = (
                      <CommandItem
                        key={idx}
                        value={`${item.name} ${item.karma_cost} negative`}
                        onSelect={() => handleSelect(item)}
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
