import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Check, Camera, Info, ExternalLink } from "lucide-react";
import type { SR6PersonalInfo } from "@/types/character";
import type { KarmaTransaction } from "@/types/karma";
import { KarmaTracker } from "./KarmaTracker";
import { PortraitUploadDialog } from "./PortraitUploadDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  info: SR6PersonalInfo;
  onUpdate: (info: SR6PersonalInfo) => void;
  name: string;
  metatype: string;
  onNameChange: (name: string) => void;
  onMetatypeChange: (metatype: string) => void;
  onNameBlur: () => void;
  onMetatypeBlur: () => void;
  karmaLedger?: KarmaTransaction[];
  onKarmaUndo?: (txId: string) => void;
  onAddKarmaTransaction?: (tx: Omit<KarmaTransaction, "id" | "timestamp">) => void;
  portraitUrl?: string | null;
  onPortraitUpload?: (blob: Blob) => Promise<void>;
}

function Field({ label, value, type, onChange, onBlur, readOnly, tooltip }: { label: string; value: any; type?: string; onChange?: (val: string) => void; onBlur?: () => void; readOnly?: boolean; tooltip?: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/60 cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {readOnly ? (
        <span className="block font-mono text-sm py-1">{value || "—"}</span>
      ) : (
        <Input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          className="h-9 font-mono text-sm bg-muted/50"
        />
      )}
    </div>
  );
}

export function PersonalInfoTab({ info, onUpdate, name, metatype, onNameChange, onMetatypeChange, onNameBlur, onMetatypeBlur, karmaLedger, onKarmaUndo, onAddKarmaTransaction, portraitUrl, onPortraitUpload }: Props) {
  const [editing, setEditing] = useState(false);
  const [portraitOpen, setPortraitOpen] = useState(false);
  const [portraitSaving, setPortraitSaving] = useState(false);
  const [backstoryModalOpen, setBackstoryModalOpen] = useState(false);

  const set = (key: keyof SR6PersonalInfo, value: string, isNum = false) => {
    onUpdate({ ...info, [key]: isNum ? (parseInt(value) || 0) : value });
  };

  const toggleEdit = () => {
    if (editing) {
      onNameBlur();
      onMetatypeBlur();
    }
    setEditing(!editing);
  };

  const handlePortraitSave = async (blob: Blob) => {
    if (!onPortraitUpload) return;
    setPortraitSaving(true);
    try {
      await onPortraitUpload(blob);
      setPortraitOpen(false);
    } finally {
      setPortraitSaving(false);
    }
  };

  const ro = !editing;

  const stripHtml = (html: string | undefined) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <Card className="border-border/50 bg-card/80 flex-1 min-h-0 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between shrink-0">
          <CardTitle className="font-display tracking-wider">PERSONAL DATA</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleEdit}>
            {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-auto flex flex-col">
          <div className="flex gap-4 shrink-0">
            {/* Portrait */}
            <button
              type="button"
              onClick={() => setPortraitOpen(true)}
              className="shrink-0 w-[120px] h-[120px] rounded-md border border-border/50 bg-muted/30 overflow-hidden flex items-center justify-center group relative hover:border-primary/50 transition-colors"
            >
              {portraitUrl ? (
                <>
                  <img src={portraitUrl} alt="Character portrait" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="h-5 w-5 text-foreground" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-foreground transition-colors">
                  <Camera className="h-6 w-6" />
                  <span className="text-[9px] uppercase tracking-wider">Portrait</span>
                </div>
              )}
            </button>

            {/* Fields */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Name" value={name} readOnly={ro} onChange={onNameChange} onBlur={onNameBlur} />
                <Field label="Metatype" value={metatype} readOnly={ro} onChange={onMetatypeChange} onBlur={onMetatypeBlur} />
                <Field label="Ethnicity" value={info.ethnicity} readOnly={ro} onChange={(v) => set("ethnicity", v)} />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Field label="Age" value={info.age} type="number" readOnly={ro} onChange={(v) => set("age", v, true)} />
                <Field label="Sex" value={info.sex} readOnly={ro} onChange={(v) => set("sex", v)} />
                <Field label="Height" value={info.height} readOnly={ro} onChange={(v) => set("height", v)} />
                <Field label="Weight" value={info.weight} readOnly={ro} onChange={(v) => set("weight", v)} />
              </div>
            </div>
          </div>

          {/* Description and Backstory - full width, backstory fills remaining space */}
          <div className="w-full flex-1 min-h-0 flex flex-col mt-4 gap-0">
            <div className="space-y-1 shrink-0">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Description</Label>
              <RichTextEditor
                value={info.description ?? ""}
                onChange={(v) => set("description", v)}
                placeholder="Describe your runner—role, motivations, personality..."
                readOnly={ro}
                minHeight="min-h-[80px]"
              />
            </div>
            <button
              type="button"
              onClick={() => setBackstoryModalOpen(true)}
              className="flex-1 min-h-0 flex flex-col text-left hover:bg-muted/20 rounded-md transition-colors -mx-1 px-1"
            >
              <div className="flex items-center justify-between shrink-0">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide cursor-pointer">
                  Backstory
                </Label>
                <ExternalLink className="h-3 w-3 text-muted-foreground/60 shrink-0" />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden py-1">
                <p className="text-sm text-muted-foreground line-clamp-[10] break-words">
                  {stripHtml(info.backstory) || "No backstory yet."}
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {karmaLedger && onKarmaUndo && (
        <KarmaTracker ledger={karmaLedger} onUndo={onKarmaUndo} />
      )}

      <PortraitUploadDialog
        open={portraitOpen}
        onClose={() => setPortraitOpen(false)}
        onSave={handlePortraitSave}
        saving={portraitSaving}
      />

      <Dialog open={backstoryModalOpen} onOpenChange={setBackstoryModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">Backstory</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto -mx-1 px-1">
            <RichTextEditor
              value={info.backstory ?? ""}
              onChange={(v) => set("backstory", v)}
              placeholder="A few lines about your runner's history..."
              readOnly={ro}
              minHeight="min-h-[200px]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
