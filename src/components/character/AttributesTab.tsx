import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SR6Attributes } from "@/types/character";
import { useMemo } from "react";

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

const RIGHT_EDITABLE: AttrField[] = [
  { key: "essence", label: "Essence", type: "number" },
  { key: "magic", label: "Magic/Resonance" },
];

interface DerivedStat {
  label: string;
  value: string;
  tooltip?: string;
}

function computeDerived(a: SR6Attributes): DerivedStat[] {
  const rea = a.reaction || 0;
  const int = a.intuition || 0;
  const wil = a.willpower || 0;
  const cha = a.charisma || 0;
  const log = a.logic || 0;
  const str = a.strength || 0;
  const bod = a.body || 0;

  return [
    { label: "Initiative", value: `${rea + int}+2D6`, tooltip: "REA + INT + 2D6" },
    { label: "Matrix Initiative", value: `${a.resonance ? (int + (a.resonance || 0)) : int}+${a.resonance ? "4" : "2"}D6`, tooltip: "Depends on interface mode" },
    { label: "Astral Initiative", value: a.magic ? `${int + int}+3D6` : "—", tooltip: "INT×2 + 3D6 (if magical)" },
    { label: "Composure", value: `${wil + cha}`, tooltip: "WIL + CHA" },
    { label: "Judge Intentions", value: `${wil + int}`, tooltip: "WIL + INT" },
    { label: "Memory", value: `${log + wil}`, tooltip: "LOG + WIL" },
    { label: "Lift/Carry", value: `${str + bod}(${(str + bod) * 2})`, tooltip: "STR + BOD (carry), ×2 (lift)" },
    { label: "Movement", value: `${Math.max(1, Math.floor((rea + str) / 2))}m`, tooltip: "Walk = (REA+STR)/2" },
    { label: "Defense Rating", value: `${bod}`, tooltip: "Base = BOD (+ armor)" },
  ];
}

interface Props {
  attributes: SR6Attributes;
  onUpdate: (attrs: SR6Attributes) => void;
}

function EditableRow({ field, value, onChange }: { field: AttrField; value: any; onChange: (key: keyof SR6Attributes, val: string) => void }) {
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

function DerivedRow({ stat }: { stat: DerivedStat }) {
  return (
    <div className="flex items-center gap-2 border-b border-border/30 py-1" title={stat.tooltip}>
      <Label className="font-display text-xs tracking-wide text-muted-foreground text-right min-w-[110px] shrink-0">
        {stat.label}
      </Label>
      <span className="font-mono text-sm h-8 flex items-center px-1 text-foreground">
        {stat.value}
      </span>
    </div>
  );
}

export function AttributesTab({ attributes, onUpdate }: Props) {
  const derived = useMemo(() => computeDerived(attributes), [attributes]);

  const handleChange = (key: keyof SR6Attributes, value: string) => {
    const field = [...LEFT_COLUMN, ...RIGHT_EDITABLE].find((f) => f.key === key);
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
              <EditableRow key={field.key} field={field} value={attributes[field.key]} onChange={handleChange} />
            ))}
          </div>
          <div>
            {RIGHT_EDITABLE.map((field) => (
              <EditableRow key={field.key} field={field} value={attributes[field.key]} onChange={handleChange} />
            ))}
            {derived.map((stat) => (
              <DerivedRow key={stat.label} stat={stat} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
