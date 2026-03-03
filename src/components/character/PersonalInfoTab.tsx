import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SR6PersonalInfo } from "@/types/character";

const FIELDS: { key: keyof SR6PersonalInfo; label: string; type: string }[] = [
  { key: "ethnicity", label: "Ethnicity", type: "text" },
  { key: "age", label: "Age", type: "number" },
  { key: "sex", label: "Sex", type: "text" },
  { key: "height", label: "Height", type: "text" },
  { key: "weight", label: "Weight", type: "text" },
  { key: "street_cred", label: "Street Cred", type: "number" },
  { key: "notoriety", label: "Notoriety", type: "number" },
  { key: "public_awareness", label: "Public Awareness", type: "number" },
  { key: "karma", label: "Karma", type: "number" },
  { key: "total_karma", label: "Total Karma", type: "number" },
];

interface Props {
  info: SR6PersonalInfo;
  onUpdate: (info: SR6PersonalInfo) => void;
}

export function PersonalInfoTab({ info, onUpdate }: Props) {
  const handleChange = (key: keyof SR6PersonalInfo, value: string) => {
    const field = FIELDS.find((f) => f.key === key);
    onUpdate({ ...info, [key]: field?.type === "number" ? (parseInt(value) || 0) : value });
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider">PERSONAL INFO</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {FIELDS.map(({ key, label, type }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                type={type}
                value={(info[key] as any) ?? ""}
                onChange={(e) => handleChange(key, e.target.value)}
                className="h-9 font-mono text-sm bg-muted/50"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
