import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Info, Pencil, Check } from "lucide-react";
import { AccessoryList } from "./AccessoryList";
import { FireModeCheckboxes } from "./FireModes";
import { DiceModifierEditor } from "./DiceModifierEditor";
import { EffectsEditor } from "./EffectsEditor";
import type { WeaponAccessory, DiceModifier } from "@/types/character";

const FIELD_TOOLTIPS: Record<string, string> = {
  ar: "Point Blank / Short / Medium / Long / Extreme",
  attack_ratings: "Point Blank / Short / Medium / Long / Extreme",
};

interface Props {
  title: string;
  items: Record<string, any>[];
  fields: string[];
  fieldLabels?: Record<string, string>;
  fieldOptions?: Record<string, string[]>;
  fieldDefaults?: Record<string, string>;
  numericFields?: string[];
  showEquipped?: boolean;
  showAccessories?: boolean;
  showDiceModifiers?: boolean;
  showEffects?: boolean;
  readOnlyToggle?: boolean;
  onUpdate: (items: Record<string, any>[]) => void;
}

export function GenericListTab({ title, items, fields, fieldLabels, fieldOptions, fieldDefaults, numericFields, showEquipped, showAccessories, showDiceModifiers, showEffects, readOnlyToggle, onUpdate }: Props) {
  const [editing, setEditing] = useState(!readOnlyToggle);

  const add = () => {
    const newItem: Record<string, any> = { id: crypto.randomUUID(), equipped: true };
    fields.forEach((f) => (newItem[f] = fieldDefaults?.[f] ?? ""));
    onUpdate([...items, newItem]);
  };

  const update = (index: number, field: string, value: string | boolean) => {
    const updated = [...items];
    let finalValue: string | boolean | number = value;
    if (typeof value === "string" && numericFields?.includes(field)) {
      const parsed = parseFloat(value.replace(/^\+/, ""));
      finalValue = isNaN(parsed) ? 0 : parsed;
    }
    updated[index] = { ...updated[index], [field]: finalValue };
    onUpdate(updated);
  };

  const remove = (index: number) => onUpdate(items.filter((_, i) => i !== index));

  const formatLabel = (field: string) =>
    field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const showEditUI = readOnlyToggle ? editing : true;

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display tracking-wider text-sm sm:text-base">{title.toUpperCase()}</CardTitle>
        <div className="flex items-center gap-1">
          {showEditUI && (
            <Button variant="outline" size="sm" onClick={add}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          )}
          {readOnlyToggle && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(!editing)}>
              {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">No items yet.</p>
        )}

        {!showEditUI
          ? items.map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/30">
                <span className="font-mono text-sm">
                  {fields.map((f) => item[f] || "—").join(" | ")}
                </span>
              </div>
            ))
          : items.map((item, index) => (
              <div key={item.id || index} className={`flex flex-wrap items-center gap-2 p-2 rounded-md bg-muted/30 ${showEquipped && item.equipped === false ? "opacity-50" : ""}`}>
                {showEquipped && (
                  <div className="flex items-center gap-1 mt-4">
                    <Checkbox
                      checked={item.equipped !== false}
                      onCheckedChange={(checked) => update(index, "equipped", !!checked)}
                      aria-label="Equipped"
                    />
                  </div>
                )}
                {fields.map((field) => (
                  <div key={field} className="flex-1 min-w-[100px]">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-0.5">
                      {fieldLabels?.[field] || formatLabel(field)}
                      {FIELD_TOOLTIPS[field] && (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-2.5 w-2.5 text-muted-foreground/60 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">{FIELD_TOOLTIPS[field]}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </Label>
                    {field === "fire_modes" ? (
                      <FireModeCheckboxes
                        value={item[field] ?? ""}
                        onChange={(v) => update(index, field, v)}
                      />
                    ) : fieldOptions?.[field] ? (
                      <Select value={item[field] || fieldDefaults?.[field] || ""} onValueChange={(v) => update(index, field, v)}>
                        <SelectTrigger className="h-8 text-xs font-mono bg-muted/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions[field].map((opt) => (
                            <SelectItem key={opt} value={opt} className="text-xs capitalize">{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={numericFields?.includes(field) ? "number" : "text"}
                        value={item[field] ?? ""}
                        onChange={(e) => update(index, field, e.target.value)}
                        className="h-8 text-xs font-mono bg-muted/50"
                      />
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive mt-4" onClick={() => remove(index)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
                <div className="w-full mt-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Description</Label>
                  <Textarea
                    value={item.description ?? ""}
                    onChange={(e) => update(index, "description", e.target.value)}
                    placeholder="Paste item description from the rulebook…"
                    className="text-xs font-mono bg-muted/50 min-h-[60px] resize-y"
                  />
                </div>
                {showAccessories && (
                  <div className="w-full">
                    <AccessoryList
                      accessories={(item.accessories as WeaponAccessory[]) || []}
                      onChange={(accs) => update(index, "accessories", accs as any)}
                    />
                  </div>
                )}
                {showEffects && (
                  <div className="w-full mt-1">
                    <EffectsEditor
                      modifiers={(item.dice_modifiers as DiceModifier[]) || []}
                      onChange={(mods) => update(index, "dice_modifiers", mods as any)}
                    />
                  </div>
                )}
                {showDiceModifiers && (
                  <div className="w-full mt-1">
                    <DiceModifierEditor
                      modifiers={(item.dice_modifiers as DiceModifier[]) || []}
                      onChange={(mods) => update(index, "dice_modifiers", mods as any)}
                    />
                  </div>
                )}
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
