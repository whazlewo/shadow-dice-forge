import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIORITY_TABLE, METATYPE_DATA, type PriorityLevel } from "@/data/sr6-reference";
import type { WizardState } from "@/pages/CharacterWizard";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step2Metatype({ state, onChange }: Props) {
  const metatypePriority = state.priorities.metatype as PriorityLevel | undefined;
  if (!metatypePriority) {
    return <p className="text-sm text-muted-foreground">Please assign a Metatype priority first.</p>;
  }
  const row = PRIORITY_TABLE[metatypePriority];
  const availableMetatypes = row.metatype.metatypes;
  const totalAdj = row.metatype.adjustmentPoints;
  const { metatype } = state;

  const handleSelectMetatype = (mt: string) => {
    onChange({ metatype: mt, adjustmentPoints: {} });
  };

  const mtData = metatype ? METATYPE_DATA[metatype] : null;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide">Choose Metatype</CardTitle>
          <p className="text-sm text-muted-foreground">
            Priority {metatypePriority} allows: {availableMetatypes.join(", ")} with {totalAdj} adjustment points.
            Spend them in the Adjustment Points section below after choosing your magic type.
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

      {mtData && mtData.racialQualities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground font-display tracking-wide mr-1 pt-0.5">RACIAL QUALITIES:</span>
          {mtData.racialQualities.map((q) => (
            <Badge key={q} variant="secondary" className="font-mono text-xs">{q}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
