import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, PlusCircle, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { v4 as generateUUID } from "@/lib/uuid";
import { PRIORITY_TABLE, formatNuyen, type PriorityLevel } from "@/data/sr6-reference";
import { SR6_CORE_SKILLS } from "@/types/character";
import type { WizardState } from "@/pages/CharacterWizard";
import type {
  WizardGearItem,
  WizardRangedWeapon,
  WizardMeleeWeapon,
  WizardArmor,
  WizardElectronics,
  WizardAugmentation,
  WizardVehicle,
  WizardMiscGear,
  DiceModifier,
} from "@/types/character";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

type GearCategory = WizardGearItem["category"];

const GEAR_CATEGORIES: { value: GearCategory; label: string }[] = [
  { value: "ranged_weapon", label: "Ranged Weapon" },
  { value: "melee_weapon", label: "Melee Weapon" },
  { value: "armor", label: "Armor" },
  { value: "electronics", label: "Electronics" },
  { value: "augmentation", label: "Augmentation" },
  { value: "vehicle", label: "Vehicle / Drone" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

function createItem(category: GearCategory): WizardGearItem {
  const base = { id: generateUUID(), name: "", cost: 0, quantity: 1, availability: "", equipped: true };
  switch (category) {
    case "ranged_weapon":
      return { ...base, category, dv: "", attack_ratings: "", fire_modes: "", ammo: "", accessories: "" };
    case "melee_weapon":
      return { ...base, category, dv: "", attack_ratings: "", reach: 0 };
    case "armor":
      return { ...base, category, defense_rating: 0, capacity: 0, modifications: "", subtype: "body" as const };
    case "electronics":
      return { ...base, category, device_rating: 0, programs: "", notes: "" };
    case "augmentation":
      return { ...base, category, aug_type: "cyberware", essence_cost: 0, rating: 0, effects: "", dice_modifiers: [] };
    case "vehicle":
      return { ...base, category, handling: "", speed: "", veh_body: 0, veh_armor: 0, sensor: 0, pilot: 0, seats: 1 };
    case "miscellaneous":
      return { ...base, category, notes: "", dice_modifiers: [] };
  }
}

// ----- Dice Modifier Editor (for augmentations & misc) -----
function DiceModifierEditor({
  modifiers,
  onChange,
}: {
  modifiers: DiceModifier[];
  onChange: (mods: DiceModifier[]) => void;
}) {
  const add = () => onChange([...modifiers, { skill: "", value: 1, source: "" }]);
  const remove = (i: number) => onChange(modifiers.filter((_, idx) => idx !== i));
  const update = (i: number, u: Partial<DiceModifier>) =>
    onChange(modifiers.map((m, idx) => (idx === i ? { ...m, ...u } : m)));

  return (
    <div className="space-y-1">
      <Label className="text-xs font-display tracking-wide">Dice Modifiers</Label>
      {modifiers.map((mod, i) => (
        <div key={i} className="flex gap-1 items-center">
          <Select value={mod.skill || "__all__"} onValueChange={(v) => update(i, { skill: v === "__all__" ? undefined : v })}>
            <SelectTrigger className="font-mono text-xs h-8 flex-1">
              <SelectValue placeholder="Skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Skills</SelectItem>
              {SR6_CORE_SKILLS.map((s) => (
                <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={mod.value}
            onChange={(e) => update(i, { value: parseInt(e.target.value) || 0 })}
            className="w-16 h-8 font-mono text-xs"
          />
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => remove(i)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add} className="text-xs h-7">
        <PlusCircle className="h-3 w-3 mr-1" /> Add Modifier
      </Button>
    </div>
  );
}

// ----- Category-specific field renderers -----
const FIRE_MODES = [
  { code: "SS", tip: "Single-Shot: One shot per Attack action, must reload after" },
  { code: "SA", tip: "Semi-Automatic: One shot per Attack action, +1 per additional" },
  { code: "BF", tip: "Burst Fire: Fires a burst, −2 Defense Rating" },
  { code: "FA", tip: "Full Auto: Fires continuous, −6 Defense Rating" },
] as const;

function FireModeCheckboxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const active = new Set(value.split(",").map((s) => s.trim()).filter(Boolean));
  const toggle = (code: string) => {
    const next = new Set(active);
    if (next.has(code)) next.delete(code); else next.add(code);
    onChange(FIRE_MODES.map((m) => m.code).filter((c) => next.has(c)).join(","));
  };
  return (
    <div className="space-y-1">
      <Label className="text-xs font-display tracking-wide">Fire Modes</Label>
      <TooltipProvider delayDuration={200}>
        <div className="flex items-center gap-3">
          {FIRE_MODES.map((m) => (
            <Tooltip key={m.code}>
              <TooltipTrigger asChild>
                <label className="flex items-center gap-1 cursor-pointer">
                  <Checkbox
                    checked={active.has(m.code)}
                    onCheckedChange={() => toggle(m.code)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="font-mono text-xs">{m.code}</span>
                </label>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px] text-xs">{m.tip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}

function RangedFields({ item, onUpdate }: { item: WizardRangedWeapon; onUpdate: (u: Partial<WizardRangedWeapon>) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <Field label="DV" value={item.dv} onChange={(v) => onUpdate({ dv: v })} />
      <Field label="Attack Ratings" value={item.attack_ratings} onChange={(v) => onUpdate({ attack_ratings: v })} />
      <FireModeCheckboxes value={item.fire_modes} onChange={(v) => onUpdate({ fire_modes: v })} />
      <Field label="Ammo" value={item.ammo} onChange={(v) => onUpdate({ ammo: v })} />
      <Field label="Accessories" value={item.accessories} onChange={(v) => onUpdate({ accessories: v })} className="col-span-2" />
    </div>
  );
}

function MeleeFields({ item, onUpdate }: { item: WizardMeleeWeapon; onUpdate: (u: Partial<WizardMeleeWeapon>) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Field label="DV" value={item.dv} onChange={(v) => onUpdate({ dv: v })} />
      <Field label="Attack Ratings" value={item.attack_ratings} onChange={(v) => onUpdate({ attack_ratings: v })} />
      <NumField label="Reach" value={item.reach} onChange={(v) => onUpdate({ reach: v })} />
    </div>
  );
}

function ArmorFields({ item, onUpdate }: { item: WizardArmor; onUpdate: (u: Partial<WizardArmor>) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div>
        <Label className="text-xs text-muted-foreground">Type</Label>
        <Select value={item.subtype || "body"} onValueChange={(v) => onUpdate({ subtype: v as WizardArmor["subtype"] })}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="body">Body</SelectItem>
            <SelectItem value="helmet">Helmet</SelectItem>
            <SelectItem value="shield">Shield</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumField label="Defense Rating" value={item.defense_rating} onChange={(v) => onUpdate({ defense_rating: v })} />
      <NumField label="Capacity" value={item.capacity} onChange={(v) => onUpdate({ capacity: v })} />
      <Field label="Modifications" value={item.modifications} onChange={(v) => onUpdate({ modifications: v })} />
    </div>
  );
}

function ElectronicsFields({ item, onUpdate }: { item: WizardElectronics; onUpdate: (u: Partial<WizardElectronics>) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <NumField label="Device Rating" value={item.device_rating} onChange={(v) => onUpdate({ device_rating: v })} />
      <Field label="Programs" value={item.programs} onChange={(v) => onUpdate({ programs: v })} />
      <Field label="Notes" value={item.notes} onChange={(v) => onUpdate({ notes: v })} className="col-span-2" />
    </div>
  );
}

function AugmentationFields({ item, onUpdate }: { item: WizardAugmentation; onUpdate: (u: Partial<WizardAugmentation>) => void }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="space-y-1">
          <Label className="text-xs font-display tracking-wide">Type</Label>
          <Select value={item.aug_type} onValueChange={(v) => onUpdate({ aug_type: v as "cyberware" | "bioware" })}>
            <SelectTrigger className="font-mono text-xs h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cyberware">Cyberware</SelectItem>
              <SelectItem value="bioware">Bioware</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NumField label="Essence Cost" value={item.essence_cost} onChange={(v) => onUpdate({ essence_cost: v })} step={0.1} />
        <NumField label="Rating" value={item.rating} onChange={(v) => onUpdate({ rating: v })} />
        <Field label="Effects" value={item.effects} onChange={(v) => onUpdate({ effects: v })} />
      </div>
      <DiceModifierEditor modifiers={item.dice_modifiers} onChange={(m) => onUpdate({ dice_modifiers: m })} />
    </div>
  );
}

function VehicleFields({ item, onUpdate }: { item: WizardVehicle; onUpdate: (u: Partial<WizardVehicle>) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      <Field label="Handling" value={item.handling} onChange={(v) => onUpdate({ handling: v })} />
      <Field label="Speed" value={item.speed} onChange={(v) => onUpdate({ speed: v })} />
      <NumField label="Body" value={item.veh_body} onChange={(v) => onUpdate({ veh_body: v })} />
      <NumField label="Armor" value={item.veh_armor} onChange={(v) => onUpdate({ veh_armor: v })} />
      <NumField label="Sensor" value={item.sensor} onChange={(v) => onUpdate({ sensor: v })} />
      <NumField label="Pilot" value={item.pilot} onChange={(v) => onUpdate({ pilot: v })} />
      <NumField label="Seats" value={item.seats} onChange={(v) => onUpdate({ seats: v })} />
    </div>
  );
}

function MiscFields({ item, onUpdate }: { item: WizardMiscGear; onUpdate: (u: Partial<WizardMiscGear>) => void }) {
  return (
    <div className="space-y-2">
      <Field label="Notes" value={item.notes} onChange={(v) => onUpdate({ notes: v })} />
      <DiceModifierEditor modifiers={item.dice_modifiers} onChange={(m) => onUpdate({ dice_modifiers: m })} />
    </div>
  );
}

// ----- Helpers -----
function Field({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={`space-y-1 ${className || ""}`}>
      <Label className="text-xs font-display tracking-wide">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs h-8" placeholder={label} />
    </div>
  );
}

function NumField({ label, value, onChange, step }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-display tracking-wide">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(step && step < 1 ? parseFloat(e.target.value) || 0 : parseInt(e.target.value) || 0)}
        className="font-mono text-xs h-8"
        step={step}
      />
    </div>
  );
}

function CategoryFields({ item, onUpdate }: { item: WizardGearItem; onUpdate: (u: Partial<WizardGearItem>) => void }) {
  switch (item.category) {
    case "ranged_weapon": return <RangedFields item={item} onUpdate={onUpdate as any} />;
    case "melee_weapon": return <MeleeFields item={item} onUpdate={onUpdate as any} />;
    case "armor": return <ArmorFields item={item} onUpdate={onUpdate as any} />;
    case "electronics": return <ElectronicsFields item={item} onUpdate={onUpdate as any} />;
    case "augmentation": return <AugmentationFields item={item} onUpdate={onUpdate as any} />;
    case "vehicle": return <VehicleFields item={item} onUpdate={onUpdate as any} />;
    case "miscellaneous": return <MiscFields item={item} onUpdate={onUpdate as any} />;
  }
}

// ----- Main Component -----
export default function Step5Gear({ state, onChange }: Props) {
  const gear = state.purchasedGear || [];
  const resPriority = state.priorities.resources as PriorityLevel | undefined;
  const startingNuyen = resPriority ? PRIORITY_TABLE[resPriority].resources : 0;

  const totalSpent = gear.reduce((sum, g) => sum + g.cost * g.quantity, 0);
  const remaining = startingNuyen - totalSpent;

  const totalEssenceLost = gear
    .filter((g): g is WizardAugmentation => g.category === "augmentation")
    .reduce((sum, g) => sum + g.essence_cost, 0);
  const currentEssence = (6 - totalEssenceLost).toFixed(1);

  const addItem = (category: GearCategory) => {
    onChange({ purchasedGear: [...gear, createItem(category)] });
  };

  const updateItem = (id: string, updates: Partial<WizardGearItem>) => {
    onChange({
      purchasedGear: gear.map((g) => (g.id === id ? { ...g, ...updates } : g)) as WizardGearItem[],
    });
  };

  const changeCategory = (id: string, newCategory: GearCategory) => {
    const old = gear.find((g) => g.id === id);
    if (!old) return;
    const fresh = createItem(newCategory);
    fresh.id = old.id;
    fresh.name = old.name;
    fresh.cost = old.cost;
    fresh.quantity = old.quantity;
    fresh.availability = old.availability;
    onChange({ purchasedGear: gear.map((g) => (g.id === id ? fresh : g)) });
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
          {/* Budget & Essence badges */}
          <div className="flex gap-3 text-sm font-mono flex-wrap">
            <Badge variant="outline">Budget: {formatNuyen(startingNuyen)}</Badge>
            <Badge variant="outline" className="text-amber-400 border-amber-400/30">
              Spent: {formatNuyen(totalSpent)}
            </Badge>
            <Badge
              variant="outline"
              className={remaining >= 0 ? "text-emerald-400 border-emerald-400/30" : "text-destructive border-destructive/30"}
            >
              Remaining: {formatNuyen(remaining)}
            </Badge>
            {totalEssenceLost > 0 && (
              <Badge
                variant="outline"
                className={parseFloat(currentEssence) > 0 ? "text-sky-400 border-sky-400/30" : "text-destructive border-destructive/30"}
              >
                Essence: {currentEssence}
              </Badge>
            )}
          </div>

          {/* Gear list */}
          {gear.map((item) => (
            <div key={item.id} className={`border border-border/40 rounded-md p-3 space-y-3 bg-muted/10 ${item.category !== "augmentation" && item.equipped === false ? "opacity-50" : ""}`}>
              {/* Shared row: equipped, name, category, cost, qty, avail, delete */}
              <div className="grid grid-cols-[auto_1fr_140px_90px_60px_90px_auto] gap-2 items-end">
                {item.category !== "augmentation" ? (
                  <div className="space-y-1">
                    <Label className="text-xs font-display tracking-wide invisible">E</Label>
                    <Checkbox
                      checked={item.equipped !== false}
                      onCheckedChange={(checked) => updateItem(item.id, { equipped: !!checked })}
                      aria-label="Equipped"
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <div />
                )}
                <Field label="Name" value={item.name} onChange={(v) => updateItem(item.id, { name: v })} />
                <div className="space-y-1">
                  <Label className="text-xs font-display tracking-wide">Category</Label>
                  <Select value={item.category} onValueChange={(v) => changeCategory(item.id, v as GearCategory)}>
                    <SelectTrigger className="font-mono text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GEAR_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <NumField label="Cost (¥)" value={item.cost} onChange={(v) => updateItem(item.id, { cost: v })} />
                <NumField label="Qty" value={item.quantity} onChange={(v) => updateItem(item.id, { quantity: Math.max(1, v) })} />
                <Field label="Avail" value={item.availability} onChange={(v) => updateItem(item.id, { availability: v })} />
                <div className="space-y-1">
                  <Label className="text-xs invisible">X</Label>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Category-specific fields */}
              <CategoryFields item={item} onUpdate={(u) => updateItem(item.id, u)} />
            </div>
          ))}

          {/* Add button */}
          <Button variant="outline" size="sm" onClick={() => addItem("miscellaneous")} className="font-display tracking-wide">
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
