import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { SR6Quality } from "@/types/character";
import { v4 } from "@/lib/uuid";

interface Props {
  qualities: SR6Quality[];
  onUpdate: (q: SR6Quality[], karmaInfo?: { description: string; cost: number }) => void;
}

export function QualitiesTab({ qualities, onUpdate }: Props) {
  const add = () => {
    onUpdate([...qualities, { id: v4(), name: "", type: "positive", karma_cost: 0, effects: "" }]);
  };

  const update = (index: number, updates: Partial<SR6Quality>) => {
    const oldQ = qualities[index];
    const updated = [...qualities];
    updated[index] = { ...updated[index], ...updates };

    // If a quality's karma_cost was just set (from 0 to something) and it has a name, prompt for karma
    if (updates.karma_cost !== undefined && updates.karma_cost > 0 && updated[index].name) {
      const q = updated[index];
      if (q.type === "positive") {
        onUpdate(updated, {
          description: `Buy positive quality "${q.name}" (${q.karma_cost} karma)`,
          cost: q.karma_cost,
        });
        return;
      }
    }

    onUpdate(updated);
  };

  const remove = (index: number) => {
    const q = qualities[index];
    // Buying off a negative quality costs karma
    if (q.type === "negative" && q.karma_cost > 0) {
      onUpdate(qualities.filter((_, i) => i !== index), {
        description: `Buy off negative quality "${q.name}" (${q.karma_cost} karma)`,
        cost: q.karma_cost,
      });
      return;
    }
    onUpdate(qualities.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display tracking-wider">QUALITIES</CardTitle>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Quality
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {qualities.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">No qualities added yet.</p>
        )}
        {qualities.map((q, index) => (
          <div key={q.id} className="flex flex-wrap items-center gap-2 p-2 rounded-md bg-muted/30">
            <Select value={q.type} onValueChange={(v) => update(index, { type: v as "positive" | "negative" })}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={q.name}
              onChange={(e) => update(index, { name: e.target.value })}
              className="h-8 text-xs flex-1 min-w-[120px]"
              placeholder="Quality name"
            />
            <Input
              type="number"
              value={q.karma_cost}
              onChange={(e) => update(index, { karma_cost: parseInt(e.target.value) || 0 })}
              className="h-8 text-xs w-20 font-mono"
              placeholder="Karma"
            />
            <Input
              value={q.effects}
              onChange={(e) => update(index, { effects: e.target.value })}
              className="h-8 text-xs flex-1 min-w-[120px]"
              placeholder="Effects"
            />
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => remove(index)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
