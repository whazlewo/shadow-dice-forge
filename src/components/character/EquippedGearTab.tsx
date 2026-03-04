import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Crosshair, Sword, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { SR6RangedWeapon, SR6MeleeWeapon, SR6Armor, SR6Skill, SR6Attributes, SR6Quality, SR6Augmentation, SR6Gear } from "@/types/character";
import { calculateModifiedAR } from "@/lib/ar-utils";
import { calculateWeaponPool } from "@/lib/dice-pool";
import { FireModeBadges } from "./FireModes";

interface Props {
  rangedWeapons: SR6RangedWeapon[];
  meleeWeapons: SR6MeleeWeapon[];
  armor: SR6Armor[];
  skills: SR6Skill[];
  attributes: SR6Attributes;
  qualities: SR6Quality[];
  augmentations: SR6Augmentation[];
  gear: SR6Gear[];
}

function StatPill({ label, value, tooltip }: { label: string; value: string | number; tooltip?: string }) {
  const content = (
    <div className="flex flex-col items-center bg-muted/50 rounded px-2 py-1 min-w-[48px]">
      <span className="text-[9px] text-muted-foreground uppercase tracking-widest flex items-center gap-0.5">
        {label}
        {tooltip && !tooltip.includes("\n") && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-2.5 w-2.5 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[200px]">{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <span className="text-xs font-mono font-bold text-foreground">{value}</span>
    </div>
  );

  if (tooltip && tooltip.includes("\n")) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top" className="text-xs max-w-[280px] whitespace-pre font-mono">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

function accessoriesToARModifiers(weapon: { accessories?: { name: string; ar_modifier?: string }[] }): { source: string; values: string }[] {
  return (weapon.accessories || [])
    .filter((a) => a.ar_modifier && a.ar_modifier.trim())
    .map((a) => ({ source: a.name || "Accessory", values: a.ar_modifier! }));
}

function arTooltip(weapon: { ar: string; accessories?: { name: string; ar_modifier?: string }[] }): string | undefined {
  const mods = accessoriesToARModifiers(weapon);
  if (mods.length === 0) return "Point Blank / Short / Medium / Long / Extreme";
  const { breakdown } = calculateModifiedAR(weapon.ar, mods);
  return breakdown.map((b) => `${b.label.padEnd(12)} ${b.values}`).join("\n");
}

function modifiedAR(weapon: { ar: string; accessories?: { name: string; ar_modifier?: string }[] }): string {
  const mods = accessoriesToARModifiers(weapon);
  if (mods.length === 0) return weapon.ar || "—";
  return calculateModifiedAR(weapon.ar, mods).modified;
}

function AccessoryBadges({ accessories }: { accessories?: { name: string; ar_modifier?: string; notes?: string }[] }) {
  const items = (accessories || []).filter((a) => a.name);
  if (items.length === 0) return null;
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap gap-1 mt-1">
        {items.map((acc, i) => {
          const details: string[] = [];
          if (acc.ar_modifier) details.push(`AR: ${acc.ar_modifier}`);
          if (acc.notes) details.push(acc.notes);
          const tip = details.join(" · ");
          const badge = (
            <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0 h-4 bg-accent/30 text-accent-foreground">
              {acc.name}
            </Badge>
          );
          return tip ? (
            <Tooltip key={i}>
              <TooltipTrigger asChild>{badge}</TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-[260px]">{tip}</TooltipContent>
            </Tooltip>
          ) : (
            <span key={i}>{badge}</span>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function PoolPill({ skillName, subtype, weaponAccessories, attributes, skills, qualities, augmentations, gear }: {
  skillName: string;
  subtype?: string;
  weaponAccessories?: { name: string }[];
  attributes: SR6Attributes;
  skills: SR6Skill[];
  qualities: SR6Quality[];
  augmentations: SR6Augmentation[];
  gear: SR6Gear[];
}) {
  const pool = calculateWeaponPool(skillName, subtype, attributes, skills, qualities, augmentations, gear, weaponAccessories);
  const lines = [
    `${pool.attribute_name.charAt(0).toUpperCase() + pool.attribute_name.slice(1).padEnd(14)} ${pool.attribute_value}`,
    `${pool.skill_name.padEnd(15)} ${pool.skill_rating}`,
    ...pool.modifiers.map((m) => `${m.source.padEnd(15)} ${m.value >= 0 ? "+" : ""}${m.value}`),
    `${"Total".padEnd(15)} ${pool.total}d6`,
  ].join("\n");

  return <StatPill label="Pool" value={`${pool.total}d6`} tooltip={lines} />;
}

export function EquippedGearTab({ rangedWeapons, meleeWeapons, armor, skills, attributes, qualities, augmentations, gear }: Props) {
  const equippedRanged = rangedWeapons.filter((w) => w.equipped !== false);
  const equippedMelee = meleeWeapons.filter((w) => w.equipped !== false);
  const equippedArmor = armor.filter((a) => a.equipped !== false);

  const hasNothing = equippedRanged.length === 0 && equippedMelee.length === 0 && equippedArmor.length === 0;

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider">EQUIPPED WEAPONS &amp; ARMOR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasNothing && (
          <p className="text-muted-foreground text-sm text-center py-6">No equipped items. Add and equip items in the Weapons &amp; Gear tab.</p>
        )}

        {equippedRanged.map((w) => (
          <div key={w.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 rounded-md bg-muted/30">
            <div className="flex items-start gap-2">
              <Crosshair className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-display tracking-wide truncate">{w.name || "Unnamed"}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <StatPill label="DV" value={w.dv || "—"} />
                  <StatPill label="AR" value={modifiedAR(w)} tooltip={arTooltip(w)} />
                  <FireModeBadges modes={w.fire_modes || ""} />
                  <StatPill label="Ammo" value={w.ammo || "—"} />
                  <PoolPill skillName="Firearms" subtype={w.subtype} weaponAccessories={w.accessories} attributes={attributes} skills={skills} qualities={qualities} augmentations={augmentations} gear={gear} />
                </div>
                <AccessoryBadges accessories={w.accessories} />
              </div>
            </div>
            {w.description && <p className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{w.description}</p>}
          </div>
        ))}

        {equippedMelee.map((w) => (
          <div key={w.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 rounded-md bg-muted/30">
            <div className="flex items-start gap-2">
              <Sword className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-display tracking-wide truncate">{w.name || "Unnamed"}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <StatPill label="DV" value={w.dv || "—"} />
                  <StatPill label="AR" value={modifiedAR(w)} tooltip={arTooltip(w)} />
                  <StatPill label="Reach" value={w.reach ?? "—"} />
                  <PoolPill skillName="Close Combat" subtype={w.subtype} weaponAccessories={w.accessories} attributes={attributes} skills={skills} qualities={qualities} augmentations={augmentations} gear={gear} />
                </div>
                <AccessoryBadges accessories={w.accessories} />
              </div>
            </div>
            {w.description && <p className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{w.description}</p>}
          </div>
        ))}

        {equippedArmor.map((a) => (
          <div key={a.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 rounded-md bg-muted/30">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-display tracking-wide truncate">{a.name || "Unnamed"}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <StatPill label="DR" value={a.rating ?? "—"} />
                  <StatPill label="Cap" value={a.capacity ?? "—"} />
                  {a.subtype && <StatPill label="Type" value={a.subtype} />}
                </div>
                {a.modifications && (
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono truncate">{a.modifications}</p>
                )}
              </div>
            </div>
            {a.description && <p className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{a.description}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
