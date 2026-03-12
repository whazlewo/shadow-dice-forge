import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Trash2, Info } from "lucide-react";
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
        <CardTitle className="font-display tracking-wider">IDS / LIFESTYLES / CURRENCY</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Nuyen</Label>
            <Input
              type="number"
              value={data.nuyen ?? 0}
              onChange={(e) => setIds({ nuyen: parseInt(e.target.value) || 0 })}
              className="h-9 font-mono text-sm bg-muted/50"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Heat</Label>
            <Input
              type="number"
              value={data.heat ?? 0}
              onChange={(e) => setIds({ heat: parseInt(e.target.value) || 0 })}
              className="h-9 font-mono text-sm bg-muted/50"
            />
          </div>
        </div>

        {karmaLedger && onKarmaUndo && onAddKarmaTransaction && (
          <KarmaTracker ledger={karmaLedger} onUndo={onKarmaUndo} />
        )}

        <div className="space-y-2">
          <span className="font-display text-xs tracking-wide text-muted-foreground">Reputation</span>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label className="text-[10px] text-muted-foreground">Street Cred</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/60 cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs">
                    Your positive reputation in the shadows. What others have heard about your good deeds—can add bonus dice to social pools when interacting with those aware of your rep.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                value={personalInfo.street_cred ?? ""}
                onChange={(e) => setPersonal("street_cred", parseInt(e.target.value) || 0)}
                className="h-8 font-mono text-xs bg-muted/50"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label className="text-[10px] text-muted-foreground">Notoriety</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/60 cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs">
                    Your negative reputation. What others have heard about your bad deeds—can work against you in social interactions.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                value={personalInfo.notoriety ?? ""}
                onChange={(e) => setPersonal("notoriety", parseInt(e.target.value) || 0)}
                className="h-8 font-mono text-xs bg-muted/50"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label className="text-[10px] text-muted-foreground">Public Awareness</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/60 cursor-help shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs">
                    How well-known you are. Measures overall recognizability—combines Street Cred and Notoriety to show how much people have heard about you.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="number"
                value={personalInfo.public_awareness ?? ""}
                onChange={(e) => setPersonal("public_awareness", parseInt(e.target.value) || 0)}
                className="h-8 font-mono text-xs bg-muted/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Primary Lifestyle</Label>
          <span className="block font-mono text-sm py-1">
            {primaryLifestyle ? `${primaryLifestyle.name} (${primaryLifestyle.tier})` : "—"}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs tracking-wide text-muted-foreground">Fake IDs</span>
            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={addSin}>
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {data.sins.length === 0 ? (
            <p className="text-muted-foreground text-xs py-2">No fake IDs.</p>
          ) : (
            <div className="space-y-1.5">
              {data.sins.map((sin, i) => (
                <div key={sin.id} className="flex items-center gap-2">
                  <Input
                    value={sin.name}
                    onChange={(e) => updateSin(i, "name", e.target.value)}
                    placeholder="ID name"
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
          <div className="flex items-center justify-between">
            <span className="font-display text-xs tracking-wide text-muted-foreground">Licenses</span>
            <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={addLicense}>
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {data.licenses.length === 0 ? (
            <p className="text-muted-foreground text-xs py-2">No licenses.</p>
          ) : (
            <div className="space-y-1.5">
              {data.licenses.map((lic, i) => (
                <div key={lic.id} className="flex items-center gap-2">
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
      </CardContent>
    </Card>
  );
}
