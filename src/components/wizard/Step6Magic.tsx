import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Trash2 } from "lucide-react";
import { PRIORITY_TABLE, type PriorityLevel } from "@/data/sr6-reference";
import { MagicReferenceSelect } from "@/components/MagicReferenceSelect";
import { getMysticAdeptSpellSlots } from "@/lib/magic-reference-utils";
import type { WizardState } from "@/pages/CharacterWizard";
import type { SR6Spell, SR6AdeptPower } from "@/types/character";
import { cn } from "@/lib/utils";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step6Magic({ state, onChange }: Props) {
  const magicPriority = state.priorities.magic_resonance as PriorityLevel | undefined;
  if (!magicPriority) {
    return <p className="text-sm text-muted-foreground">Please assign a Magic/Resonance priority first.</p>;
  }

  const options = PRIORITY_TABLE[magicPriority].magic_resonance;
  const selected = options.find((o) => o.type === state.magicChoice);
  const magic = selected?.magicOrResonance ?? 0;

  const mysticAdeptPP = state.mysticAdeptPowerPoints ?? 0;
  const karmaSpendPowerPoints = state.karmaSpendPowerPoints ?? 0;
  const spellSlots = getMysticAdeptSpellSlots(magic, mysticAdeptPP);
  const adeptPPBudget =
    state.magicChoice === "mystic_adept"
      ? mysticAdeptPP + karmaSpendPowerPoints
      : state.magicChoice === "adept"
        ? magic
        : 0;
  const spellCount = state.magicChoice === "full" || state.magicChoice === "aspected"
    ? magic * 2
    : state.magicChoice === "mystic_adept"
      ? spellSlots
      : 0;
  const complexFormCount = state.magicChoice === "technomancer" ? magic * 2 : 0;

  const selectedSpells = state.selectedSpells ?? [];
  const selectedAdeptPowers = state.selectedAdeptPowers ?? [];
  const selectedComplexForms = state.selectedComplexForms ?? [];

  const adeptPPSpent = selectedAdeptPowers.reduce((sum, p) => sum + p.pp_cost, 0);

  const addSpell = (spell: SR6Spell) => {
    if (selectedSpells.length >= spellCount) return;
    onChange({ selectedSpells: [...selectedSpells, spell] });
  };

  const removeSpell = (index: number) => {
    onChange({ selectedSpells: selectedSpells.filter((_, i) => i !== index) });
  };

  const addAdeptPower = (power: SR6AdeptPower) => {
    if (adeptPPSpent + power.pp_cost > adeptPPBudget) return;
    onChange({ selectedAdeptPowers: [...selectedAdeptPowers, power] });
  };

  const removeAdeptPower = (index: number) => {
    onChange({ selectedAdeptPowers: selectedAdeptPowers.filter((_, i) => i !== index) });
  };

  const addComplexForm = (form: SR6Spell) => {
    if (selectedComplexForms.length >= complexFormCount) return;
    onChange({ selectedComplexForms: [...selectedComplexForms, form] });
  };

  const removeComplexForm = (index: number) => {
    onChange({ selectedComplexForms: selectedComplexForms.filter((_, i) => i !== index) });
  };

  const isSpellcaster = state.magicChoice === "full" || state.magicChoice === "aspected" || state.magicChoice === "mystic_adept";
  const isAdept = state.magicChoice === "adept" || state.magicChoice === "mystic_adept";
  const isTechnomancer = state.magicChoice === "technomancer";

  return (
    <div className="space-y-6">
      {/* Mystic Adept: PP allocation */}
      {state.magicChoice === "mystic_adept" && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg tracking-wide">Allocate Power Points</CardTitle>
            <p className="text-sm text-muted-foreground">
              Split your Magic {magic} between Power Points (adept powers) and Spells. Remaining Magic × 2 = spell slots.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <Label>Power Points for Adept Powers</Label>
                <span className="font-mono">{mysticAdeptPP} PP</span>
              </div>
              <Slider
                value={[mysticAdeptPP]}
                onValueChange={([v]) => onChange({ mysticAdeptPowerPoints: v })}
                min={0}
                max={magic}
                step={0.25}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono">
                {spellSlots} Spell slots
              </Badge>
              <Badge variant="outline" className="font-mono">
                {mysticAdeptPP} Power Points
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adept Powers */}
      {(state.magicChoice === "adept" || state.magicChoice === "mystic_adept") && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg tracking-wide">Adept Powers</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select powers (PP spent: {adeptPPSpent.toFixed(2)} / {adeptPPBudget})
              </p>
            </div>
            <MagicReferenceSelect
              category="adeptPowers"
              onSelect={addAdeptPower}
              placeholder="Search adept powers…"
              triggerLabel="Add power"
            />
          </CardHeader>
          <CardContent>
            {selectedAdeptPowers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No adept powers selected yet.</p>
            ) : (
              <ul className="space-y-2">
                {selectedAdeptPowers.map((p, i) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                  >
                    <div>
                      <span className="font-mono text-sm">{p.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">({p.pp_cost} PP)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeAdeptPower(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spells */}
      {isSpellcaster && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg tracking-wide">Spells</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select {spellCount} spell{spellCount !== 1 ? "s" : ""} ({selectedSpells.length} / {spellCount})
              </p>
            </div>
            <MagicReferenceSelect
              category="spells"
              onSelect={addSpell}
              placeholder="Search spells…"
              triggerLabel="Add spell"
            />
          </CardHeader>
          <CardContent>
            {selectedSpells.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No spells selected yet.</p>
            ) : (
              <ul className="space-y-2">
                {selectedSpells.map((s, i) => (
                  <li
                    key={s.id}
                    className={cn(
                      "flex items-center justify-between rounded-md px-3 py-2",
                      selectedSpells.length > spellCount ? "bg-destructive/20" : "bg-muted/40"
                    )}
                  >
                    <div>
                      <span className="font-mono text-sm">{s.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {s.type} · {s.drain}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeSpell(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Complex Forms */}
      {isTechnomancer && (
        <Card className="border-border/50 bg-card/80">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-lg tracking-wide">Complex Forms</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select {complexFormCount} complex form{complexFormCount !== 1 ? "s" : ""} ({selectedComplexForms.length} / {complexFormCount})
              </p>
            </div>
            <MagicReferenceSelect
              category="complexForms"
              onSelect={addComplexForm}
              placeholder="Search complex forms…"
              triggerLabel="Add complex form"
            />
          </CardHeader>
          <CardContent>
            {selectedComplexForms.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No complex forms selected yet.</p>
            ) : (
              <ul className="space-y-2">
                {selectedComplexForms.map((s, i) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                  >
                    <div>
                      <span className="font-mono text-sm">{s.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">Fade: {s.drain}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => removeComplexForm(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
