import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Crosshair, Sword, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SR6RangedWeapon, SR6MeleeWeapon, SR6Armor } from "@/types/character";
import { calculateModifiedAR } from "@/lib/ar-utils";

interface Props {
  rangedWeapons: SR6RangedWeapon[];
  meleeWeapons: SR6MeleeWeapon[];
  armor: SR6Armor[];
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

  // Multi-line tooltip (AR breakdown)
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

function arTooltip(weapon: { ar: string; ar_modifiers?: { source: string; values: string }[] }): string | undefined {
  const mods = weapon.ar_modifiers || [];
  if (mods.length === 0) return "Point Blank / Short / Medium / Long / Extreme";
  const { breakdown } = calculateModifiedAR(weapon.ar, mods);
  return breakdown.map((b) => `${b.label.padEnd(12)} ${b.values}`).join("\n");
}

function modifiedAR(weapon: { ar: string; ar_modifiers?: { source: string; values: string }[] }): string {
  const mods = weapon.ar_modifiers || [];
  if (mods.length === 0) return weapon.ar || "—";
  return calculateModifiedAR(weapon.ar, mods).modified;
}

export function EquippedGearTab({ rangedWeapons, meleeWeapons, armor }: Props) {
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
                  <StatPill label="Mode" value={w.fire_modes || "—"} />
                  <StatPill label="Ammo" value={w.ammo || "—"} />
                </div>
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
                </div>
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
