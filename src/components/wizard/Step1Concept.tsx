import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WizardState } from "@/pages/CharacterWizard";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const ARCHETYPES = [
  "Street Samurai",
  "Decker",
  "Rigger",
  "Face",
  "Mage",
  "Shaman",
  "Adept",
  "Mystic Adept",
  "Technomancer",
  "Infiltrator",
  "Weapons Specialist",
  "Other",
];

export default function Step1Concept({ state, onChange }: Props) {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide">Character Identity</CardTitle>
          <p className="text-sm text-muted-foreground">
            Who is your runner? Define the basics before diving into the numbers.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="role" className="font-display tracking-wide">Role / Archetype</Label>
            <Select
              value={state.role || ""}
              onValueChange={(v) => onChange({ role: v })}
            >
              <SelectTrigger className="font-mono">
                <SelectValue placeholder="Select an archetype..." />
              </SelectTrigger>
              <SelectContent>
                {ARCHETYPES.map((a) => (
                  <SelectItem key={a} value={a} className="font-mono">{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backstory" className="font-display tracking-wide">Backstory</Label>
            <Textarea
              id="backstory"
              value={state.backstory || ""}
              onChange={(e) => onChange({ backstory: e.target.value })}
              placeholder="A few lines about your runner's history, motivations, and personality..."
              className="font-mono min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
