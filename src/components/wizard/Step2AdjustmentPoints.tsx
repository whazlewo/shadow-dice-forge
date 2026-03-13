import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Minus, Plus } from "lucide-react";
import { PRIORITY_TABLE, METATYPE_DATA, type PriorityLevel } from "@/data/sr6-reference";
import type { WizardState } from "@/pages/CharacterWizard";
import type { SR6Attributes } from "@/types/character";
import { cn } from "@/lib/utils";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step2AdjustmentPoints({ state, onChange }: Props) {
  const metatypePriority = state.priorities.metatype as PriorityLevel | undefined;
  const metatype = state.metatype;

  if (!metatypePriority || !metatype) {
    return (
      <p className="text-sm text-muted-foreground">
        Choose your metatype above, then select your magic type before spending adjustment points.
      </p>
    );
  }

  const row = PRIORITY_TABLE[metatypePriority];
  const totalAdj = row.metatype.adjustmentPoints;
  const { adjustmentPoints, magicChoice } = state;

  const spentAdj = Object.values(adjustmentPoints ?? {}).reduce((a, b) => a + b, 0);
  const remainingAdj = totalAdj - spentAdj;

  const adjustAttr = (attr: keyof SR6Attributes, delta: number) => {
    const current = (adjustmentPoints ?? {})[attr] || 0;
    const newVal = current + delta;
    if (newVal < 0) return;
    if (delta > 0 && remainingAdj <= 0) return;
    const updated = { ...(adjustmentPoints ?? {}), [attr]: newVal };
    if (newVal === 0) delete updated[attr];
    onChange({ adjustmentPoints: updated });
  };

  const mtData = METATYPE_DATA[metatype];
  const adjustableAttrs: (keyof SR6Attributes)[] = mtData ? [...mtData.adjustableAttributes] : [];

  const magicPriority = state.priorities.magic_resonance as PriorityLevel | undefined;
  const hasMagicOrResonance = magicPriority && magicPriority !== "E";
  if (hasMagicOrResonance) {
    if (magicChoice === "technomancer") {
      adjustableAttrs.push("resonance");
    } else if (magicChoice === "full" || magicChoice === "aspected" || magicChoice === "mystic_adept" || magicChoice === "adept") {
      adjustableAttrs.push("magic");
    }
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-display text-sm tracking-wider uppercase text-muted-foreground leading-tight">Adjustment Points</h4>
            <Badge variant={remainingAdj < 0 ? "destructive" : "outline"} className="font-mono">
              {remainingAdj} / {totalAdj} remaining
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3 mt-0">
            Spend adjustment points on Edge, Magic/Resonance, or metatype special attributes.
          </p>
        {remainingAdj < 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            You&apos;ve overspent adjustment points.
          </div>
        )}
          {adjustableAttrs.map((attr) => {
          const current = (adjustmentPoints ?? {})[attr] || 0;
          return (
            <div key={attr} className="flex items-center gap-3">
              <span className="w-28 font-display text-sm capitalize tracking-wide">{attr}</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustAttr(attr, -1)} disabled={current <= 0}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className={cn("font-mono text-lg w-8 text-center", current > 0 && "text-primary")}>
                {current}
              </span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustAttr(attr, 1)} disabled={remainingAdj <= 0}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
        </div>
      </CardContent>
    </Card>
  );
}
