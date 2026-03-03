import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { PRIORITY_TABLE, formatNuyen, type PriorityLevel, type PriorityColumn } from "@/data/sr6-reference";
import type { WizardState } from "@/pages/CharacterWizard";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const COLUMNS: { key: PriorityColumn; label: string }[] = [
  { key: "metatype", label: "Metatype" },
  { key: "attributes", label: "Attributes" },
  { key: "skills", label: "Skills" },
  { key: "magic_resonance", label: "Magic/Resonance" },
  { key: "resources", label: "Resources" },
];

const LEVELS: PriorityLevel[] = ["A", "B", "C", "D", "E"];

export default function Step1Priorities({ state, onChange }: Props) {
  const { priorities, characterName } = state;

  const usedLevels = Object.values(priorities).filter(Boolean) as PriorityLevel[];
  const duplicates = usedLevels.filter((l, i) => usedLevels.indexOf(l) !== i);
  const allAssigned = COLUMNS.every((c) => priorities[c.key]);
  const hasDuplicates = duplicates.length > 0;

  const setPriority = (col: PriorityColumn, level: PriorityLevel) => {
    onChange({ priorities: { ...priorities, [col]: level } });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="char-name" className="font-display tracking-wide">Character Name</Label>
        <Input
          id="char-name"
          value={characterName}
          onChange={(e) => onChange({ characterName: e.target.value })}
          placeholder="Enter runner name..."
          className="font-mono text-lg"
        />
      </div>

      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide">Priority Table</CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign each column a unique priority from A (best) to E (worst).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasDuplicates && (
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Each priority level should only be used once.
            </div>
          )}

          <div className="grid gap-3">
            {COLUMNS.map((col) => {
              const level = priorities[col.key];
              const row = level ? PRIORITY_TABLE[level] : null;

              return (
                <div key={col.key} className="flex items-start gap-4">
                  <div className="w-32 shrink-0 pt-2">
                    <Label className="font-display text-sm tracking-wide">{col.label}</Label>
                  </div>
                  <div className="w-20">
                    <Select
                      value={level || ""}
                      onValueChange={(v) => setPriority(col.key, v as PriorityLevel)}
                    >
                      <SelectTrigger className="font-mono font-bold">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map((l) => (
                          <SelectItem key={l} value={l} className="font-mono font-bold">
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 pt-2 text-sm text-muted-foreground font-mono">
                    {row && col.key === "metatype" && (
                      <span>{row.metatype.metatypes.join(", ")} ({row.metatype.adjustmentPoints} adj pts)</span>
                    )}
                    {row && col.key === "attributes" && <span>{row.attributes} points</span>}
                    {row && col.key === "skills" && <span>{row.skills} points</span>}
                    {row && col.key === "magic_resonance" && (
                      <span>{row.magic_resonance.map((m) => m.label).join(" / ")}</span>
                    )}
                    {row && col.key === "resources" && <span>{formatNuyen(row.resources)}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {allAssigned && !hasDuplicates && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground font-display tracking-wide mb-2">SUMMARY</p>
              <div className="flex flex-wrap gap-2">
                {COLUMNS.map((col) => {
                  const level = priorities[col.key]!;
                  return (
                    <Badge key={col.key} variant="outline" className="font-mono text-xs">
                      {col.label}: {level}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
