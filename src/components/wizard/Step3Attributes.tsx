import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Minus, Plus } from "lucide-react";
import { PRIORITY_TABLE, METATYPE_DATA, BASE_ATTRIBUTES, type PriorityLevel } from "@/data/sr6-reference";
import type { WizardState } from "@/pages/CharacterWizard";
import type { SR6Attributes } from "@/types/character";
import { cn } from "@/lib/utils";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step3Attributes({ state, onChange }: Props) {
  const attrPriority = state.priorities.attributes as PriorityLevel;
  const totalPoints = PRIORITY_TABLE[attrPriority].attributes;
  const mtData = METATYPE_DATA[state.metatype || "Human"];
  const { attributes, adjustmentPoints } = state;

  // Attribute points spent (above base 1 per attribute, minus adjustment points)
  const spentPoints = BASE_ATTRIBUTES.reduce((sum, attr) => {
    const base = 1;
    const adjBonus = adjustmentPoints[attr] || 0;
    const current = attributes[attr] || 1;
    return sum + Math.max(0, current - base - adjBonus);
  }, 0);

  const remaining = totalPoints - spentPoints;

  // Count how many attributes are at metatype max
  const atMaxCount = BASE_ATTRIBUTES.filter((attr) => {
    const max = mtData.attributes[attr][1];
    return (attributes[attr] || 1) >= max;
  }).length;

  const adjustAttr = (attr: keyof SR6Attributes, delta: number) => {
    const current = attributes[attr] || 1;
    const newVal = current + delta;
    const min = mtData.attributes[attr as keyof typeof mtData.attributes]?.[0] ?? 1;
    const max = mtData.attributes[attr as keyof typeof mtData.attributes]?.[1] ?? 6;
    if (newVal < min || newVal > max) return;
    if (delta > 0 && remaining <= 0) return;
    onChange({ attributes: { ...attributes, [attr]: newVal } });
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg tracking-wide">Attributes</CardTitle>
          <Badge variant={remaining < 0 ? "destructive" : "outline"} className="font-mono">
            {remaining} / {totalPoints} remaining
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Spend attribute points. All start at 1. Only one attribute may be at metatype maximum.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {remaining < 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            You've overspent attribute points.
          </div>
        )}
        {atMaxCount > 1 && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Only one attribute should be at metatype maximum at creation.
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {BASE_ATTRIBUTES.map((attr) => {
            const current = attributes[attr] || 1;
            const [min, max] = mtData.attributes[attr];
            const adjBonus = adjustmentPoints[attr] || 0;
            const isAtMax = current >= max;

            return (
              <div key={attr} className="flex items-center gap-3 py-1">
                <span className="w-24 font-display text-sm capitalize tracking-wide">{attr}</span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustAttr(attr, -1)} disabled={current <= min}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className={cn(
                  "font-mono text-lg w-8 text-center",
                  isAtMax && "text-primary font-bold"
                )}>
                  {current}
                </span>
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustAttr(attr, 1)} disabled={current >= max || remaining <= 0}>
                  <Plus className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground font-mono">
                  ({min}–{max})
                  {adjBonus > 0 && <span className="text-primary ml-1">+{adjBonus} adj</span>}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
