import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface KarmaConfirmRequest {
  description: string;
  cost: number;
  available: number;
  onConfirm: () => void;
  onCancel: () => void;
}

interface Props {
  request: KarmaConfirmRequest | null;
}

export function KarmaConfirmDialog({ request }: Props) {
  if (!request) return null;

  const canAfford = request.available >= request.cost;

  return (
    <AlertDialog open onOpenChange={(open) => { if (!open) request.onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display tracking-wider">Spend Karma?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">{request.description}</span>
            <span className="block font-mono text-sm">
              Cost: <span className="text-destructive font-bold">{request.cost} karma</span>
              {" · "}
              Available: <span className={canAfford ? "text-primary font-bold" : "text-destructive font-bold"}>{request.available}</span>
            </span>
            {!canAfford && (
              <span className="block text-destructive text-sm font-bold">
                ⚠ Not enough karma!
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={request.onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={request.onConfirm} disabled={!canAfford}>
            Spend {request.cost} Karma
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
