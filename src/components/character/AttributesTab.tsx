import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SR6Attributes } from "@/types/character";

const MAIN_ATTRS: { key: keyof SR6Attributes; label: string; color: string }[] = [
  { key: "body", label: "BOD", color: "text-neon-cyan" },
  { key: "agility", label: "AGI", color: "text-neon-cyan" },
  { key: "reaction", label: "REA", color: "text-neon-cyan" },
  { key: "strength", label: "STR", color: "text-neon-cyan" },
  { key: "willpower", label: "WIL", color: "text-neon-magenta" },
  { key: "logic", label: "LOG", color: "text-neon-magenta" },
  { key: "intuition", label: "INT", color: "text-neon-magenta" },
  { key: "charisma", label: "CHA", color: "text-neon-magenta" },
];

const SPECIAL_ATTRS: { key: keyof SR6Attributes; label: string; color: string }[] = [
  { key: "edge", label: "EDG", color: "text-neon-amber" },
  { key: "essence", label: "ESS", color: "text-neon-green" },
  { key: "magic", label: "MAG", color: "text-neon-green" },
  { key: "resonance", label: "RES", color: "text-neon-green" },
];

interface Props {
  attributes: SR6Attributes;
  onUpdate: (attrs: SR6Attributes) => void;
}

function AttrInput({ attrKey, label, color, value, onChange }: { attrKey: keyof SR6Attributes; label: string; color: string; value: number; onChange: (key: keyof SR6Attributes, val: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className={`font-display text-xs tracking-widest ${color}`}>{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(attrKey, e.target.value)}
        className="font-mono text-center text-lg h-12 bg-muted/50"
        min={0}
        step={attrKey === "essence" ? 0.1 : 1}
      />
    </div>
  );
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
        <div className="grid grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-3">
            {MAIN_ATTRS.map(({ key, label, color }) => (
              <AttrInput key={key} attrKey={key} label={label} color={color} value={attributes[key]} onChange={handleChange} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 content-start">
            {SPECIAL_ATTRS.map(({ key, label, color }) => (
              <AttrInput key={key} attrKey={key} label={label} color={color} value={attributes[key]} onChange={handleChange} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
