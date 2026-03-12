import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Info, Banknote, Home, Fingerprint, FileCheck } from "lucide-react";
import type { SR6IdsLifestyles, SR6PersonalInfo } from "@/types/character";
import type { KarmaTransaction } from "@/types/karma";
import { KarmaTracker } from "./KarmaTracker";

interface Props {
  idsLifestyles: SR6IdsLifestyles | null;
  personalInfo: SR6PersonalInfo;
  karmaLedger?: KarmaTransaction[];
  onKarmaUndo?: (txId: string) => void;
  onAddKarmaTransaction?: (tx: Omit<KarmaTransaction, "id" | "timestamp">) => void;
  onUpdateIdsLifestyles: (data: SR6IdsLifestyles) => void;
  onUpdatePersonalInfo: (info: SR6PersonalInfo) => void;
}

const defaultIdsLifestyles: SR6IdsLifestyles = {
  sins: [],
  licenses: [],
  lifestyles: [],
  nuyen: 0,
};

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

export function IdsLifestylesCurrencyTab({
  idsLifestyles,
  personalInfo,
  karmaLedger,
  onKarmaUndo,
  onAddKarmaTransaction,
  onUpdateIdsLifestyles,
  onUpdatePersonalInfo,
}: Props) {
  const data = idsLifestyles || defaultIdsLifestyles;

  const setIds = (updates: Partial<SR6IdsLifestyles>) => {
    onUpdateIdsLifestyles({ ...data, ...updates });
  };

  const setPersonal = (key: keyof SR6PersonalInfo, value: string | number) => {
    const isNum = typeof value === "number";
    onUpdatePersonalInfo({ ...personalInfo, [key]: isNum ? value : String(value) });
  };

  const setReputation = (value: number) => {
    const { street_cred, notoriety, public_awareness, ...rest } = personalInfo;
    onUpdatePersonalInfo({ ...rest, reputation: value });
  };

  const addSin = () => {
    setIds({
      sins: [...data.sins, { id: crypto.randomUUID(), name: "", rating: 0 }],
    });
  };

  const updateSin = (index: number, field: "name" | "rating", value: string | number) => {
    const updated = [...data.sins];
    updated[index] = { ...updated[index], [field]: field === "rating" ? Number(value) || 0 : String(value) };
    setIds({ sins: updated });
  };

  const removeSin = (index: number) => {
    setIds({ sins: data.sins.filter((_, i) => i !== index) });
  };

  const addLicense = () => {
    setIds({
      licenses: [...data.licenses, { id: crypto.randomUUID(), name: "", rating: 0, sin_id: "" }],
    });
  };

  const updateLicense = (index: number, field: "name" | "rating", value: string | number) => {
    const updated = [...data.licenses];
    updated[index] = { ...updated[index], [field]: field === "rating" ? Number(value) || 0 : String(value) };
    setIds({ licenses: updated });
  };

  const removeLicense = (index: number) => {
    setIds({ licenses: data.licenses.filter((_, i) => i !== index) });
  };

  const primaryLifestyle = data.lifestyles?.[0];

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="font-display tracking-wider text-sm sm:text-base">IDS / LIFESTYLES / CURRENCY</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <CategoryHeader icon={Banknote} label="Currency & Reputation" />
          <div className="grid grid-cols-3 gap-4 pt-1">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1 w-full">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nuyen</Label>
                <span className="w-3 h-3 shrink-0" aria-hidden="true" />
              </div>
              <Input
                type="number"
                value={data.nuyen ?? 0}
                onChange={(e) => setIds({ nuyen: parseInt(e.target.value) || 0 })}
                className="h-9 font-mono text-sm bg-muted/50 text-left"
              />
            </div>
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1 w-full">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Reputation</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/60 cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs">
                    +10 or higher: Edge with law enforcement, community, runners. -10 or lower: reverse. Affects Heat modifiers.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                value={
                  personalInfo.reputation ??
                  (personalInfo.street_cred ?? 0) - (personalInfo.notoriety ?? 0)
                }
                onChange={(e) => setReputation(parseInt(e.target.value) || 0)}
                className="h-9 font-mono text-sm bg-muted/50 text-left"
              />
            </div>
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-1 w-full">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Heat</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/60 cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs">
                    Law enforcement pressure. At 10+, lowest-rated SIN is burned. Drops 1 per month of no shadowrunning (Lie Low).
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                value={data.heat ?? 0}
                onChange={(e) => setIds({ heat: parseInt(e.target.value) || 0 })}
                className="h-9 font-mono text-sm bg-muted/50 text-left"
              />
            </div>
          </div>
        </div>

        {karmaLedger && onKarmaUndo && onAddKarmaTransaction && (
          <KarmaTracker ledger={karmaLedger} onUndo={onKarmaUndo} />
        )}

        <div>
          <CategoryHeader icon={Home} label="Lifestyle" />
          <div className="p-2 rounded-md bg-muted/30 pt-1">
            <span className="font-mono text-sm">
              {primaryLifestyle ? `${primaryLifestyle.name} (${primaryLifestyle.tier})` : "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 pt-2">
              <Fingerprint className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Fake SINs</span>
              <div className="h-px flex-1 bg-border" />
              <Button variant="outline" size="sm" className="h-6 text-[10px] shrink-0" onClick={addSin}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            {data.sins.length === 0 ? (
              <p className="text-muted-foreground text-xs py-2">No fake SINs.</p>
            ) : (
              <div className="space-y-1.5">
                {data.sins.map((sin, i) => (
                  <div key={sin.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                    <Input
                      value={sin.name}
                      onChange={(e) => updateSin(i, "name", e.target.value)}
                      placeholder="SIN name"
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      type="number"
                      value={sin.rating}
                      onChange={(e) => updateSin(i, "rating", e.target.value)}
                      placeholder="Rating"
                      className="h-8 text-xs w-16 font-mono"
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeSin(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 pt-2">
              <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Licenses</span>
              <div className="h-px flex-1 bg-border" />
              <Button variant="outline" size="sm" className="h-6 text-[10px] shrink-0" onClick={addLicense}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            {data.licenses.length === 0 ? (
              <p className="text-muted-foreground text-xs py-2">No licenses.</p>
            ) : (
              <div className="space-y-1.5">
                {data.licenses.map((lic, i) => (
                  <div key={lic.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                    <Input
                      value={lic.name}
                      onChange={(e) => updateLicense(i, "name", e.target.value)}
                      placeholder="License"
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      type="number"
                      value={lic.rating}
                      onChange={(e) => updateLicense(i, "rating", e.target.value)}
                      placeholder="Rating"
                      className="h-8 text-xs w-16 font-mono"
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeLicense(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
