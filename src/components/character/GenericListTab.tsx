import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Info, Pencil, Check, Zap, Dice5 } from "lucide-react";
import { AccessoryList } from "./AccessoryList";
import { DiceModifierEditor } from "./DiceModifierEditor";
import { EffectsEditor } from "./EffectsEditor";
import { GearReferenceSelect } from "@/components/GearReferenceSelect";
import { MagicReferenceSelect, type MagicReferenceCategory } from "@/components/MagicReferenceSelect";
import {
  referenceToCharacterRanged,
  referenceToCharacterMelee,
  referenceToCharacterArmor,
  referenceToCharacterAugmentation,
  referenceToCharacterGear,
  referenceToCharacterVehicle,
  normalizeAccessories,
} from "@/lib/gear-reference-utils";
import type { GearCategory } from "@/types/gear-reference";
import type { WeaponAccessory, DiceModifier } from "@/types/character";

const FIELD_TOOLTIPS: Record<string, string> = {
  ar: "Point Blank / Short / Medium / Long / Extreme",
  attack_ratings: "Point Blank / Short / Medium / Long / Extreme",
  fire_modes: "SS, SA, BF, FA (slash or comma separated)",
};

interface Props {
  title: string;
  items: Record<string, any>[];
  fields: string[];
  fieldLabels?: Record<string, string>;
  fieldOptions?: Record<string, string[]>;
  fieldDefaults?: Record<string, string>;
  fieldWidths?: Record<string, string>;
  numericFields?: string[];
  showEquipped?: boolean;
  showAccessories?: boolean;
  showDiceModifiers?: boolean;
  showEffects?: boolean;
  readOnlyToggle?: boolean;
  itemEditMode?: boolean;
  referenceCategory?: GearCategory;
  magicReferenceCategory?: MagicReferenceCategory;
  magicReferenceCategories?: MagicReferenceCategory[];
  onUpdate: (items: Record<string, any>[]) => void;
}

type RefItem = import("@/types/gear-reference").GearReference[GearCategory][number];

const REFERENCE_CONVERTERS: Record<GearCategory, (ref: RefItem) => Record<string, unknown>> = {
  rangedWeapons: referenceToCharacterRanged,
  meleeWeapons: referenceToCharacterMelee,
  armor: referenceToCharacterArmor,
  electronics: (ref) => referenceToCharacterGear(ref as import("@/types/gear-reference").ReferenceMiscGear),
  augmentations: referenceToCharacterAugmentation,
  vehicles: referenceToCharacterVehicle,
  miscellaneous: referenceToCharacterGear,
};

