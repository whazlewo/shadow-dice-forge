import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-6 space-y-6">
        <div>
          <h4 className="font-display text-sm tracking-wider uppercase text-muted-foreground leading-tight">Choose Metatype</h4>
          <p className="text-sm text-muted-foreground mb-3 mt-0">
            Priority {metatypePriority} allows: {availableMetatypes.join(", ")} with {totalAdj} adjustment points.
            Spend them in the Adjustment Points section below after choosing your magic type.
          </p>
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
        </div>

        {mtData && mtData.racialQualities.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div>
              <h4 className="font-display text-sm tracking-wider uppercase text-muted-foreground leading-tight">Racial Qualities</h4>
              <div className="flex flex-wrap gap-2">
                {mtData.racialQualities.map((q) => (
                  <Badge key={q} variant="secondary" className="font-mono text-xs">{q}</Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
