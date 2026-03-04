import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Pencil, Check } from "lucide-react";
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

function Field({ label, value, type, onChange, onBlur, readOnly }: { label: string; value: any; type?: string; onChange?: (val: string) => void; onBlur?: () => void; readOnly?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</Label>
      {readOnly ? (
        <span className="block font-mono text-sm py-1">{value || "—"}</span>
      ) : (
        <Input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          className="h-9 font-mono text-sm bg-muted/50"
        />
      )}
    </div>
  );
}

export function PersonalInfoTab({ info, onUpdate, name, metatype, onNameChange, onMetatypeChange, onNameBlur, onMetatypeBlur }: Props) {
  const [editing, setEditing] = useState(false);

  const set = (key: keyof SR6PersonalInfo, value: string, isNum = false) => {
    onUpdate({ ...info, [key]: isNum ? (parseInt(value) || 0) : value });
  };

  const toggleEdit = () => {
    if (editing) {
      onNameBlur();
      onMetatypeBlur();
    }
    setEditing(!editing);
  };

  const ro = !editing;

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display tracking-wider">PERSONAL DATA</CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleEdit}>
          {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={name} readOnly={ro} onChange={onNameChange} onBlur={onNameBlur} />
          <Field label="Metatype" value={metatype} readOnly={ro} onChange={onMetatypeChange} onBlur={onMetatypeBlur} />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Field label="Ethnicity" value={info.ethnicity} readOnly={ro} onChange={(v) => set("ethnicity", v)} />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Field label="Age" value={info.age} type="number" readOnly={ro} onChange={(v) => set("age", v, true)} />
          <Field label="Sex" value={info.sex} readOnly={ro} onChange={(v) => set("sex", v)} />
          <Field label="Height" value={info.height} readOnly={ro} onChange={(v) => set("height", v)} />
          <Field label="Weight" value={info.weight} readOnly={ro} onChange={(v) => set("weight", v)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Street Cred" value={info.street_cred} type="number" readOnly={ro} onChange={(v) => set("street_cred", v, true)} />
          <Field label="Notoriety" value={info.notoriety} type="number" readOnly={ro} onChange={(v) => set("notoriety", v, true)} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Karma" value={info.karma} type="number" readOnly={ro} onChange={(v) => set("karma", v, true)} />
          <Field label="Total Karma" value={info.total_karma} type="number" readOnly={ro} onChange={(v) => set("total_karma", v, true)} />
          <Field label="Public Awareness" value={info.public_awareness} type="number" readOnly={ro} onChange={(v) => set("public_awareness", v, true)} />
        </div>
      </CardContent>
    </Card>
  );
}
