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
      <p className="text-sm text-muted-foreground py-2">
        No free knowledge skill slots (Logic determines the count).
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
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
  );
}
