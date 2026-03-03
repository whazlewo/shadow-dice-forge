import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Crosshair, Sword } from "lucide-react";
import type { SR6RangedWeapon, SR6MeleeWeapon, SR6Armor } from "@/types/character";

interface Props {
  rangedWeapons: SR6RangedWeapon[];
  meleeWeapons: SR6MeleeWeapon[];
  armor: SR6Armor[];
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center bg-muted/50 rounded px-2 py-1 min-w-[48px]">
      <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className="text-xs font-mono font-bold text-foreground">{value}</span>
    </div>
  );
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

        {/* Ranged Weapons */}
        {equippedRanged.map((w) => (
          <div key={w.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 rounded-md bg-muted/30">
            <div className="flex items-start gap-2">
              <Crosshair className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-display tracking-wide truncate">{w.name || "Unnamed"}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <StatPill label="DV" value={w.dv || "—"} />
                  <StatPill label="AR" value={w.ar || "—"} />
                  <StatPill label="Mode" value={w.fire_modes || "—"} />
                  <StatPill label="Ammo" value={w.ammo || "—"} />
                </div>
              </div>
            </div>
            {w.description && <p className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{w.description}</p>}
          </div>
        ))}

        {/* Melee Weapons */}
        {equippedMelee.map((w) => (
          <div key={w.id} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 rounded-md bg-muted/30">
            <div className="flex items-start gap-2">
              <Sword className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-display tracking-wide truncate">{w.name || "Unnamed"}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <StatPill label="DV" value={w.dv || "—"} />
                  <StatPill label="AR" value={w.ar || "—"} />
                  <StatPill label="Reach" value={w.reach ?? "—"} />
                </div>
              </div>
            </div>
            {w.description && <p className="text-[10px] text-muted-foreground whitespace-pre-wrap leading-relaxed">{w.description}</p>}
          </div>
        ))}

        {/* Armor */}
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
