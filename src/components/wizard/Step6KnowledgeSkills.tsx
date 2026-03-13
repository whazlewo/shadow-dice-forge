import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { WizardState } from "@/pages/CharacterWizard";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step6KnowledgeSkills({ state, onChange }: Props) {
  const baseLogic =
    (state.attributes.logic || 1) + (state.adjustmentPoints?.logic || 0);
  const knowledgeSkillsFree = state.knowledgeSkillsFree ?? [];

  const updateKnowledgeSkillFree = (index: number, name: string) => {
    const next = [...knowledgeSkillsFree];
    while (next.length <= index) next.push("");
    next[index] = name;
    onChange({ knowledgeSkillsFree: next.slice(0, baseLogic) });
  };

  if (baseLogic <= 0) {
    return (
      <Card className="border-border/50 bg-card/80">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            No free knowledge skill slots (Logic determines the count).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-6 space-y-4">
        <div>
          <h4 className="font-display text-sm tracking-wider uppercase text-muted-foreground leading-tight">Knowledge Skills</h4>
          <p className="text-xs text-muted-foreground mb-3 mt-0">
            You have {baseLogic} free knowledge skill{baseLogic !== 1 ? "s" : ""}{" "}
            (from Logic). Additional knowledge skills cost 3 karma each in the
            Karma step.
          </p>
          <div className="space-y-2">
            {Array.from({ length: baseLogic }, (_, i) => (
              <div key={`free-${i}`} className="flex items-center gap-2">
                <Input
                  value={knowledgeSkillsFree[i] ?? ""}
                  onChange={(e) => updateKnowledgeSkillFree(i, e.target.value)}
                  placeholder={`Knowledge skill ${i + 1}`}
                  className="h-8 text-xs font-mono flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
