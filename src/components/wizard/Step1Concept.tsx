import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { WizardState } from "@/pages/CharacterWizard";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step1Concept({ state, onChange }: Props) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardContent className="p-6 space-y-6">
        <div>
          <h4 className="font-display text-sm tracking-wider uppercase text-muted-foreground leading-tight">Character Identity</h4>
          <p className="text-sm text-muted-foreground mb-3 mt-0">
            Who is your runner? Define the basics before diving into the numbers.
          </p>
          <div className="space-y-2">
            <Label htmlFor="char-name" className="font-display tracking-wide">Runner Name</Label>
            <Input
              id="char-name"
              value={state.characterName}
              onChange={(e) => onChange({ characterName: e.target.value })}
              placeholder="Enter runner name..."
              className="font-mono text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-display tracking-wide">Description</Label>
            <RichTextEditor
              value={state.description || ""}
              onChange={(v) => onChange({ description: v })}
              placeholder="Describe your runner—role, motivations, personality, or whatever you wish..."
              minHeight="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backstory" className="font-display tracking-wide">Backstory</Label>
            <RichTextEditor
              value={state.backstory || ""}
              onChange={(v) => onChange({ backstory: v })}
              placeholder="A few lines about your runner's history..."
              minHeight="min-h-[120px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
