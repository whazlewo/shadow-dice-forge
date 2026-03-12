import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { normalizeAccessories } from "@/lib/gear-reference-utils";
import { calculateWeaponPool } from "@/lib/dice-pool";

function accessoriesToARModifiers(weapon: {
  accessories?: string | { name: string; ar_modifier?: string }[];
}): { source: string; values: string }[] {
  const accs = normalizeAccessories(weapon.accessories);
  return accs
    .filter((a) => a.ar_modifier && a.ar_modifier.trim())
    .map((a) => ({ source: a.name || "Accessory", values: a.ar_modifier! }));
}

function modifiedAR(weapon: {
  ar: string;
  accessories?: string | { name: string; ar_modifier?: string }[];
}): string {
  const mods = accessoriesToARModifiers(weapon);
  if (mods.length === 0) return weapon.ar || "—";
  return calculateModifiedAR(weapon.ar, mods).modified;
}

interface Props {
  rangedWeapons: SR6RangedWeapon[];
  meleeWeapons: SR6MeleeWeapon[];
  armor: SR6Armor[];
  skills?: SR6Skill[];
  attributes?: SR6Attributes;
  qualities?: SR6Quality[];
  augmentations?: SR6Augmentation[];
  gear?: SR6Gear[];
  woundModifier?: number;
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
  woundModifier,
}: Props) {
  const equippedRanged = rangedWeapons.filter((w) => w.equipped !== false);
  const equippedMelee = meleeWeapons.filter((w) => w.equipped !== false);
  const equippedArmor = armor.filter((a) => a.equipped !== false);

  const primaryRanged = equippedRanged[0];
  const primaryMelee = equippedMelee[0];
  const primaryBodyArmor = equippedArmor.find((a) => (a.subtype || "body") === "body") ?? equippedArmor[0];

  const hasNothing = !primaryRanged && !primaryMelee && !primaryBodyArmor;

  if (hasNothing) {
    return (
      <Card className="border-border/50 bg-card/80">
        <CardHeader>
          <CardTitle className="font-display tracking-wider">PRIMARY EQUIPMENT</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm py-4 text-center">No primary equipment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider">PRIMARY EQUIPMENT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {primaryBodyArmor && (
          <div className="space-y-1">
            <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
              Primary Armor
            </span>
            <p className="font-mono text-sm">
              {primaryBodyArmor.name} — DR {primaryBodyArmor.rating ?? "—"}
            </p>
          </div>
        )}

        {primaryRanged && (
          <div className="space-y-1">
            <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
              Primary Ranged Weapon
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="font-semibold">{primaryRanged.name}</span>
              <span>DV {primaryRanged.dv || "—"}</span>
              <span>AR {modifiedAR(primaryRanged)}</span>
              {primaryRanged.fire_modes && (
                <span className="text-muted-foreground">{primaryRanged.fire_modes}</span>
              )}
              <span>Ammo {primaryRanged.ammo || "—"}</span>
              {skills.length > 0 && attributes && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary">
                      {calculateWeaponPool(
                        "Firearms",
                        primaryRanged.subtype,
                        attributes,
                        skills,
                        qualities,
                        augmentations,
                        gear,
                        normalizeAccessories(primaryRanged.accessories),
                        woundModifier
                      ).total}d6
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-mono text-xs">
                    Dice pool
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {primaryMelee && (
          <div className="space-y-1">
            <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">
              Primary Melee Weapon
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="font-semibold">{primaryMelee.name}</span>
              <span>DV {primaryMelee.dv || "—"}</span>
              {skills.length > 0 && attributes && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-primary">
                      {calculateWeaponPool(
                        primaryMelee.subtype === "Exotic" ? "Exotic Weapons" : "Close Combat",
                        primaryMelee.subtype,
                        attributes,
                        skills,
                        qualities,
                        augmentations,
                        gear,
                        normalizeAccessories(primaryMelee.accessories),
                        woundModifier
                      ).total}d6
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="font-mono text-xs">
                    Dice pool
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
