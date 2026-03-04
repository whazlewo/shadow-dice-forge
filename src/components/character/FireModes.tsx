import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const FIRE_MODES = [
  { code: "SS", full: "Single Shot", tip: "1 round fired. No change to stats. Precise and ammo-efficient." },
  { code: "SA", full: "Semi-Automatic", tip: "2 rounds fired. DV +1 and AR −2. A quick double-tap." },
  { code: "BF", full: "Burst Fire", tip: "4 rounds fired. DV +2 and AR −4. High impact, harder to control." },
  { code: "FA", full: "Full Auto", tip: "10 rounds fired. DV +3 and AR −6. Absolute devastation, but massive AR penalty." },
] as const;

/** Editable checkboxes for selecting fire modes (used in edit forms) */
export function FireModeCheckboxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const active = new Set(value.split(",").map((s) => s.trim()).filter(Boolean));
  const toggle = (code: string) => {
    const next = new Set(active);
    if (next.has(code)) next.delete(code); else next.add(code);
    onChange(FIRE_MODES.map((m) => m.code).filter((c) => next.has(c)).join(","));
  };
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-3">
        {FIRE_MODES.map((m) => (
          <Tooltip key={m.code}>
            <TooltipTrigger asChild>
              <label className="flex items-center gap-1 cursor-pointer">
                <Checkbox checked={active.has(m.code)} onCheckedChange={() => toggle(m.code)} className="h-3.5 w-3.5" />
                <span className="font-mono text-xs">{m.code}</span>
              </label>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px] text-xs">{m.tip}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

/** Read-only badge display of fire modes (used in equipped gear view) */
export function FireModeBadges({ modes }: { modes: string }) {
  const codes = modes.split(",").map((s) => s.trim()).filter(Boolean);
  if (codes.length === 0) return null;
  return (
    <div className="flex flex-col items-center bg-muted/50 rounded px-2 py-1 min-w-[48px]">
      <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Mode</span>
      <TooltipProvider delayDuration={200}>
        <div className="flex gap-0.5 mt-0.5">
          {codes.map((code) => {
            const info = FIRE_MODES.find((m) => m.code === code);
            return info ? (
              <Tooltip key={code}>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4 border-primary/30 text-primary">
                      {code}
                    </Badge>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-[250px]">
                  <span className="font-bold">{info.full}:</span> {info.tip}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Badge key={code} variant="outline" className="text-[10px] font-mono px-1.5 py-0 h-4 border-primary/30 text-primary">
                {code}
              </Badge>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
