import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SR6PersonalInfo } from "@/types/character";

interface Props {
  info: SR6PersonalInfo;
  onUpdate: (info: SR6PersonalInfo) => void;
  name: string;
  metatype: string;
  onNameChange: (name: string) => void;
  onMetatypeChange: (metatype: string) => void;
  onNameBlur: () => void;
  onMetatypeBlur: () => void;
}

function Field({ label, value, type = "text", onChange, onBlur }: { label: string; value: any; type?: string; onChange: (val: string) => void; onBlur?: () => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="h-9 font-mono text-sm bg-muted/50"
      />
    </div>
  );
}

export function PersonalInfoTab({ info, onUpdate, name, metatype, onNameChange, onMetatypeChange, onNameBlur, onMetatypeBlur }: Props) {
  const set = (key: keyof SR6PersonalInfo, value: string, isNum = false) => {
    onUpdate({ ...info, [key]: isNum ? (parseInt(value) || 0) : value });
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider">PERSONAL DATA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Row: Name | Metatype */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={name} onChange={onNameChange} onBlur={onNameBlur} />
          <Field label="Metatype" value={metatype} onChange={onMetatypeChange} onBlur={onMetatypeBlur} />
        </div>
        {/* Row: Ethnicity */}
        <div className="grid grid-cols-1 gap-4">
          <Field label="Ethnicity" value={info.ethnicity} onChange={(v) => set("ethnicity", v)} />
        </div>
        {/* Row: Age | Sex | Height | Weight */}
        <div className="grid grid-cols-4 gap-4">
          <Field label="Age" value={info.age} type="number" onChange={(v) => set("age", v, true)} />
          <Field label="Sex" value={info.sex} onChange={(v) => set("sex", v)} />
          <Field label="Height" value={info.height} onChange={(v) => set("height", v)} />
          <Field label="Weight" value={info.weight} onChange={(v) => set("weight", v)} />
        </div>
        {/* Row: Reputation | Heat */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Street Cred" value={info.street_cred} type="number" onChange={(v) => set("street_cred", v, true)} />
          <Field label="Notoriety" value={info.notoriety} type="number" onChange={(v) => set("notoriety", v, true)} />
        </div>
        {/* Row: Karma | Total Karma | Public Awareness */}
        <div className="grid grid-cols-3 gap-4">
          <Field label="Karma" value={info.karma} type="number" onChange={(v) => set("karma", v, true)} />
          <Field label="Total Karma" value={info.total_karma} type="number" onChange={(v) => set("total_karma", v, true)} />
          <Field label="Public Awareness" value={info.public_awareness} type="number" onChange={(v) => set("public_awareness", v, true)} />
        </div>
      </CardContent>
    </Card>
  );
}
