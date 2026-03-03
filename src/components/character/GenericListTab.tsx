import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { v4 } from "@/lib/uuid";

interface Props {
  title: string;
  items: Record<string, any>[];
  fields: string[];
  onUpdate: (items: Record<string, any>[]) => void;
}

export function GenericListTab({ title, items, fields, onUpdate }: Props) {
  const add = () => {
    const newItem: Record<string, any> = { id: v4() };
    fields.forEach((f) => (newItem[f] = ""));
    onUpdate([...items, newItem]);
  };

  const update = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const remove = (index: number) => onUpdate(items.filter((_, i) => i !== index));

  const formatLabel = (field: string) =>
    field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display tracking-wider text-sm sm:text-base">{title.toUpperCase()}</CardTitle>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">No items yet.</p>
        )}
        {items.map((item, index) => (
          <div key={item.id || index} className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-muted/30">
            {fields.map((field) => (
              <div key={field} className="flex-1 min-w-[100px]">
                <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">{formatLabel(field)}</Label>
                <Input
                  value={item[field] ?? ""}
                  onChange={(e) => update(index, field, e.target.value)}
                  className="h-8 text-xs font-mono bg-muted/50"
                />
              </div>
            ))}
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive mt-4" onClick={() => remove(index)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
