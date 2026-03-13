import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRIORITY_TABLE, type PriorityLevel, type PriorityMagicEntry } from "@/data/sr6-reference";
import { MAGIC_TRADITIONS } from "@/data/magic-traditions";
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
    const updates: Partial<WizardState> = { magicChoice: entry.type };
    const adjustmentPoints = state.adjustmentPoints ?? {};

    if (entry.type === "technomancer" && (adjustmentPoints.magic ?? 0) > 0) {
      const cleared = { ...adjustmentPoints };
      delete cleared.magic;
      updates.adjustmentPoints = cleared;
    } else if (
      (entry.type === "full" || entry.type === "aspected" || entry.type === "mystic_adept" || entry.type === "adept") &&
      (adjustmentPoints.resonance ?? 0) > 0
    ) {
      const cleared = { ...adjustmentPoints };
      delete cleared.resonance;
      updates.adjustmentPoints = cleared;
    }

    if (entry.type === "technomancer" || entry.type === "adept" || entry.type === "mundane") {
      updates.magicTradition = null;
    }

    onChange(updates);
  };

  const isMundane = magicChoice === "mundane";
  const isTraditionDisabled =
    magicChoice === "technomancer" || magicChoice === "adept" || magicChoice === "mundane";
  const spellCount = selected && !isMundane && selected.type !== "adept" && selected.type !== "technomancer"
    ? selected.magicOrResonance * 2
    : 0;
  const powerPoints = selected && selected.type === "adept" ? selected.magicOrResonance : 0;
  const complexForms = selected && selected.type === "technomancer" ? selected.magicOrResonance * 2 : 0;

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-6 space-y-6">
        {/* Magic / Resonance */}
        <div>
          <h4 className="font-display text-sm tracking-wider uppercase text-muted-foreground leading-tight">Magic / Resonance</h4>
          <p className="text-sm text-muted-foreground mb-3 mt-0">
            Priority {magicPriority} — Choose your magical tradition (or stay mundane).
          </p>
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
        </div>

        <div className="h-px bg-border" />

        {/* Tradition */}
        <div className={cn(isTraditionDisabled && "opacity-50 pointer-events-none")}>
          <h4 className="font-display text-sm tracking-wider uppercase text-muted-foreground leading-tight">Tradition</h4>
          <p className="text-sm text-muted-foreground mb-3 mt-0">
            Determines drain resistance, spell Attack Rating, and spirit/element associations.
          </p>
          {isTraditionDisabled ? (
            <p className="text-sm text-muted-foreground">
              {magicChoice === "technomancer"
                ? "Tradition does not apply to Technomancers."
                : magicChoice === "adept"
                  ? "Tradition does not apply to Adepts."
                  : "Select a spellcasting type (Full Magician, Aspected, or Mystic Adept) above."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-display">Tradition</TableHead>
                  <TableHead className="font-display">Drain Attributes</TableHead>
                  <TableHead className="font-display">Combat</TableHead>
                  <TableHead className="font-display">Detection</TableHead>
                  <TableHead className="font-display">Health</TableHead>
                  <TableHead className="font-display">Illusion</TableHead>
                  <TableHead className="font-display">Manipulation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MAGIC_TRADITIONS.map((t) => (
                  <TableRow
                    key={t.id}
                    className={cn(
                      "cursor-pointer transition-colors",
                      state.magicTradition === t.id && "bg-primary/20 ring-1 ring-primary"
                    )}
                    onClick={() => onChange({ magicTradition: t.id })}
                  >
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="font-mono text-xs">{t.drainAttributes}</TableCell>
                    <TableCell>{t.combat}</TableCell>
                    <TableCell>{t.detection}</TableCell>
                    <TableCell>{t.health}</TableCell>
                    <TableCell>{t.illusion}</TableCell>
                    <TableCell>{t.manipulation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {selected && !isMundane && (
          <>
            <div className="h-px bg-border" />
            <div>
              <h4 className="font-display text-sm tracking-wider uppercase text-muted-foreground leading-tight">Summary</h4>
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
                You will select your spells, adept powers, or complex forms in the Magic step after Gear.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
