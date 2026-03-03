import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Minus, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { PRIORITY_TABLE, METATYPE_DATA, BASE_ATTRIBUTES, type PriorityLevel } from "@/data/sr6-reference";
import type { WizardState } from "@/pages/CharacterWizard";
import type { SR6Attributes } from "@/types/character";

const ATTRIBUTE_DESCRIPTIONS: Record<string, string> = {
  body: "Physical toughness, health, and resistance to damage.",
  agility: "Fine motor skills, coordination, and physical precision.",
  reaction: "Response time, reflexes, and ability to react quickly.",
  strength: "Raw physical power and carrying capacity.",
  willpower: "Mental resilience, discipline, and resistance to magic.",
  logic: "Reasoning, memory, and analytical thinking.",
  intuition: "Gut feelings, perception, and awareness.",
  charisma: "Force of personality, social influence, and leadership.",
  edge: "Luck, narrative favor, and the X-factor.",
};


interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step3Attributes({ state, onChange }: Props) {
  const attrPriority = state.priorities.attributes as PriorityLevel;
  const totalPoints = PRIORITY_TABLE[attrPriority].attributes;
  const mtData = METATYPE_DATA[state.metatype || "Human"];
  const { attributes, adjustmentPoints } = state;

  // Budget: every click above base 1 costs 1 attribute point (adj points are free)
  const spentPoints = BASE_ATTRIBUTES.reduce((sum, attr) => {
    return sum + Math.max(0, (attributes[attr] || 1) - 1);
  }, 0);

  const remaining = totalPoints - spentPoints;

  // At-max detection uses effective total (raw + adj) vs metatype max
  const atMaxCount = BASE_ATTRIBUTES.filter((attr) => {
    const adj = adjustmentPoints[attr] || 0;
    const effectiveTotal = (attributes[attr] || 1) + adj;
    const max = mtData.attributes[attr][1];
    return effectiveTotal >= max;
  }).length;

  const adjustAttr = (attr: keyof SR6Attributes, delta: number) => {
    const current = attributes[attr] || 1;
    const newVal = current + delta;
    const adj = adjustmentPoints[attr as keyof typeof adjustmentPoints] || 0;
    const min = 1;
    const max = mtData.attributes[attr as keyof typeof mtData.attributes]?.[1] ?? 6;
    // Raw max: metatype_max - adj (so effective total won't exceed metatype max)
    const rawMax = max - adj;
    if (newVal < min || newVal > rawMax) return;
    if (delta > 0 && remaining <= 0) return;
    onChange({ attributes: { ...attributes, [attr]: newVal } });
  };

  // Build summary rows
  const summaryRows = BASE_ATTRIBUTES.map((attr) => {
    const base = 1;
    const adj = adjustmentPoints[attr] || 0;
    const attrPts = Math.max(0, (attributes[attr] || 1) - 1);
    const metaMax = mtData.attributes[attr][1];
    const total = base + adj + attrPts;
    return { name: attr, base, adj, attrPts, total, metaMax };
  });

  const edgeAdj = adjustmentPoints.edge || 0;
  const edgeTotal = edgeAdj + 1;

  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg tracking-wide">Attributes</CardTitle>
            <Badge variant={remaining < 0 ? "destructive" : "outline"} className="font-mono">
              {remaining} / {totalPoints} remaining
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Spend attribute points. All start at 1. Only one attribute may be at metatype maximum.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {remaining < 0 && (
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              You've overspent attribute points.
            </div>
          )}
          {atMaxCount > 1 && (
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Only one attribute should be at metatype maximum at creation.
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {([["body", "agility", "reaction", "strength"], ["willpower", "logic", "intuition", "charisma"]] as const).map((group, gi) => (
              <div key={gi} className="space-y-2">
                {group.map((attr) => {
              const current = attributes[attr] || 1;
              const adj = adjustmentPoints[attr] || 0;
              const [, metaMax] = mtData.attributes[attr];
              const rawMax = metaMax - adj;

              return (
                <div key={attr} className="flex items-center gap-3 py-1">
                  <span className="w-24 font-display text-sm capitalize tracking-wide">{attr}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustAttr(attr, -1)} disabled={current <= 1}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-mono text-lg w-8 text-center">
                    {current}
                  </span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustAttr(attr, 1)} disabled={current >= rawMax || remaining <= 0}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Breakdown Table */}
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm tracking-wide uppercase text-muted-foreground">
            Attribute Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <TooltipProvider delayDuration={200}>
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="h-8 px-2 font-display text-xs tracking-wider">Attribute</TableHead>
                <TableHead className="h-8 px-2 font-mono text-xs text-center">Base</TableHead>
                <TableHead className="h-8 px-2 font-mono text-xs text-center text-muted-foreground">Max</TableHead>
                <TableHead className="h-8 px-2 font-mono text-xs text-center text-cyan-400">Adj. Pts</TableHead>
                <TableHead className="h-8 px-2 font-mono text-xs text-center">Attr. Pts</TableHead>
                <TableHead className="h-8 px-2 font-mono text-xs text-center text-primary font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryRows.map((row) => (
                <TableRow key={row.name} className="border-border/20 hover:bg-muted/30">
                  <TableCell className="py-1.5 px-2 font-display text-sm capitalize tracking-wide">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center gap-1 cursor-help">
                          {row.name} <Info className="h-3 w-3 text-muted-foreground" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right">{ATTRIBUTE_DESCRIPTIONS[row.name]}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-muted-foreground">{row.base}</TableCell>
                  <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-muted-foreground">{row.metaMax}</TableCell>
                  <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-cyan-400">
                    {row.adj > 0 ? `+${row.adj}` : "—"}
                  </TableCell>
                  <TableCell className="py-1.5 px-2 font-mono text-sm text-center">
                    {row.attrPts > 0 ? `+${row.attrPts}` : "—"}
                  </TableCell>
                  <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-primary font-bold">{row.total}</TableCell>
                </TableRow>
              ))}
              {/* Edge row */}
              <TableRow className="border-border/20 border-t border-border/40 hover:bg-muted/30">
                <TableCell className="py-1.5 px-2 font-display text-sm tracking-wide">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1 cursor-help">
                        Edge <Info className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">{ATTRIBUTE_DESCRIPTIONS.edge}</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-muted-foreground">1</TableCell>
                <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-muted-foreground">—</TableCell>
                <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-cyan-400">
                  {edgeAdj > 0 ? `+${edgeAdj}` : "—"}
                </TableCell>
                <TableCell className="py-1.5 px-2 font-mono text-sm text-center">—</TableCell>
                <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-primary font-bold">{edgeTotal}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
