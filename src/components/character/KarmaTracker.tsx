import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Undo2 } from "lucide-react";
import type { KarmaTransaction } from "@/types/karma";
import { computeKarmaSummary } from "@/lib/karma";

interface Props {
  ledger: KarmaTransaction[];
  onUndo: (transactionId: string) => void;
}

export function KarmaTracker({ ledger, onUndo }: Props) {
  const [open, setOpen] = useState(false);
  const summary = computeKarmaSummary(ledger);

  const activeLedger = [...ledger].reverse();

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-display text-xs tracking-wider text-muted-foreground uppercase">Karma</span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">
                <BookOpen className="h-3 w-3" /> Ledger
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider">KARMA LEDGER</DialogTitle>
              </DialogHeader>
              <div className="flex gap-3 mb-3">
                <Badge variant="outline" className="font-mono">Available: {summary.available}</Badge>
                <Badge variant="secondary" className="font-mono">Spent: {summary.spent}</Badge>
                <Badge variant="secondary" className="font-mono">Total: {summary.total}</Badge>
              </div>
              <ScrollArea className="h-[400px] pr-2">
                {activeLedger.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">No karma transactions yet.</p>
                )}
                <div className="space-y-1.5">
                  {activeLedger.map((tx) => (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-2 p-2 rounded-md text-xs font-mono ${
                        tx.undone ? "opacity-40 line-through bg-muted/20" : "bg-muted/30"
                      }`}
                    >
                      <Badge
                        variant={tx.type === "spent" ? "destructive" : "default"}
                        className="text-[10px] px-1.5 py-0 h-4 shrink-0"
                      >
                        {tx.type === "spent" ? `-${tx.amount}` : `+${tx.amount}`}
                      </Badge>
                      <span className="flex-1 truncate">{tx.description}</span>
                      <span className="text-muted-foreground text-[10px] shrink-0">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </span>
                      {!tx.undone && tx.type === "spent" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onUndo(tx.id)}
                        >
                          <Undo2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="font-mono text-lg font-bold text-primary neon-glow-cyan">{summary.available}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Available</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-destructive">{summary.spent}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Spent</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold text-foreground">{summary.total}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
