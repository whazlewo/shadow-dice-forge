import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SR6Quality } from "@/types/character";

interface Props {
  qualities: SR6Quality[];
}

export function QualitiesTab({ qualities }: Props) {
  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider">QUALITIES</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {qualities.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">No qualities added yet.</p>
        )}
        {qualities.map((q) => (
          <div key={q.id} className="space-y-1 p-2 rounded-md bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge
                variant={q.type === "positive" ? "default" : "secondary"}
                className="w-24 justify-center text-[10px]"
              >
                {q.type === "positive" ? "Positive" : "Negative"}
              </Badge>
              <span className="font-display text-xs">{q.name || "—"}</span>
            </div>
            <div className="text-xs text-muted-foreground pl-0">
              {q.effects || "—"}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
