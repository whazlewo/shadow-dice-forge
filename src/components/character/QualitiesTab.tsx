import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CirclePlus, CircleMinus, Trash2 } from "lucide-react";
import { QualityReferenceSelect } from "@/components/QualityReferenceSelect";
import type { SR6Quality } from "@/types/character";

function CategoryHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-1 pt-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function QualityItem({
  q,
  onRemove,
}: {
  q: SR6Quality;
  onRemove?: () => void;
}) {
  return (
    <div className="space-y-1 p-2 rounded-md bg-muted/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-display text-xs">{q.name || "—"}</span>
          <span className="text-[10px] text-muted-foreground font-mono shrink-0">
            {q.karma_cost > 0 ? "+" : ""}{q.karma_cost} Karma
          </span>
        </div>
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0 text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="text-xs text-muted-foreground">{q.effects || "—"}</div>
      {q.description && (
        <div className="text-[11px] text-muted-foreground/70 italic pt-0.5">
          {q.description}
        </div>
      )}
    </div>
  );
}

interface Props {
  qualities: SR6Quality[];
  onUpdate?: (qualities: SR6Quality[]) => void;
}

export function QualitiesTab({ qualities, onUpdate }: Props) {
  const positiveQualities = qualities.filter((q) => q.type === "positive");
  const negativeQualities = qualities.filter((q) => q.type === "negative");

  const handleRemove = (id: string) => {
    onUpdate?.(qualities.filter((q) => q.id !== id));
  };

  const handleAdd = (item: SR6Quality) => {
    onUpdate?.([...qualities, item]);
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display tracking-wider text-sm sm:text-base">QUALITIES</CardTitle>
          {onUpdate && (
            <QualityReferenceSelect
              onSelect={(item) => handleAdd(item as SR6Quality)}
              triggerLabel="Add from reference"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {qualities.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">No qualities added yet.</p>
        )}

        {positiveQualities.length > 0 && (
          <>
            <CategoryHeader icon={CirclePlus} label="Positive Qualities" />
            {positiveQualities.map((q) => (
              <QualityItem
                key={q.id}
                q={q}
                onRemove={onUpdate ? () => handleRemove(q.id) : undefined}
              />
            ))}
          </>
        )}

        {negativeQualities.length > 0 && (
          <>
            <CategoryHeader icon={CircleMinus} label="Negative Qualities" />
            {negativeQualities.map((q) => (
              <QualityItem
                key={q.id}
                q={q}
                onRemove={onUpdate ? () => handleRemove(q.id) : undefined}
              />
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
