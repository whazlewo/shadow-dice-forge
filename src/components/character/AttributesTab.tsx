import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SR6Attributes } from "@/types/character";

const ATTRIBUTE_LABELS: { key: keyof SR6Attributes; label: string; color: string }[] = [
  { key: "body", label: "BOD", color: "text-neon-cyan" },
  { key: "agility", label: "AGI", color: "text-neon-cyan" },
  { key: "reaction", label: "REA", color: "text-neon-cyan" },
  { key: "strength", label: "STR", color: "text-neon-cyan" },
  { key: "willpower", label: "WIL", color: "text-neon-magenta" },
  { key: "logic", label: "LOG", color: "text-neon-magenta" },
  { key: "intuition", label: "INT", color: "text-neon-magenta" },
  { key: "charisma", label: "CHA", color: "text-neon-magenta" },
  { key: "edge", label: "EDG", color: "text-neon-amber" },
  { key: "essence", label: "ESS", color: "text-neon-green" },
  { key: "magic", label: "MAG", color: "text-neon-green" },
  { key: "resonance", label: "RES", color: "text-neon-green" },
];

interface Props {
  attributes: SR6Attributes;
  onUpdate: (attrs: SR6Attributes) => void;
}

export function AttributesTab({ attributes, onUpdate }: Props) {
  const handleChange = (key: keyof SR6Attributes, value: string) => {
    const num = parseFloat(value) || 0;
    onUpdate({ ...attributes, [key]: key === "essence" ? num : Math.max(0, Math.floor(num)) });
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider">ATTRIBUTES</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {ATTRIBUTE_LABELS.map(({ key, label, color }) => (
            <div key={key} className="space-y-1">
              <Label className={`font-display text-xs tracking-widest ${color}`}>{label}</Label>
              <Input
                type="number"
                value={attributes[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="font-mono text-center text-lg h-12 bg-muted/50"
                min={key === "essence" ? 0 : 0}
                step={key === "essence" ? 0.1 : 1}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
