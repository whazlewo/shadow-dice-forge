import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Step2Metatype({ state, onChange }: Props) {
  const metatypePriority = state.priorities.metatype as PriorityLevel;
  const row = PRIORITY_TABLE[metatypePriority];
  const availableMetatypes = row.metatype.metatypes;
  const totalAdj = row.metatype.adjustmentPoints;
  const { metatype, adjustmentPoints } = state;

  const spentAdj = Object.values(adjustmentPoints).reduce((a, b) => a + b, 0);
  const remainingAdj = totalAdj - spentAdj;

  const handleSelectMetatype = (mt: string) => {
    onChange({ metatype: mt, adjustmentPoints: {} });
  };

  const adjustAttr = (attr: keyof SR6Attributes, delta: number) => {
    const current = adjustmentPoints[attr] || 0;
    const newVal = current + delta;
    if (newVal < 0) return;
    if (delta > 0 && remainingAdj <= 0) return;
    const updated = { ...adjustmentPoints, [attr]: newVal };
    if (newVal === 0) delete updated[attr];
    onChange({ adjustmentPoints: updated });
  };

  const mtData = metatype ? METATYPE_DATA[metatype] : null;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide">Choose Metatype</CardTitle>
          <p className="text-sm text-muted-foreground">
            Priority {metatypePriority} allows: {availableMetatypes.join(", ")} with {totalAdj} adjustment points.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {availableMetatypes.map((mt) => (
              <Button
                key={mt}
                variant={metatype === mt ? "default" : "outline"}
                onClick={() => handleSelectMetatype(mt)}
                className="font-display tracking-wide"
              >
                {mt}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {mtData && (
        <>
          {mtData.racialQualities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground font-display tracking-wide mr-1 pt-0.5">RACIAL QUALITIES:</span>
              {mtData.racialQualities.map((q) => (
                <Badge key={q} variant="secondary" className="font-mono text-xs">{q}</Badge>
              ))}
            </div>
          )}

          <Card className="border-border/50 bg-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-lg tracking-wide">Adjustment Points</CardTitle>
                <Badge variant={remainingAdj < 0 ? "destructive" : "outline"} className="font-mono">
                  {remainingAdj} / {totalAdj} remaining
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Spend adjustment points on Edge, Magic/Resonance, or metatype special attributes.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {remainingAdj < 0 && (
                <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  You've overspent adjustment points.
                </div>
              )}
              {mtData.adjustableAttributes.map((attr) => {
                const current = adjustmentPoints[attr] || 0;
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
