import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { v4 as generateUUID } from "@/lib/uuid";
import { PRIORITY_TABLE, formatNuyen, type PriorityLevel } from "@/data/sr6-reference";
import type { WizardState } from "@/pages/CharacterWizard";
import type { WizardGearItem } from "@/types/character";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const GEAR_CATEGORIES = [
  { value: "weapons", label: "Weapons" },
  { value: "armor", label: "Armor" },
  { value: "electronics", label: "Electronics" },
  { value: "vehicles", label: "Vehicles" },
  { value: "augmentations", label: "Augmentations" },
  { value: "miscellaneous", label: "Miscellaneous" },
] as const;

export default function Step5Gear({ state, onChange }: Props) {
  const gear = state.purchasedGear || [];
  const resPriority = state.priorities.resources as PriorityLevel | undefined;
  const startingNuyen = resPriority ? PRIORITY_TABLE[resPriority].resources : 0;

  const totalSpent = gear.reduce((sum, g) => sum + g.cost * g.quantity, 0);
  const remaining = startingNuyen - totalSpent;

  const addItem = () => {
    const item: WizardGearItem = {
      id: generateUUID(),
      name: "",
      category: "miscellaneous",
      cost: 0,
      quantity: 1,
      notes: "",
    };
    onChange({ purchasedGear: [...gear, item] });
  };

  const updateItem = (id: string, updates: Partial<WizardGearItem>) => {
    onChange({
      purchasedGear: gear.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    });
  };

  const removeItem = (id: string) => {
    onChange({ purchasedGear: gear.filter((g) => g.id !== id) });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide">Gear &amp; Equipment</CardTitle>
          <p className="text-sm text-muted-foreground">
            Spend your starting nuyen on weapons, armor, gear, augmentations, and vehicles.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 text-sm font-mono flex-wrap">
            <Badge variant="outline">Budget: {formatNuyen(startingNuyen)}</Badge>
            <Badge variant="outline" className="text-amber-400 border-amber-400/30">
              Spent: {formatNuyen(totalSpent)}
            </Badge>
            <Badge variant="outline" className={remaining >= 0 ? "text-emerald-400 border-emerald-400/30" : "text-destructive border-destructive/30"}>
              Remaining: {formatNuyen(remaining)}
            </Badge>
          </div>

          {gear.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_130px_100px_60px_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs font-display tracking-wide">Name</Label>
                <Input
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                  placeholder="Item name"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-display tracking-wide">Category</Label>
                <Select
                  value={item.category}
                  onValueChange={(v) => updateItem(item.id, { category: v as WizardGearItem["category"] })}
                >
                  <SelectTrigger className="font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GEAR_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-display tracking-wide">Cost (¥)</Label>
                <Input
                  type="number"
                  value={item.cost}
                  onChange={(e) => updateItem(item.id, { cost: parseInt(e.target.value) || 0 })}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-display tracking-wide">Qty</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="font-mono text-sm"
                  min={1}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addItem} className="font-display tracking-wide">
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
