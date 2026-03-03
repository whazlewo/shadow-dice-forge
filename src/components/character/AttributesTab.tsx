import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SR6Attributes } from "@/types/character";

type AttrField = { key: keyof SR6Attributes; label: string; type?: string };

const LEFT_COLUMN: AttrField[] = [
  { key: "body", label: "Body" },
  { key: "agility", label: "Agility" },
  { key: "reaction", label: "Reaction" },
  { key: "strength", label: "Strength" },
  { key: "willpower", label: "Willpower" },
  { key: "logic", label: "Logic" },
  { key: "intuition", label: "Intuition" },
  { key: "charisma", label: "Charisma" },
  { key: "edge", label: "Edge" },
  { key: "edge_points", label: "Edge Points" },
  { key: "unarmed", label: "Unarmed", type: "text" },
];

const RIGHT_COLUMN: AttrField[] = [
  { key: "essence", label: "Essence", type: "number" },
  { key: "magic", label: "Magic/Resonance" },
  { key: "initiative", label: "Initiative", type: "text" },
  { key: "matrix_initiative", label: "Matrix Initiative", type: "text" },
  { key: "astral_initiative", label: "Astral Initiative", type: "text" },
  { key: "composure", label: "Composure" },
  { key: "judge_intentions", label: "Judge Intentions" },
  { key: "memory", label: "Memory" },
  { key: "lift_carry", label: "Lift/Carry", type: "text" },
  { key: "movement", label: "Movement", type: "text" },
  { key: "defense_rating", label: "Defense Rating", type: "text" },
];

interface Props {
  attributes: SR6Attributes;
  onUpdate: (attrs: SR6Attributes) => void;
}

function AttrRow({ field, value, onChange }: { field: AttrField; value: any; onChange: (key: keyof SR6Attributes, val: string) => void }) {
  const isText = field.type === "text";
  return (
    <div className="flex items-center gap-2 border-b border-border/30 py-1">
      <Label className="font-display text-xs tracking-wide text-muted-foreground text-right min-w-[110px] shrink-0">
        {field.label}
      </Label>
      <Input
        type={isText ? "text" : "number"}
        value={value ?? (isText ? "" : 0)}
        onChange={(e) => onChange(field.key, e.target.value)}
        className="font-mono text-sm h-8 bg-transparent border-none p-1 focus-visible:ring-0"
        min={field.key === "essence" ? 0 : undefined}
        step={field.key === "essence" ? 0.1 : undefined}
      />
    </div>
  );
}

export function AttributesTab({ attributes, onUpdate }: Props) {
  const handleChange = (key: keyof SR6Attributes, value: string) => {
    const field = [...LEFT_COLUMN, ...RIGHT_COLUMN].find((f) => f.key === key);
    const isText = field?.type === "text";
    if (isText) {
      onUpdate({ ...attributes, [key]: value });
    } else {
      const num = parseFloat(value) || 0;
      onUpdate({ ...attributes, [key]: key === "essence" ? num : Math.max(0, Math.floor(num)) });
    }
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider">ATTRIBUTES</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-8">
          <div>
            {LEFT_COLUMN.map((field) => (
              <AttrRow key={field.key} field={field} value={attributes[field.key]} onChange={handleChange} />
            ))}
          </div>
          <div>
            {RIGHT_COLUMN.map((field) => (
              <AttrRow key={field.key} field={field} value={attributes[field.key]} onChange={handleChange} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
