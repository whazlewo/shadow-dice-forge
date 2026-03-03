import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Minus, Plus } from "lucide-react";
import { PRIORITY_TABLE, type PriorityLevel } from "@/data/sr6-reference";
import { SR6_CORE_SKILLS } from "@/types/character";
import type { WizardState, WizardSkill } from "@/pages/CharacterWizard";
import { cn } from "@/lib/utils";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step4Skills({ state, onChange }: Props) {
  const skillPriority = state.priorities.skills as PriorityLevel;
  const totalPoints = PRIORITY_TABLE[skillPriority].skills;
  const { skills } = state;

  const spentPoints = skills.reduce((sum, s) => sum + s.rating + (s.specialization ? 1 : 0), 0);
  const remaining = totalPoints - spentPoints;

  const atSixCount = skills.filter((s) => s.rating >= 6).length;

  const updateSkill = (index: number, updates: Partial<WizardSkill>) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], ...updates };
    onChange({ skills: newSkills });
  };

  const adjustRating = (index: number, delta: number) => {
    const current = skills[index].rating;
    const newVal = current + delta;
    if (newVal < 0 || newVal > 6) return;
    if (delta > 0 && remaining <= 0) return;
    updateSkill(index, { rating: newVal });
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg tracking-wide">Skills</CardTitle>
          <Badge variant={remaining < 0 ? "destructive" : "outline"} className="font-mono">
            {remaining} / {totalPoints} remaining
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Max rank 6, only one skill at rank 6. Specializations cost 1 point each.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {remaining < 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20 mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            You've overspent skill points.
          </div>
        )}
        {atSixCount > 1 && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20 mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Only one skill should be at rank 6 at creation.
          </div>
        )}

        <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
          {skills.map((skill, i) => (
            <div key={skill.name} className={cn(
              "flex items-center gap-2 py-1 px-2 rounded-sm",
              skill.rating > 0 && "bg-primary/5"
            )}>
              <span className="w-32 shrink-0 font-display text-sm tracking-wide">{skill.name}</span>
              <span className="text-xs text-muted-foreground font-mono w-16 shrink-0 capitalize">
                {SR6_CORE_SKILLS[i]?.attribute}
              </span>
              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => adjustRating(i, -1)} disabled={skill.rating <= 0}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className={cn("font-mono text-sm w-6 text-center", skill.rating > 0 && "text-primary font-bold")}>
                {skill.rating}
              </span>
              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => adjustRating(i, 1)} disabled={skill.rating >= 6 || remaining <= 0}>
                <Plus className="h-3 w-3" />
              </Button>
              {skill.rating > 0 && (
                <Input
                  placeholder="Specialization"
                  value={skill.specialization}
                  onChange={(e) => updateSkill(i, { specialization: e.target.value })}
                  className="h-7 text-xs font-mono flex-1 min-w-0"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
