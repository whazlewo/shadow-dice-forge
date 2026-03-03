import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRIORITY_TABLE, type PriorityLevel, type PriorityMagicEntry } from "@/data/sr6-reference";
import type { WizardState } from "@/pages/CharacterWizard";
import { cn } from "@/lib/utils";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step5Magic({ state, onChange }: Props) {
  const magicPriority = state.priorities.magic_resonance as PriorityLevel | undefined;
  if (!magicPriority) {
    return <p className="text-sm text-muted-foreground">Please assign a Magic/Resonance priority first.</p>;
  }
  const options = PRIORITY_TABLE[magicPriority].magic_resonance;
  const { magicChoice } = state;

  const selected = options.find((o) => o.type === magicChoice);

  const handleSelect = (entry: PriorityMagicEntry) => {
    onChange({ magicChoice: entry.type });
  };

  const isMundane = magicChoice === "mundane";
  const spellCount = selected && !isMundane && selected.type !== "adept" && selected.type !== "technomancer"
    ? selected.magicOrResonance * 2
    : 0;
  const powerPoints = selected && selected.type === "adept" ? selected.magicOrResonance : 0;
  const complexForms = selected && selected.type === "technomancer" ? selected.magicOrResonance * 2 : 0;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide">Magic / Resonance</CardTitle>
          <p className="text-sm text-muted-foreground">
            Priority {magicPriority} — Choose your magical tradition (or stay mundane).
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            {options.map((opt) => (
              <Button
                key={opt.type}
                variant={magicChoice === opt.type ? "default" : "outline"}
                className={cn(
                  "justify-start font-mono text-sm h-auto py-3 px-4",
                  magicChoice === opt.type && "ring-1 ring-primary"
                )}
                onClick={() => handleSelect(opt)}
              >
                <div className="text-left">
                  <div className="font-display tracking-wide">{opt.label}</div>
                  {opt.type !== "mundane" && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {opt.type === "adept" && `${opt.magicOrResonance} Power Points`}
                      {opt.type === "technomancer" && `${opt.magicOrResonance * 2} Complex Forms`}
                      {(opt.type === "full" || opt.type === "aspected" || opt.type === "mystic_adept") &&
                        `${opt.magicOrResonance * 2} Spells`}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selected && !isMundane && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg tracking-wide">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono">
                {selected.type === "technomancer" ? "Resonance" : "Magic"}: {selected.magicOrResonance}
              </Badge>
              {spellCount > 0 && (
                <Badge variant="secondary" className="font-mono">
                  {spellCount} Spells available
                </Badge>
              )}
              {powerPoints > 0 && (
                <Badge variant="secondary" className="font-mono">
                  {powerPoints} Power Points
                </Badge>
              )}
              {complexForms > 0 && (
                <Badge variant="secondary" className="font-mono">
                  {complexForms} Complex Forms
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              You can select specific spells, powers, and complex forms on the character sheet after creation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
