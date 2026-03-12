import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DicePoolBreakdown } from "@/types/character";

const ATTR_ABBREV: Record<string, string> = {
  body: "BOD", agility: "AGI", reaction: "REA", strength: "STR", willpower: "WIL",
  logic: "LOG", intuition: "INT", charisma: "CHA", edge: "EDG", essence: "ESS",
  magic: "MAG", resonance: "RES",
};

function BreakdownContent({ pool }: { pool: DicePoolBreakdown }) {
  const attrLabel = ATTR_ABBREV[pool.attribute_name] ?? pool.attribute_name.slice(0, 3).toUpperCase();
  return (
    <div className="space-y-0.5 text-xs font-mono min-w-[180px]">
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Attribute ({attrLabel})</span>
        <span className="text-primary">+{pool.attribute_value}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Skill Rating</span>
        <span className="text-primary">+{pool.skill_rating}</span>
      </div>
      {pool.modifiers.map((mod, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span className="text-muted-foreground">{mod.source}</span>
          <span className={mod.value >= 0 ? "text-neon-green" : "text-destructive"}>
            {mod.value >= 0 ? "+" : ""}{mod.value}
          </span>
        </div>
      ))}
      <div className="flex justify-between gap-4 border-t border-border pt-1 mt-1 font-bold">
        <span>Total</span>
        <span className="text-primary neon-glow-cyan">{pool.total}d6</span>
      </div>
    </div>
  );
}

export function DicePoolDisplay({ pool, className }: { pool: DicePoolBreakdown; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className ?? "font-mono text-sm font-bold text-primary neon-glow-cyan cursor-help"}>
          {pool.total}d6
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="p-2">
        <BreakdownContent pool={pool} />
      </TooltipContent>
    </Tooltip>
  );
}
