import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardStepperProps {
  steps: string[];
  currentStep: number;
}

export default function WizardStepper({ steps, currentStep }: WizardStepperProps) {
  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                  done && "bg-primary border-primary text-primary-foreground",
                  active && "border-primary text-primary bg-primary/10",
                  !done && !active && "border-muted-foreground/30 text-muted-foreground/50"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-mono tracking-wide whitespace-nowrap",
                  active ? "text-primary" : done ? "text-foreground/70" : "text-muted-foreground/50"
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-2 mt-[-18px]",
                  i < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
