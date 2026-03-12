import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

import { METATYPE_DATA } from "@/data/sr6-reference";
import { QualityReferenceSelect } from "@/components/QualityReferenceSelect";
import type { WizardState } from "@/pages/CharacterWizard";
import type { WizardQuality } from "@/types/character";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step3Qualities({ state, onChange }: Props) {
  const qualities = state.wizardQualities || [];
  const metatypeInfo = state.metatype ? METATYPE_DATA[state.metatype] : null;
  const racialQualities = metatypeInfo?.racialQualities || [];

  const positiveKarma = qualities
    .filter((q) => q.type === "positive")
    .reduce((sum, q) => sum + q.karma_cost, 0);
  const negativeKarma = qualities
    .filter((q) => q.type === "negative")
    .reduce((sum, q) => sum + q.karma_cost, 0);

  const addQuality = () => {
    const newQ: WizardQuality = {
      id: crypto.randomUUID(),
      name: "",
      type: "positive",
      karma_cost: 0,
      effects: "",
    };
    onChange({ wizardQualities: [...qualities, newQ] });
  };

  const updateQuality = (id: string, updates: Partial<WizardQuality>) => {
    onChange({
      wizardQualities: qualities.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    });
  };

  const removeQuality = (id: string) => {
    onChange({ wizardQualities: qualities.filter((q) => q.id !== id) });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide">Qualities</CardTitle>
          <p className="text-sm text-muted-foreground">
            Positive qualities cost karma. Negative qualities grant karma (max 20 karma from negatives).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 text-sm font-mono">
            <Badge variant="outline">
              Base: 50
            </Badge>
            <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
              Positive: {positiveKarma} spent
            </Badge>
            <Badge variant="outline" className="text-amber-400 border-amber-400/30">
              Negative: {negativeKarma} gained
            </Badge>
            <Badge variant="outline">
              Net: {negativeKarma - positiveKarma}
            </Badge>
            <Badge variant="outline" className="text-primary border-primary/30 font-bold">
              Total Available: {50 + negativeKarma - positiveKarma}
            </Badge>
          </div>

          {racialQualities.length > 0 && (
            <div className="space-y-2 border border-border/50 rounded-md p-3 bg-muted/30">
              <p className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                Racial Qualities (from {state.metatype})
              </p>
              <div className="flex flex-wrap gap-2">
                {racialQualities.map((rq) => (
                  <Badge key={rq} variant="secondary" className="font-mono text-sm">
                    {rq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {qualities.map((q) => (
            <div key={q.id} className="grid grid-cols-[1fr_120px_100px_1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs font-display tracking-wide">Name</Label>
                <Input
                  value={q.name}
                  onChange={(e) => updateQuality(q.id, { name: e.target.value })}
                  placeholder="Quality name"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-display tracking-wide">Type</Label>
                <Select
                  value={q.type}
                  onValueChange={(v) => updateQuality(q.id, { type: v as "positive" | "negative" })}
                >
                  <SelectTrigger className="font-mono text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-display tracking-wide">Karma</Label>
                <Input
                  type="number"
                  value={q.karma_cost}
                  onChange={(e) => updateQuality(q.id, { karma_cost: parseInt(e.target.value) || 0 })}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-display tracking-wide">Effects</Label>
                <Input
                  value={q.effects}
                  onChange={(e) => updateQuality(q.id, { effects: e.target.value })}
                  placeholder="Description of effects"
                  className="font-mono text-sm"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeQuality(q.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2">
            <QualityReferenceSelect
              mode="wizard"
              onSelect={(item) => {
                onChange({ wizardQualities: [...qualities, item as WizardQuality] });
              }}
              triggerLabel="Add from reference"
            />
            <Button variant="outline" size="sm" onClick={addQuality} className="font-display tracking-wide">
              <Plus className="h-4 w-4 mr-1" /> Add Custom
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
