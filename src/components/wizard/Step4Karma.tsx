import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus } from "lucide-react";
// SR6_CORE_SKILLS not needed here
import type { WizardState } from "@/pages/CharacterWizard";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const KARMA_PER_ATTR_POINT = 5;
const KARMA_PER_SKILL_POINT = 5;
const BASE_KARMA = 50;

export default function Step4Karma({ state, onChange }: Props) {
  const karmaSpend = state.karmaSpend || {};

  // Karma from negative qualities
  const negativeKarma = (state.wizardQualities || [])
    .filter((q) => q.type === "negative")
    .reduce((sum, q) => sum + q.karma_cost, 0);
  const positiveKarma = (state.wizardQualities || [])
    .filter((q) => q.type === "positive")
    .reduce((sum, q) => sum + q.karma_cost, 0);
  const qualityNet = negativeKarma - positiveKarma;

  const totalKarma = BASE_KARMA + qualityNet;
  const spentKarma = Object.values(karmaSpend).reduce((sum, v) => sum + (v || 0), 0);
  const remainingKarma = totalKarma - spentKarma;

  const setSpend = (key: string, value: number) => {
    onChange({ karmaSpend: { ...karmaSpend, [key]: Math.max(0, value) } });
  };

  const attrKeys = ["body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma"] as const;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide">Customization Karma</CardTitle>
          <p className="text-sm text-muted-foreground">
            Spend karma to raise attributes (5/point) and skills (5/point).
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 text-sm font-mono flex-wrap">
            <Badge variant="outline">Base: {BASE_KARMA}</Badge>
            <Badge variant="outline" className={qualityNet >= 0 ? "text-emerald-400 border-emerald-400/30" : "text-amber-400 border-amber-400/30"}>
              Qualities: {qualityNet >= 0 ? "+" : ""}{qualityNet}
            </Badge>
            <Badge variant="outline">Total: {totalKarma}</Badge>
            <Badge variant="outline" className="text-primary border-primary/30">
              Remaining: {remainingKarma}
            </Badge>
          </div>

          {/* Attributes */}
          <div>
            <Label className="font-display tracking-wide text-sm mb-3 block">Attribute Raises</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {attrKeys.map((attr) => {
                const baseVal = (state.attributes[attr] || 1) + (state.adjustmentPoints[attr] || 0);
                const karmaPoints = karmaSpend[`attr_${attr}`] || 0;
                const karmaRaises = Math.floor(karmaPoints / KARMA_PER_ATTR_POINT);

                return (
                  <div key={attr} className="flex items-center gap-2 rounded-md border border-border/30 px-3 py-2 bg-card/40">
                    <span className="text-xs font-display tracking-wide uppercase flex-1">{attr}</span>
                    <span className="font-mono text-sm text-muted-foreground">{baseVal}</span>
                    {karmaRaises > 0 && (
                      <span className="font-mono text-sm text-primary">+{karmaRaises}</span>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={karmaPoints <= 0}
                        onClick={() => setSpend(`attr_${attr}`, karmaPoints - KARMA_PER_ATTR_POINT)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={remainingKarma < KARMA_PER_ATTR_POINT}
                        onClick={() => setSpend(`attr_${attr}`, karmaPoints + KARMA_PER_ATTR_POINT)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="font-display tracking-wide text-sm mb-3 block">Skill Raises</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {state.skills.filter((s) => s.rating > 0).map((skill) => {
                const karmaPoints = karmaSpend[`skill_${skill.name}`] || 0;
                const karmaRaises = Math.floor(karmaPoints / KARMA_PER_SKILL_POINT);

                return (
                  <div key={skill.name} className="flex items-center gap-2 rounded-md border border-border/30 px-3 py-2 bg-card/40">
                    <span className="text-xs font-display tracking-wide flex-1">{skill.name}</span>
                    <span className="font-mono text-sm text-muted-foreground">{skill.rating}</span>
                    {karmaRaises > 0 && (
                      <span className="font-mono text-sm text-primary">+{karmaRaises}</span>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={karmaPoints <= 0}
                        onClick={() => setSpend(`skill_${skill.name}`, karmaPoints - KARMA_PER_SKILL_POINT)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={remainingKarma < KARMA_PER_SKILL_POINT}
                        onClick={() => setSpend(`skill_${skill.name}`, karmaPoints + KARMA_PER_SKILL_POINT)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {state.skills.filter((s) => s.rating > 0).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2">No skills with rating &gt; 0. Go back to Priorities and assign skill points first.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
