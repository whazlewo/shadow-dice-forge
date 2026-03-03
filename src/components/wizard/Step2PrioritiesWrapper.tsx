import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Step1Priorities from "./Step1Priorities";
import Step2Metatype from "./Step2Metatype";
import Step3Attributes from "./Step3Attributes";
import Step4Skills from "./Step4Skills";
import Step5Magic from "./Step5Magic";
import type { WizardState } from "@/pages/CharacterWizard";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const SECTIONS = [
  { key: "priorities", label: "Priority Table", Component: Step1Priorities },
  { key: "metatype", label: "Metatype", Component: Step2Metatype },
  { key: "attributes", label: "Attributes", Component: Step3Attributes },
  { key: "skills", label: "Skills", Component: Step4Skills },
  { key: "magic", label: "Magic / Resonance", Component: Step5Magic },
] as const;

export default function Step2PrioritiesWrapper({ state, onChange }: Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    priorities: true,
    metatype: true,
    attributes: true,
    skills: true,
    magic: true,
  });

  const toggle = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      {SECTIONS.map(({ key, label, Component }) => (
        <Collapsible key={key} open={openSections[key]} onOpenChange={() => toggle(key)}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-border/50 bg-card/60 px-4 py-3 font-display text-sm tracking-wider uppercase hover:bg-card/80 transition-colors">
            {label}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${openSections[key] ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <Component state={state} onChange={onChange} />
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
