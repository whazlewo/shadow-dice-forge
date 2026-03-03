import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Minus, Plus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRIORITY_TABLE, METATYPE_DATA, BASE_ATTRIBUTES, type PriorityLevel } from "@/data/sr6-reference";
import type { WizardState } from "@/pages/CharacterWizard";
import type { SR6Attributes } from "@/types/character";
import { cn } from "@/lib/utils";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step3Attributes({ state, onChange }: Props) {
  const attrPriority = state.priorities.attributes as PriorityLevel;
  const totalPoints = PRIORITY_TABLE[attrPriority].attributes;
  const mtData = METATYPE_DATA[state.metatype || "Human"];
  const { attributes, adjustmentPoints } = state;

  const spentPoints = BASE_ATTRIBUTES.reduce((sum, attr) => {
    const base = 1;
    const adjBonus = adjustmentPoints[attr] || 0;
    const current = attributes[attr] || 1;
    return sum + Math.max(0, current - base - adjBonus);
  }, 0);

  const remaining = totalPoints - spentPoints;

  const atMaxCount = BASE_ATTRIBUTES.filter((attr) => {
    const max = mtData.attributes[attr][1];
    return (attributes[attr] || 1) >= max;
  }).length;

  const adjustAttr = (attr: keyof SR6Attributes, delta: number) => {
    const current = attributes[attr] || 1;
    const newVal = current + delta;
    const min = mtData.attributes[attr as keyof typeof mtData.attributes]?.[0] ?? 1;
    const max = mtData.attributes[attr as keyof typeof mtData.attributes]?.[1] ?? 6;
    if (newVal < min || newVal > max) return;
    if (delta > 0 && remaining <= 0) return;
    onChange({ attributes: { ...attributes, [attr]: newVal } });
  };

  // Build summary rows for the breakdown table
  const summaryRows = BASE_ATTRIBUTES.map((attr) => {
    const base = 1;
    const adj = adjustmentPoints[attr] || 0;
    const current = attributes[attr] || 1;
    const attrPts = Math.max(0, current - base - adj);
    return { name: attr, base, adj, attrPts, total: current };
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
            {BASE_ATTRIBUTES.map((attr) => {
              const current = attributes[attr] || 1;
              const [min, max] = mtData.attributes[attr];
              const adjBonus = adjustmentPoints[attr] || 0;
              const isAtMax = current >= max;
              const attrPtsSpent = Math.max(0, current - 1 - adjBonus);

              return (
                <div key={attr} className="flex items-center gap-3 py-1">
                  <span className="w-24 font-display text-sm capitalize tracking-wide">{attr}</span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustAttr(attr, -1)} disabled={current <= min}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className={cn(
                    "font-mono text-lg w-8 text-center",
                    isAtMax && "text-primary font-bold"
                  )}>
                    {current}
                  </span>
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => adjustAttr(attr, 1)} disabled={current >= max || remaining <= 0}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono">
                    ({min}–{max})
                    {adjBonus > 0 && <span className="text-cyan-400 ml-1">+{adjBonus} adj</span>}
                    {attrPtsSpent > 0 && <span className="text-primary ml-1">+{attrPtsSpent} pts</span>}
                  </span>
                </div>
              );
            })}
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
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="h-8 px-2 font-display text-xs tracking-wider">Attribute</TableHead>
                <TableHead className="h-8 px-2 font-mono text-xs text-center">Base</TableHead>
                <TableHead className="h-8 px-2 font-mono text-xs text-center text-cyan-400">Adj. Pts</TableHead>
                <TableHead className="h-8 px-2 font-mono text-xs text-center">Attr. Pts</TableHead>
                <TableHead className="h-8 px-2 font-mono text-xs text-center text-primary font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryRows.map((row) => (
                <TableRow key={row.name} className="border-border/20 hover:bg-muted/30">
                  <TableCell className="py-1.5 px-2 font-display text-sm capitalize tracking-wide">{row.name}</TableCell>
                  <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-muted-foreground">{row.base}</TableCell>
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
                <TableCell className="py-1.5 px-2 font-display text-sm tracking-wide">Edge</TableCell>
                <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-muted-foreground">1</TableCell>
                <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-cyan-400">
                  {edgeAdj > 0 ? `+${edgeAdj}` : "—"}
                </TableCell>
                <TableCell className="py-1.5 px-2 font-mono text-sm text-center">—</TableCell>
                <TableCell className="py-1.5 px-2 font-mono text-sm text-center text-primary font-bold">{edgeTotal}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}