import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Crosshair, Sword, Sparkles } from "lucide-react";
import type {
  SR6RangedWeapon,
  SR6MeleeWeapon,
  SR6Armor,
  SR6Skill,
  SR6Attributes,
  SR6Quality,
  SR6Augmentation,
  SR6Gear,
  SR6AdeptPower,
} from "@/types/character";
import { calculateModifiedAR } from "@/lib/ar-utils";
import { normalizeAccessories } from "@/lib/gear-reference-utils";
import { calculateWeaponPool } from "@/lib/dice-pool";
import { DicePoolDisplay } from "./DicePoolTooltip";

function accessoriesToARModifiers(weapon: {
  accessories?: string | { name: string; ar_modifier?: string }[];
}): { source: string; values: string }[] {
  const accs = normalizeAccessories(weapon.accessories);
  return accs
    .filter((a) => a.ar_modifier && a.ar_modifier.trim())
    .map((a) => ({ source: a.name || "Accessory", values: a.ar_modifier! }));
}

function arWithBreakdown(weapon: {
  ar: string;
  accessories?: string | { name: string; ar_modifier?: string }[];
}): { modified: string; breakdown: { label: string; values: string }[] } {
  const mods = accessoriesToARModifiers(weapon);
  if (mods.length === 0) {
    return { modified: weapon.ar || "—", breakdown: [{ label: "Base", values: weapon.ar || "—" }] };
  }
  return calculateModifiedAR(weapon.ar, mods);
}

const RANGE_BANDS = ["PB", "S", "M", "L", "E"];

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

function ARDisplay({ weapon }: { weapon: { ar: string; accessories?: string | { name: string; ar_modifier?: string }[] } }) {
  const { modified, breakdown } = arWithBreakdown(weapon);
  const hasModifiers = breakdown.length > 1;

  if (!hasModifiers) {
    return <span>AR {modified}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help underline decoration-dotted underline-offset-2">AR {modified}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="p-2">
        <div className="space-y-0.5 text-xs font-mono min-w-[200px]">
          <div className="flex gap-2 text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">
            <span className="flex-1" />
            {RANGE_BANDS.map((b) => (
              <span key={b} className="w-6 text-center">{b}</span>
            ))}
          </div>
          {breakdown.map((row, i) => {
            const isTotal = i === breakdown.length - 1 && breakdown.length > 2;
            const values = row.values.split("/").map((v) => v.trim());
            return (
              <div
                key={i}
                className={`flex items-center gap-2 ${isTotal ? "border-t border-border pt-1 mt-1 font-bold" : ""}`}
              >
                <span className={`flex-1 truncate ${isTotal ? "" : "text-muted-foreground"}`}>{row.label}</span>
                {values.map((v, vi) => (
                  <span
                    key={vi}
                    className={`w-6 text-center ${
                      isTotal ? "text-primary neon-glow-cyan" : v.startsWith("+") || v.startsWith("-") ? "text-neon-green" : ""
                    }`}
                  >
                    {v}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

type ActiveSpell = { id?: string; name: string; drain?: string; category?: string; [k: string]: unknown };

interface Props {
  rangedWeapons: SR6RangedWeapon[];
  meleeWeapons: SR6MeleeWeapon[];
  armor: SR6Armor[];
  skills?: SR6Skill[];
  attributes?: SR6Attributes;
  qualities?: SR6Quality[];
  augmentations?: SR6Augmentation[];
  gear?: SR6Gear[];
  adeptPowers?: SR6AdeptPower[];
  woundModifier?: number;
  activeSpells?: ActiveSpell[];
}

export function PrimaryEquipmentBlock({
  rangedWeapons,
  meleeWeapons,
  armor,
  skills = [],
  attributes = {} as SR6Attributes,
  qualities = [],
  augmentations = [],
  gear = [],
  adeptPowers = [],
  woundModifier,
  activeSpells = [],
}: Props) {
  const equippedRanged = rangedWeapons.filter((w) => w.equipped !== false);
  const equippedMelee = meleeWeapons.filter((w) => w.equipped !== false);
  const equippedArmor = armor.filter((a) => a.equipped !== false);

  const hasNothing =
    equippedRanged.length === 0 &&
    equippedMelee.length === 0 &&
    equippedArmor.length === 0 &&
    activeSpells.length === 0;

  if (hasNothing) {
    return (
      <Card className="border-border/50 bg-card/80 flex-1 min-h-0 flex flex-col">
        <CardHeader className="shrink-0">
          <CardTitle className="font-display tracking-wider text-sm sm:text-base">READIED EQUIPMENT</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm py-4 text-center">No readied equipment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80 flex-1 min-h-0 flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="font-display tracking-wider text-sm sm:text-base">READIED EQUIPMENT</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-auto space-y-3">
        {equippedArmor.length > 0 && (
          <>
            <CategoryHeader icon={Shield} label="Armor" />
            {equippedArmor.map((a) => (
              <div key={a.id ?? a.name} className="space-y-1 p-2 rounded-md bg-muted/30">
                <p className="font-mono text-sm">
                  {a.name}{a.subtype && a.subtype !== "body" ? ` (${a.subtype})` : ""} — DR {a.rating ?? "—"}
                </p>
              </div>
            ))}
          </>
        )}

        {equippedRanged.length > 0 && (
          <>
            <CategoryHeader icon={Crosshair} label="Ranged Weapons" />
            {equippedRanged.map((weapon) => (
              <div key={weapon.id ?? weapon.name} className="space-y-1 p-2 rounded-md bg-muted/30">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="font-semibold">{weapon.name}</span>
                  <span>DV {weapon.dv || "—"}</span>
                  <ARDisplay weapon={weapon} />
                  {weapon.fire_modes && (
                    <span className="text-muted-foreground">{weapon.fire_modes}</span>
                  )}
                  <span>Ammo {weapon.ammo || "—"}</span>
                  {skills.length > 0 && attributes && (
                    <DicePoolDisplay
                      pool={calculateWeaponPool(
                        "Firearms",
                        weapon.subtype,
                        attributes,
                        skills,
                        qualities,
                        augmentations,
                        gear,
                        normalizeAccessories(weapon.accessories),
                        woundModifier,
                        adeptPowers,
                        activeSpells
                      )}
                      className="text-primary cursor-help"
                    />
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {equippedMelee.length > 0 && (
          <>
            <CategoryHeader icon={Sword} label="Melee Weapons" />
            {equippedMelee.map((weapon) => (
              <div key={weapon.id ?? weapon.name} className="space-y-1 p-2 rounded-md bg-muted/30">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="font-semibold">{weapon.name}</span>
                  <span>DV {weapon.dv || "—"}</span>
                  <ARDisplay weapon={weapon} />
                  {skills.length > 0 && attributes && (
                    <DicePoolDisplay
                      pool={calculateWeaponPool(
                        weapon.subtype === "Exotic" ? "Exotic Weapons" : "Close Combat",
                        weapon.subtype,
                        attributes,
                        skills,
                        qualities,
                        augmentations,
                        gear,
                        normalizeAccessories(weapon.accessories),
                        woundModifier,
                        adeptPowers,
                        activeSpells
                      )}
                      className="text-primary cursor-help"
                    />
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {activeSpells.length > 0 && (
          <>
            <CategoryHeader icon={Sparkles} label="Active Spells" />
            {activeSpells.map((spell) => (
              <div key={spell.id ?? spell.name} className="space-y-1 p-2 rounded-md bg-muted/30">
                <p className="font-mono text-sm">
                  {spell.name}
                  {spell.drain ? ` — Drain ${spell.drain}` : ""}
                </p>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
