import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, Trash2, Pencil, Check, Eye, Heart, Sparkles, Hand, BookOpen } from "lucide-react";
import { MagicReferenceSelect } from "@/components/MagicReferenceSelect";
import { DiceModifierEditor } from "./DiceModifierEditor";
import { DicePoolDisplay } from "./DicePoolTooltip";
import { cn } from "@/lib/utils";
import {
  getSorceryPool,
  getSpellAttackRating,
  getDrainResistancePool,
  getIndirectBaseDV,
} from "@/lib/spell-utils";
import type { DiceModifier, SR6Attributes, SR6Skill, SR6Quality, SR6Augmentation, SR6Gear, SR6AdeptPower } from "@/types/character";
import type { MagicTradition } from "@/data/magic-traditions";
import type { SpellType } from "@/types/magic-reference";

const SPELL_TYPES: SpellType[] = ["Combat", "Detection", "Health", "Illusion", "Manipulation"];

const RANGE_DEFINITIONS: Record<string, string> = {
  Touch: "Target must be touched; unarmed attack to establish contact if unwilling",
  LOS: "Physical line of sight required (optical lenses count; magical/digital vision does not)",
  "LOS (A)": "LOS plus area effect (base 2 m radius sphere)",
  Minion: "Creates a minion entity (e.g. Watcher)",
  Anchored: "Effect anchored to a location",
  "Sustained area": "Sustains an area effect",
  Varies: "Defined per ritual (spotter, material link, etc.)",
};

const TYPE_ICONS: Record<SpellType, React.ElementType> = {
  Combat: Zap,
  Detection: Eye,
  Health: Heart,
  Illusion: Sparkles,
  Manipulation: Hand,
};

function CategoryHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-1 pt-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

type SpellItem = {
  id?: string;
  name: string;
  category: string;
  type: string;
  drain: string;
  duration: string;
  range: string;
  effects: string;
  description?: string;
  active?: boolean;
  dice_modifiers?: DiceModifier[];
  [k: string]: unknown;
};

type ActiveSpellInput = { name: string; dice_modifiers?: DiceModifier[] };

interface Props {
  items: SpellItem[];
  onUpdate: (items: SpellItem[]) => void;
  attributes?: SR6Attributes;
  skills?: SR6Skill[];
  qualities?: SR6Quality[];
  augmentations?: SR6Augmentation[];
  gear?: SR6Gear[];
  adeptPowers?: SR6AdeptPower[];
  activeSpells?: ActiveSpellInput[];
  woundModifier?: number;
  magicTradition?: MagicTradition | null;
}

