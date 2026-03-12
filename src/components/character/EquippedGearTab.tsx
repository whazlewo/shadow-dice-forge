import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Crosshair, Sword, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type {
  SR6RangedWeapon,
  SR6MeleeWeapon,
  SR6Armor,
  SR6Skill,
  SR6Attributes,
  SR6Quality,
  SR6Augmentation,
  SR6Gear,
} from "@/types/character";
import { calculateModifiedAR } from "@/lib/ar-utils";
import { calculateWeaponPool } from "@/lib/dice-pool";
import { normalizeAccessories } from "@/lib/gear-reference-utils";
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
  woundModifier?: number;
}

function StatPill({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string | number;
  tooltip?: string;
}) {
  const content = (
    <div className="flex min-w-[48px] flex-col items-center rounded bg-muted/50 px-2 py-1 text-foreground">
      <span className="flex items-center gap-0.5 text-[10px] uppercase tracking-widest opacity-70">
        {label}
        {tooltip && !tooltip.includes("\n") && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-2.5 w-2.5 cursor-help opacity-60" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      <span className="font-mono text-sm font-bold">{value}</span>
    </div>
  );

  if (tooltip && tooltip.includes("\n")) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px] whitespace-pre font-mono text-xs">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

function accessoriesToARModifiers(weapon: {
  accessories?: string | { name: string; ar_modifier?: string }[];
}): { source: string; values: string }[] {
  const accs = normalizeAccessories(weapon.accessories);
  return accs
    .filter((a) => a.ar_modifier && a.ar_modifier.trim())
    .map((a) => ({ source: a.name || "Accessory", values: a.ar_modifier! }));
}

function arTooltip(weapon: {
  ar: string;
  accessories?: string | { name: string; ar_modifier?: string }[];
}): string | undefined {
  const mods = accessoriesToARModifiers(weapon);
  if (mods.length === 0) return "Point Blank / Short / Medium / Long / Extreme";
  const { breakdown } = calculateModifiedAR(weapon.ar, mods);
  return breakdown.map((b) => `${b.label.padEnd(12)} ${b.values}`).join("\n");
}

function modifiedAR(weapon: {
  ar: string;
  accessories?: string | { name: string; ar_modifier?: string }[];
}): string {
  const mods = accessoriesToARModifiers(weapon);
  if (mods.length === 0) return weapon.ar || "—";
  return calculateModifiedAR(weapon.ar, mods).modified;
}

function AccessoryBadges({
  accessories,
}: {
  accessories?: string | { name: string; ar_modifier?: string; notes?: string }[];
}) {
  const items = normalizeAccessories(accessories).filter((a) => a.name);
  if (items.length === 0) return null;
  return (
    <TooltipProvider delayDuration={200}>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        {items.map((acc, i) => {
          const arTip = acc.ar_modifier ? `AR: ${acc.ar_modifier}` : "";
          const badge = (
            <Badge
              variant="secondary"
              className="h-4 bg-accent/30 px-1.5 py-0 font-mono text-[10px] text-accent-foreground"
            >
              {acc.name}
            </Badge>
          );
          return (
            <span key={i} className="inline-flex items-center gap-1">
              {arTip ? (
                <Tooltip>
                  <TooltipTrigger asChild>{badge}</TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[260px] text-xs">
                    {arTip}
                  </TooltipContent>
                </Tooltip>
              ) : (
                badge
              )}
              {acc.notes && (
                <span className="font-mono text-[10px] text-muted-foreground">{acc.notes}</span>
              )}
            </span>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function PoolPill({
  skillName,
  subtype,
  weaponAccessories,
  attributes,
  skills,
  qualities,
  augmentations,
  gear,
  woundModifier,
}: {
  skillName: string;
  subtype?: string;
  weaponAccessories?: { name: string }[];
  attributes: SR6Attributes;
  skills: SR6Skill[];
  qualities: SR6Quality[];
  augmentations: SR6Augmentation[];
  gear: SR6Gear[];
  woundModifier?: number;
}) {
  const pool = calculateWeaponPool(
    skillName,
    subtype,
    attributes,
    skills,
    qualities,
    augmentations,
    gear,
    weaponAccessories,
    woundModifier
  );
  const lines = [
    `${pool.attribute_name.charAt(0).toUpperCase() + pool.attribute_name.slice(1).padEnd(14)} ${pool.attribute_value}`,
    `${pool.skill_name.padEnd(15)} ${pool.skill_rating}`,
    ...pool.modifiers.map((m) => `${m.source.padEnd(15)} ${m.value >= 0 ? "+" : ""}${m.value}`),
    `${"Total".padEnd(15)} ${pool.total}d6`,
  ].join("\n");

  return <StatPill label="Pool" value={`${pool.total}d6`} tooltip={lines} />;
}

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

export function EquippedGearTab({
  rangedWeapons,
  meleeWeapons,
  armor,
  skills,
  attributes,
  qualities,
  augmentations,
  gear,
  woundModifier,
}: Props) {
  const equippedRanged = rangedWeapons.filter((w) => w.equipped !== false);
  const equippedMelee = meleeWeapons.filter((w) => w.equipped !== false);
  const equippedArmor = armor.filter((a) => a.equipped !== false);

  const hasNothing =
    equippedRanged.length === 0 && equippedMelee.length === 0 && equippedArmor.length === 0;

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider text-sm sm:text-base">EQUIPPED WEAPONS &amp; ARMOR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasNothing && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No equipped items. Add and equip items in the Weapons &amp; Gear tab.
          </p>
        )}

        {equippedRanged.length > 0 && (
          <>
            <CategoryHeader icon={Crosshair} label="Ranged Weapons" />
            {equippedRanged.map((w) => (
              <div
                key={w.id}
                className="space-y-1.5 rounded-r-md border-l-2 border-primary bg-muted/20 py-2 pl-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-sm font-semibold tracking-wide text-foreground">
                    {w.name || "Unnamed"}
                  </span>
                  {w.subtype && (
                    <Badge
                      variant="outline"
                      className="h-4 px-1.5 py-0 font-mono text-[9px] opacity-60"
                    >
                      {w.subtype}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  <StatPill label="DV" value={w.dv || "—"} />
                  <StatPill label="AR" value={modifiedAR(w)} tooltip={arTooltip(w)} />
                  <FireModeBadges modes={w.fire_modes || ""} />
                  <StatPill label="Ammo" value={w.ammo || "—"} />
                  <PoolPill
                    skillName="Firearms"
                    subtype={w.subtype}
                    weaponAccessories={normalizeAccessories(w.accessories)}
                    attributes={attributes}
                    skills={skills}
                    qualities={qualities}
                    augmentations={augmentations}
                    gear={gear}
                    woundModifier={woundModifier}
                  />
                </div>
                <AccessoryBadges accessories={w.accessories} />
                {w.notes && (
                  <p className="whitespace-pre-wrap text-[10px] leading-relaxed text-muted-foreground">
                    {w.notes}
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        {equippedMelee.length > 0 && (
          <>
            <CategoryHeader icon={Sword} label="Melee Weapons" />
            {equippedMelee.map((w) => (
              <div
                key={w.id}
                className="space-y-1.5 rounded-r-md border-l-2 border-secondary bg-muted/20 py-2 pl-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-sm font-semibold tracking-wide text-foreground">
                    {w.name || "Unnamed"}
                  </span>
                  {w.subtype && (
                    <Badge
                      variant="outline"
                      className="h-4 px-1.5 py-0 font-mono text-[9px] opacity-60"
                    >
                      {w.subtype}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  <StatPill label="DV" value={w.dv || "—"} />
                  <StatPill label="AR" value={modifiedAR(w)} tooltip={arTooltip(w)} />
                  <StatPill label="Reach" value={w.reach ?? "—"} />
                  <PoolPill
                    skillName={w.subtype === "Exotic" ? "Exotic Weapons" : "Close Combat"}
                    subtype={w.subtype}
                    weaponAccessories={normalizeAccessories(w.accessories)}
                    attributes={attributes}
                    skills={skills}
                    qualities={qualities}
                    augmentations={augmentations}
                    gear={gear}
                    woundModifier={woundModifier}
                  />
                </div>
                <AccessoryBadges accessories={w.accessories} />
                {w.notes && (
                  <p className="whitespace-pre-wrap text-[10px] leading-relaxed text-muted-foreground">
                    {w.notes}
                  </p>
                )}
              </div>
            ))}
          </>
        )}

        {equippedArmor.length > 0 && (
          <>
            <CategoryHeader icon={Shield} label="Armor" />
            {equippedArmor.map((a) => (
              <div
                key={a.id}
                className="space-y-1.5 rounded-r-md border-l-2 border-[hsl(var(--neon-green))] bg-muted/20 py-2 pl-3"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-sm font-semibold tracking-wide text-foreground">
                    {a.name || "Unnamed"}
                  </span>
                  {a.subtype && (
                    <Badge
                      variant="outline"
                      className="h-4 px-1.5 py-0 font-mono text-[9px] opacity-60"
                    >
                      {a.subtype}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  <StatPill label="DR" value={a.rating ?? "—"} />
                  <StatPill label="Cap" value={a.capacity ?? "—"} />
                </div>
                {a.modifications && (
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {a.modifications}
                  </p>
                )}
                {a.notes && (
                  <p className="whitespace-pre-wrap text-[10px] leading-relaxed text-muted-foreground">
                    {a.notes}
                  </p>
                )}
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
