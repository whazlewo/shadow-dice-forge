import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  computePhysicalBoxes,
  computeStunBoxes,
  computeOverflowBoxes,
  computeWoundModifier,
  isUnconscious,
  isDead,
} from "@/lib/condition-monitor";
import type { ConditionMonitor, SR6Attributes, SR6Quality } from "@/types/character";

const DEFAULT_CM: ConditionMonitor = {
  physical_damage: 0,
  stun_damage: 0,
  overflow_damage: 0,
};

interface DamageTrackProps {
  label: string;
  damage: number;
  totalBoxes: number;
  onDamageChange: (damage: number) => void;
  variant: "physical" | "stun";
}

function DamageTrack({ label, damage, totalBoxes, onDamageChange, variant }: DamageTrackProps) {
  const filled = Math.min(damage, totalBoxes);
  const rows: number[][] = [];
  for (let i = 0; i < totalBoxes; i += 3) {
    rows.push([i, i + 1, i + 2].filter((idx) => idx < totalBoxes));
  }
  const rowPenalty = (rowIndex: number) => -1 - rowIndex;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-display text-xs tracking-wide text-muted-foreground">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {filled}/{totalBoxes}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-1">
            <span
              className="font-mono text-[10px] text-destructive min-w-[1.5rem] text-right"
              aria-hidden
            >
              {rowPenalty(rowIdx)}
            </span>
            <div className="flex gap-0.5">
              {row.map((boxIdx) => {
                const isFilled = boxIdx < filled;
                return (
                  <button
                    key={boxIdx}
                    type="button"
                    role="checkbox"
                    aria-checked={isFilled}
                    aria-label={`Box ${boxIdx + 1}, ${isFilled ? "filled" : "empty"}`}
                    className={cn(
                      "h-6 w-6 min-w-[24px] rounded-sm border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      variant === "physical"
                        ? isFilled
                          ? "border-destructive bg-destructive/80"
                          : "border-border bg-muted/30 hover:bg-muted/50"
                        : isFilled
                          ? "border-amber-500/80 bg-amber-500/60"
                          : "border-border bg-muted/30 hover:bg-muted/50"
                    )}
                    onClick={() => {
                      const newFilled = isFilled ? Math.max(0, filled - 1) : Math.min(totalBoxes, filled + 1);
                      onDamageChange(newFilled);
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  conditionMonitor: ConditionMonitor | null | undefined;
  attributes: SR6Attributes;
  qualities: SR6Quality[];
  metatype?: string;
  onUpdate: (cm: ConditionMonitor) => void;
}

export function ConditionMonitorTab({ conditionMonitor, attributes, qualities, metatype, onUpdate }: Props) {
  const cm = conditionMonitor || DEFAULT_CM;
  const body = Number(attributes.body) || 0;
  const willpower = Number(attributes.willpower) || 0;

  const physicalBoxes = computePhysicalBoxes(body);
  const stunBoxes = computeStunBoxes(willpower);
  const overflowBoxes = computeOverflowBoxes(body, qualities || [], metatype);
  const woundMod = computeWoundModifier(cm.physical_damage, cm.stun_damage);
  const unconscious = isUnconscious(cm.physical_damage, cm.stun_damage, physicalBoxes, stunBoxes);
  const dead = isDead(cm.overflow_damage, overflowBoxes);

  const handlePhysicalChange = (d: number) =>
    onUpdate({ ...cm, physical_damage: Math.max(0, Math.min(physicalBoxes, d)) });
  const handleStunChange = (d: number) =>
    onUpdate({ ...cm, stun_damage: Math.max(0, Math.min(stunBoxes, d)) });
  const handleOverflowChange = (d: number) =>
    onUpdate({ ...cm, overflow_damage: Math.max(0, Math.min(overflowBoxes, d)) });

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display tracking-wider text-sm sm:text-base">CONDITION MONITOR</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" className="font-mono text-xs whitespace-pre-line max-w-[240px]">
              {`–1 dice pool per 3 boxes filled (cumulative).
Does not apply to Damage Resistance tests.`}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <DamageTrack
            label="Physical"
            damage={cm.physical_damage}
            totalBoxes={physicalBoxes}
            onDamageChange={handlePhysicalChange}
            variant="physical"
          />
          <DamageTrack
            label="Stun"
            damage={cm.stun_damage}
            totalBoxes={stunBoxes}
            onDamageChange={handleStunChange}
            variant="stun"
          />
        </div>

        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs tracking-wide text-muted-foreground">Overflow</span>
            <span className="font-mono text-xs text-muted-foreground">
              {cm.overflow_damage}/{overflowBoxes}
              {dead && (
                <span className="ml-2 text-destructive font-semibold">DEAD</span>
              )}
            </span>
          </div>
          <div className="flex gap-0.5 flex-wrap">
            {Array.from({ length: overflowBoxes }, (_, i) => {
              const isFilled = i < cm.overflow_damage;
              return (
                <button
                  key={i}
                  type="button"
                  role="checkbox"
                  aria-checked={isFilled}
                  aria-label={`Overflow box ${i + 1}, ${isFilled ? "filled" : "empty"}`}
                  className={cn(
                    "h-5 w-5 min-w-[20px] rounded-sm border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isFilled
                      ? "border-destructive bg-destructive/80"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  )}
                  onClick={() => handleOverflowChange(isFilled ? cm.overflow_damage - 1 : cm.overflow_damage + 1)}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 text-xs font-mono">
          <span className={cn(woundMod < 0 && "text-destructive")}>
            Wound modifier: {woundMod >= 0 ? "+0" : woundMod}
          </span>
          {unconscious && (
            <span className="text-amber-600 font-semibold">UNCONSCIOUS</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