function SpellcastingInfoColumn({
  attributes = {},
  skills = [],
  qualities = [],
  augmentations = [],
  gear = [],
  adeptPowers = [],
  activeSpells = [],
  woundModifier,
  magicTradition,
  items,
}: {
  attributes: SR6Attributes;
  skills: SR6Skill[];
  qualities: SR6Quality[];
  augmentations: SR6Augmentation[];
  gear: SR6Gear[];
  adeptPowers: SR6AdeptPower[];
  activeSpells: ActiveSpellInput[];
  woundModifier?: number;
  magicTradition: MagicTradition | null | undefined;
  items: SpellItem[];
}) {
  const sorceryPool = getSorceryPool(
    attributes,
    skills,
    qualities,
    augmentations,
    gear,
    woundModifier,
    adeptPowers,
    activeSpells
  );
  const spellAR = getSpellAttackRating(attributes, magicTradition ?? null);
  const drainPool = getDrainResistancePool(attributes, magicTradition ?? null);
  const magic = Number(attributes.magic) || 0;
  const hasCombatSpells = items.some((i) => i.type === "Combat");
  const indirectBaseDV = hasCombatSpells ? getIndirectBaseDV(magic) : null;

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="font-display tracking-wider text-sm sm:text-base">DICE POOLS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Sorcery Test</span>
            <DicePoolDisplay pool={sorceryPool} className="font-mono text-sm font-bold text-primary neon-glow-cyan" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Spell Attack Rating</span>
            <p className="font-mono text-sm font-bold text-primary">
              {spellAR !== null ? spellAR : "—"}
            </p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Drain Resistance</span>
            <p className="font-mono text-sm font-bold text-primary">
              {drainPool !== null ? `${drainPool}d6` : "—"}
            </p>
          </div>
          {indirectBaseDV !== null && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Indirect Base DV</span>
              <p className="font-mono text-sm font-bold text-primary">{indirectBaseDV}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="font-display tracking-wider text-sm sm:text-base flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            MAGIC CHEAT SHEET
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">Combat Spell Steps</p>
            <ol className="list-decimal list-outside pl-5 space-y-1 font-mono text-[11px] text-muted-foreground marker:text-muted-foreground">
              <li className="pl-1">Select targets</li>
              <li className="pl-1">Compare AR vs DR (Edge check)</li>
              <li className="pl-1">Adjust spell (Amp Up, Increase Area)</li>
              <li className="pl-1">Roll Sorcery + Magic vs defense (Direct: WIL+INT; Indirect: REA+WIL)</li>
              <li className="pl-1">Resolve damage (Direct: net hits; Indirect: Magic/2 + net hits, target resists with Body)</li>
              <li className="pl-1">Resist Drain (WIL + tradition attribute vs spell DV)</li>
            </ol>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1.5">General Spell Steps</p>
            <ol className="list-decimal list-outside pl-5 space-y-1 font-mono text-[11px] text-muted-foreground marker:text-muted-foreground">
              <li className="pl-1">Adjust spell</li>
              <li className="pl-1">Roll Spellcasting test (Sorcery + Magic)</li>
              <li className="pl-1">Deal with drain</li>
            </ol>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Sustained Penalty</p>
            <p className="font-mono text-[11px] text-muted-foreground">-2 dice per sustained spell to any action test</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SpellSection({
  title,
  items,
  categoryFilter,
  onAdd,
  onUpdate,
  onRemove,
  editingItemId,
  setEditingItemId,
  showActiveToggle,
}: {
  title: string;
  items: SpellItem[];
  categoryFilter: "spell" | "ritual";
  onAdd: (item: SpellItem) => void;
  onUpdate: (index: number, field: string, value: string | boolean | DiceModifier[]) => void;
  onRemove: (index: number) => void;
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;
  showActiveToggle: (item: SpellItem) => boolean;
}) {
  const getItemId = (item: SpellItem, index: number) => item.id ?? `legacy-${index}`;

  const groupedByType = SPELL_TYPES.reduce(
    (acc, type) => {
      acc[type] = items.filter((i) => i.type === type);
      return acc;
    },
    {} as Record<SpellType, SpellItem[]>
  );
  const otherItems = items.filter((i) => !SPELL_TYPES.includes(i.type as SpellType));

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display tracking-wider text-sm sm:text-base">{title.toUpperCase()}</CardTitle>
        <MagicReferenceSelect
          category="spells"
          categoryFilter={categoryFilter}
          onSelect={onAdd}
          placeholder={`Search ${title.toLowerCase()}…`}
          triggerLabel={`Add ${title.slice(0, -1)}`}
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No {title.toLowerCase()} yet.</p>
        ) : (
          <>
          {SPELL_TYPES.map((type) => {
            const typeItems = groupedByType[type];
            if (typeItems.length === 0) return null;
            const Icon = TYPE_ICONS[type];
            return (
              <div key={type}>
                <CategoryHeader icon={Icon} label={type} />
                <div className="space-y-2">
                {typeItems.map((item, idx) => {
                  const globalIndex = items.findIndex((i) => i === item);
                  const isEditing = editingItemId === getItemId(item, globalIndex);
                  const showActive = showActiveToggle(item);

                  return (
                    <div
                      key={getItemId(item, globalIndex)}
                      className={cn(
                        isEditing ? "rounded-md bg-muted/20 p-3 space-y-3" : "space-y-1 p-2 rounded-md bg-muted/30",
                        showActive && item.active === false && "opacity-50"
                      )}
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {showActive && (
                              <div className="flex items-center gap-1">
                                <Checkbox
                                  checked={item.active !== false}
                                  onCheckedChange={(c) => onUpdate(globalIndex, "active", !!c)}
                                  aria-label="Active"
                                />
                                <Label className="text-[10px] text-muted-foreground">Active</Label>
                              </div>
                            )}
                            <div className="min-w-[100px] flex-1">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Name</Label>
                              <Input
                                value={item.name ?? ""}
                                onChange={(e) => onUpdate(globalIndex, "name", e.target.value)}
                                className="h-8 text-xs font-mono bg-muted/50 mt-1"
                              />
                            </div>
                            <div className="min-w-[80px]">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Type</Label>
                              <Select value={item.type || ""} onValueChange={(v) => onUpdate(globalIndex, "type", v)}>
                                <SelectTrigger className="h-8 text-xs font-mono bg-muted/50 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SPELL_TYPES.map((t) => (
                                    <SelectItem key={t} value={t} className="text-xs">
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="min-w-[60px] text-center">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Drain</Label>
                              <Input
                                value={item.drain ?? ""}
                                onChange={(e) => onUpdate(globalIndex, "drain", e.target.value)}
                                className="h-8 text-xs font-mono bg-muted/50 mt-1 text-center"
                              />
                            </div>
                            <div className="min-w-[80px]">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Duration</Label>
                              <Input
                                value={item.duration ?? ""}
                                onChange={(e) => onUpdate(globalIndex, "duration", e.target.value)}
                                className="h-8 text-xs font-mono bg-muted/50 mt-1"
                              />
                            </div>
                            <div className={cn("min-w-[80px]", RANGE_DEFINITIONS[item.range] && "cursor-help")}>
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Range</Label>
                              {RANGE_DEFINITIONS[item.range] ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Input
                                      value={item.range ?? ""}
                                      onChange={(e) => onUpdate(globalIndex, "range", e.target.value)}
                                      className="h-8 text-xs font-mono bg-muted/50 mt-1"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[280px] text-xs">
                                    {RANGE_DEFINITIONS[item.range]}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Input
                                  value={item.range ?? ""}
                                  onChange={(e) => onUpdate(globalIndex, "range", e.target.value)}
                                  className="h-8 text-xs font-mono bg-muted/50 mt-1"
                                />
                              )}
                            </div>
                            {item.type === "Combat" && (
                              <div className="min-w-[80px]">
                                <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Damage</Label>
                                <Select value={item.damage_type || ""} onValueChange={(v) => onUpdate(globalIndex, "damage_type", v)}>
                                  <SelectTrigger className="h-8 text-xs font-mono bg-muted/50 mt-1">
                                    <SelectValue placeholder="—" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Direct" className="text-xs">Direct</SelectItem>
                                    <SelectItem value="Indirect" className="text-xs">Indirect</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingItemId(null)}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemove(globalIndex)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="bg-background/30 rounded-md p-3">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                              <Zap className="h-3.5 w-3.5 text-accent-foreground/70" />
                              Effects
                            </Label>
                            <Input
                              value={item.effects ?? ""}
                              onChange={(e) => onUpdate(globalIndex, "effects", e.target.value)}
                              placeholder="e.g. Chemical damage, Corroded status…"
                              className="text-xs font-mono bg-muted/50"
                            />
                          </div>

                          <div className="bg-background/30 rounded-md p-3">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Description</Label>
                            <Textarea
                              value={item.description ?? ""}
                              onChange={(e) => onUpdate(globalIndex, "description", e.target.value)}
                              placeholder="Paste description from the rulebook…"
                              className="text-xs font-mono bg-muted/50 min-h-[60px] resize-y mt-1"
                            />
                          </div>

                          {showActive && item.active !== false && (
                            <div className="bg-background/30 rounded-md p-3">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2 block">
                                Active Effects (Dice Pool Modifiers)
                              </Label>
                              <p className="text-[10px] text-muted-foreground mb-2">
                                Add modifiers when this spell is active (e.g. net hits to DR, REA, etc.)
                              </p>
                              <DiceModifierEditor
                                modifiers={item.dice_modifiers ?? []}
                                onChange={(mods) => onUpdate(globalIndex, "dice_modifiers", mods)}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
                            <div>
                              <p className="font-display font-semibold text-lg">{item.name || "—"}</p>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Drain</span>
                              <p className="font-mono text-sm">{item.drain || "—"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Duration</span>
                              <p className="font-mono text-sm">{item.duration || "—"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Range</span>
                              {RANGE_DEFINITIONS[item.range] ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="font-mono text-sm cursor-help">{item.range || "—"}</p>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-[280px] text-xs">
                                    {RANGE_DEFINITIONS[item.range]}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <p className="font-mono text-sm">{item.range || "—"}</p>
                              )}
                            </div>
                            {item.type === "Combat" && (
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Damage</span>
                                <p className="font-mono text-sm">{item.damage_type || "—"}</p>
                              </div>
                            )}
                            {showActive && (
                              <div>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Active</span>
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={item.active !== false}
                                    onCheckedChange={(c) => onUpdate(globalIndex, "active", !!c)}
                                    aria-label="Active"
                                  />
                                </div>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 ml-auto"
                              onClick={() => setEditingItemId(getItemId(item, globalIndex))}
                              aria-label="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {item.effects && (
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Effects</span>
                              <p className="font-mono text-xs text-muted-foreground">{item.effects}</p>
                            </div>
                          )}
                          {item.description && (
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Description</span>
                              <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            );
          })}
          {otherItems.length > 0 && (
            <div>
              <CategoryHeader icon={Zap} label="Other" />
              <div className="space-y-2">
              {otherItems.map((item, idx) => {
                const globalIndex = items.findIndex((i) => i === item);
                const isEditing = editingItemId === getItemId(item, globalIndex);
                const showActive = showActiveToggle(item);
                return (
                  <div
                    key={getItemId(item, globalIndex)}
                    className={cn(
                      isEditing ? "rounded-md bg-muted/20 p-3 space-y-3" : "space-y-1 p-2 rounded-md bg-muted/30",
                      showActive && item.active === false && "opacity-50"
                    )}
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {showActive && (
                            <div className="flex items-center gap-1">
                              <Checkbox
                                checked={item.active !== false}
                                onCheckedChange={(c) => onUpdate(globalIndex, "active", !!c)}
                                aria-label="Active"
                              />
                              <Label className="text-[10px] text-muted-foreground">Active</Label>
                            </div>
                          )}
                          <div className="min-w-[100px] flex-1">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Name</Label>
                            <Input value={item.name ?? ""} onChange={(e) => onUpdate(globalIndex, "name", e.target.value)} className="h-8 text-xs font-mono bg-muted/50 mt-1" />
                          </div>
                          <div className="min-w-[80px]">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Type</Label>
                            <Select value={item.type || ""} onValueChange={(v) => onUpdate(globalIndex, "type", v)}>
                              <SelectTrigger className="h-8 text-xs font-mono bg-muted/50 mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SPELL_TYPES.map((t) => (
                                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="min-w-[60px] text-center">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Drain</Label>
                            <Input value={item.drain ?? ""} onChange={(e) => onUpdate(globalIndex, "drain", e.target.value)} className="h-8 text-xs font-mono bg-muted/50 mt-1 text-center" />
                          </div>
                          <div className="min-w-[80px]">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Duration</Label>
                            <Input value={item.duration ?? ""} onChange={(e) => onUpdate(globalIndex, "duration", e.target.value)} className="h-8 text-xs font-mono bg-muted/50 mt-1" />
                          </div>
                          <div className={cn("min-w-[80px]", RANGE_DEFINITIONS[item.range] && "cursor-help")}>
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Range</Label>
                            {RANGE_DEFINITIONS[item.range] ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Input value={item.range ?? ""} onChange={(e) => onUpdate(globalIndex, "range", e.target.value)} className="h-8 text-xs font-mono bg-muted/50 mt-1" />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[280px] text-xs">
                                  {RANGE_DEFINITIONS[item.range]}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <Input value={item.range ?? ""} onChange={(e) => onUpdate(globalIndex, "range", e.target.value)} className="h-8 text-xs font-mono bg-muted/50 mt-1" />
                            )}
                          </div>
                          {item.type === "Combat" && (
                            <div className="min-w-[80px]">
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Damage</Label>
                              <Select value={item.damage_type || ""} onValueChange={(v) => onUpdate(globalIndex, "damage_type", v)}>
                                <SelectTrigger className="h-8 text-xs font-mono bg-muted/50 mt-1">
                                  <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Direct" className="text-xs">Direct</SelectItem>
                                  <SelectItem value="Indirect" className="text-xs">Indirect</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingItemId(null)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onRemove(globalIndex)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="bg-background/30 rounded-md p-3">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                            <Zap className="h-3.5 w-3.5 text-accent-foreground/70" />
                            Effects
                          </Label>
                          <Input value={item.effects ?? ""} onChange={(e) => onUpdate(globalIndex, "effects", e.target.value)} placeholder="e.g. Chemical damage, Corroded status…" className="text-xs font-mono bg-muted/50" />
                        </div>
                        <div className="bg-background/30 rounded-md p-3">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Description</Label>
                          <Textarea value={item.description ?? ""} onChange={(e) => onUpdate(globalIndex, "description", e.target.value)} placeholder="Paste description from the rulebook…" className="text-xs font-mono bg-muted/50 min-h-[60px] resize-y mt-1" />
                        </div>
                        {showActive && item.active !== false && (
                          <div className="bg-background/30 rounded-md p-3">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2 block">Active Effects (Dice Pool Modifiers)</Label>
                            <p className="text-[10px] text-muted-foreground mb-2">Add modifiers when this spell is active (e.g. net hits to DR, REA, etc.)</p>
                            <DiceModifierEditor modifiers={item.dice_modifiers ?? []} onChange={(mods) => onUpdate(globalIndex, "dice_modifiers", mods)} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
                          <div>
                            <p className="font-display font-semibold text-lg">{item.name || "—"}</p>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Drain</span>
                            <p className="font-mono text-sm">{item.drain || "—"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Duration</span>
                            <p className="font-mono text-sm">{item.duration || "—"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Range</span>
                            {RANGE_DEFINITIONS[item.range] ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-mono text-sm cursor-help">{item.range || "—"}</p>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[280px] text-xs">
                                  {RANGE_DEFINITIONS[item.range]}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <p className="font-mono text-sm">{item.range || "—"}</p>
                            )}
                          </div>
                          {item.type === "Combat" && (
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Damage</span>
                              <p className="font-mono text-sm">{item.damage_type || "—"}</p>
                            </div>
                          )}
                          {showActive && (
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Active</span>
                              <div className="flex justify-center">
                                <Checkbox checked={item.active !== false} onCheckedChange={(c) => onUpdate(globalIndex, "active", !!c)} aria-label="Active" />
                              </div>
                            </div>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 ml-auto" onClick={() => setEditingItemId(getItemId(item, globalIndex))} aria-label="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {item.effects && (
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Effects</span>
                            <p className="font-mono text-xs text-muted-foreground">{item.effects}</p>
                          </div>
                        )}
                        {item.description && (
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Description</span>
                            <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function SpellcastingTab({
  items,
  onUpdate,
  attributes = {},
  skills = [],
  qualities = [],
  augmentations = [],
  gear = [],
  adeptPowers = [],
  activeSpells = [],
  woundModifier,
  magicTradition,
}: Props) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const spells = items.filter((i) => i.category === "spell");
  const rituals = items.filter((i) => i.category === "ritual");
  const preparations = items.filter((i) => i.category === "preparation");

  const update = (category: "spell" | "ritual", index: number, field: string, value: string | boolean | DiceModifier[]) => {
    const list = category === "spell" ? spells : rituals;
    const updated = [...list];
    updated[index] = { ...updated[index], [field]: value };
    const newSpells = category === "spell" ? updated : spells;
    const newRituals = category === "ritual" ? updated : rituals;
    onUpdate([...newSpells, ...newRituals, ...preparations]);
  };

  const remove = (category: "spell" | "ritual", index: number) => {
    const list = category === "spell" ? spells : rituals;
    const removedId = list[index]?.id;
    const filtered = list.filter((_, i) => i !== index);
    const newSpells = category === "spell" ? filtered : spells;
    const newRituals = category === "ritual" ? filtered : rituals;
    onUpdate([...newSpells, ...newRituals, ...preparations]);
    if (editingItemId === removedId) setEditingItemId(null);
  };

  const addSpell = (item: SpellItem) => {
    const withId = { ...item, id: item.id ?? crypto.randomUUID(), category: "spell" as const };
    onUpdate([...spells, withId, ...rituals, ...preparations]);
    setEditingItemId(withId.id);
  };

  const addRitual = (item: SpellItem) => {
    const withId = { ...item, id: item.id ?? crypto.randomUUID(), category: "ritual" as const };
    onUpdate([...spells, ...rituals, withId, ...preparations]);
    setEditingItemId(withId.id);
  };

  const showActiveForSpell = (item: SpellItem) => item.duration === "Sustained";
  const showActiveForRitual = () => true;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
      <div className="min-w-0 space-y-6">
        <SpellSection
          title="Spells"
          items={spells}
          categoryFilter="spell"
          onAdd={addSpell}
          onUpdate={(i, f, v) => update("spell", i, f, v)}
          onRemove={(i) => remove("spell", i)}
          editingItemId={editingItemId}
          setEditingItemId={setEditingItemId}
          showActiveToggle={showActiveForSpell}
        />
        <SpellSection
          title="Rituals"
          items={rituals}
          categoryFilter="ritual"
          onAdd={addRitual}
          onUpdate={(i, f, v) => update("ritual", i, f, v)}
          onRemove={(i) => remove("ritual", i)}
          editingItemId={editingItemId}
          setEditingItemId={setEditingItemId}
          showActiveToggle={showActiveForRitual}
        />
      </div>
      <aside className="lg:sticky lg:top-14 lg:self-start min-w-0">
        <SpellcastingInfoColumn
          attributes={attributes}
          skills={skills}
          qualities={qualities}
          augmentations={augmentations}
          gear={gear}
          adeptPowers={adeptPowers}
          activeSpells={activeSpells}
          woundModifier={woundModifier}
          magicTradition={magicTradition}
          items={items}
        />
      </aside>
    </div>
  );
}