export function GenericListTab({ title, items, fields, fieldLabels, fieldOptions, fieldDefaults, fieldWidths, numericFields, showEquipped, showAccessories, showDiceModifiers, showEffects, readOnlyToggle, itemEditMode, referenceCategory, magicReferenceCategory, magicReferenceCategories, onUpdate }: Props) {
  const [editing, setEditing] = useState(!readOnlyToggle);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const add = () => {
    const newItem: Record<string, any> = { id: crypto.randomUUID(), equipped: true };
    fields.forEach((f) => (newItem[f] = fieldDefaults?.[f] ?? ""));
    const updated = [...items, newItem];
    onUpdate(updated);
    if (itemEditMode) {
      setEditingItemId(newItem.id);
    }
  };

  const update = (index: number, field: string, value: string | boolean | number | WeaponAccessory[] | DiceModifier[]) => {
    const updated = [...items];
    let finalValue: string | boolean | number | WeaponAccessory[] | DiceModifier[] = value;
    if (typeof value === "string" && numericFields?.includes(field)) {
      const parsed = parseFloat(value.replace(/^\+/, ""));
      finalValue = isNaN(parsed) ? 0 : parsed;
    }
    updated[index] = { ...updated[index], [field]: finalValue };
    onUpdate(updated);
  };

  const remove = (index: number) => {
    const removedId = items[index]?.id;
    onUpdate(items.filter((_, i) => i !== index));
    if (itemEditMode && removedId === editingItemId) {
      setEditingItemId(null);
    }
  };

  const formatLabel = (field: string) =>
    field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const showEditUI = itemEditMode || (readOnlyToggle ? editing : true);

  const getItemId = (item: Record<string, any>, index: number) =>
    item.id ?? `legacy-${index}`;

  const isItemEditing = (item: Record<string, any>, index: number) =>
    itemEditMode && editingItemId === getItemId(item, index);

  const isItemReadOnly = (item: Record<string, any>, index: number) =>
    itemEditMode ? !isItemEditing(item, index) : !showEditUI;

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display tracking-wider text-sm sm:text-base">{title.toUpperCase()}</CardTitle>
        <div className="flex items-center gap-1 flex-wrap">
          {showEditUI && referenceCategory && (
            <GearReferenceSelect
              category={referenceCategory}
              onSelect={(item, cat) => {
                const converter = REFERENCE_CONVERTERS[cat];
                if (converter) {
                  const newItem = converter(item) as Record<string, any>;
                  onUpdate([...items, newItem]);
                  if (itemEditMode && newItem.id) {
                    setEditingItemId(newItem.id);
                  }
                }
              }}
              triggerLabel="Add from reference"
            />
          )}
          {showEditUI && (magicReferenceCategory || magicReferenceCategories) && (
            <>
              {(magicReferenceCategories ?? (magicReferenceCategory ? [magicReferenceCategory] : [])).map((cat) => (
                <MagicReferenceSelect
                  key={cat}
                  category={cat}
                  onSelect={(item) => {
                    const newItem = { ...item } as Record<string, any>;
                    onUpdate([...items, newItem]);
                    if (itemEditMode && newItem.id) {
                      setEditingItemId(newItem.id);
                    }
                  }}
                  triggerLabel={cat === "spells" ? "Add spell" : cat === "adeptPowers" ? "Add adept power" : "Add complex form"}
                />
              ))}
            </>
          )}
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
      <CardContent className="space-y-5">
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">No items yet.</p>
        )}

        {items.map((item, index) =>
          isItemReadOnly(item, index) ? (
            <div
              key={getItemId(item, index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30 ${showEquipped && item.equipped === false ? "opacity-50" : ""}`}
            >
              {showEquipped && (
                <Checkbox
                  checked={item.equipped !== false}
                  onCheckedChange={(checked) => update(index, "equipped", !!checked)}
                  aria-label="Equipped"
                />
              )}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-display tracking-wider text-xs truncate">
                  {item[fields[0]] || "—"}
                </span>
                {fields.length > 1 && (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {fields.slice(1).map((f) => item[f] ?? "—").join(" · ")}
                  </span>
                )}
              </div>
              {itemEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setEditingItemId(getItemId(item, index))}
                  aria-label="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ) : (
              <div
                key={getItemId(item, index)}
                className={`rounded-lg border border-border/60 border-l-[3px] border-l-primary/40 bg-muted/20 overflow-hidden pb-1 ${showEquipped && item.equipped === false ? "opacity-50" : ""}`}
              >
                {/* === Core Fields === */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 rounded-t-lg">
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
                    <div key={field} className="min-w-[100px]" style={fieldWidths?.[field] ? { flex: fieldWidths[field] } : { flex: '1' }}>
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
                      {fieldOptions?.[field] ? (
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
                  {itemEditMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 mt-4"
                      onClick={() => setEditingItemId(null)}
                      aria-label="Done editing"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive mt-4" onClick={() => remove(index)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* === Notes (shown in Equipped Weapons & Armor) === */}
                <div className="bg-background/30 rounded-md mx-3 mt-3 mb-2 p-3">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Notes</Label>
                  <Input
                    value={item.notes ?? ""}
                    onChange={(e) => update(index, "notes", e.target.value)}
                    placeholder="Short notes shown in Equipped Weapons & Armor…"
                    className="text-xs font-mono bg-muted/50 mt-1"
                  />
                </div>

                {/* === Description === */}
                <div className="bg-background/30 rounded-md mx-3 mb-2 p-3">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Description</Label>
                  <Textarea
                    value={item.description ?? ""}
                    onChange={(e) => update(index, "description", e.target.value)}
                    placeholder="Paste item description from the rulebook…"
                    className="text-xs font-mono bg-muted/50 min-h-[60px] resize-y mt-1"
                  />
                </div>

                {/* === Accessories === */}
                {showAccessories && (
                  <div className="bg-background/30 rounded-md mx-3 mb-2 p-3">
                    <AccessoryList
                      accessories={normalizeAccessories(item.accessories)}
                      onChange={(accs) => update(index, "accessories", accs)}
                    />
                  </div>
                )}

                {/* === Effects === */}
                {showEffects && (
                  <div className="bg-background/30 rounded-md mx-3 mb-2 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="h-3.5 w-3.5 text-accent-foreground/70" />
                      <span className="text-[11px] font-display font-semibold uppercase tracking-widest text-accent-foreground/70">Effects</span>
                    </div>
                    <EffectsEditor
                      modifiers={(item.dice_modifiers as DiceModifier[]) || []}
                      onChange={(mods) => update(index, "dice_modifiers", mods)}
                    />
                  </div>
                )}

                {/* === Dice / Skill Modifiers === */}
                {showDiceModifiers && (
                  <div className="bg-background/30 rounded-md mx-3 mb-2 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Dice5 className="h-3.5 w-3.5 text-primary/70" />
                      <span className="text-[11px] font-display font-semibold uppercase tracking-widest text-primary/70">Skill Modifiers</span>
                    </div>
                    <DiceModifierEditor
                      modifiers={(item.dice_modifiers as DiceModifier[]) || []}
                      onChange={(mods) => update(index, "dice_modifiers", mods)}
                    />
                  </div>
                )}
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
