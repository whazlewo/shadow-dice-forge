import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import WizardStepper from "@/components/wizard/WizardStepper";
import Step1Priorities from "@/components/wizard/Step1Priorities";
import Step2Metatype from "@/components/wizard/Step2Metatype";
import Step3Attributes from "@/components/wizard/Step3Attributes";
import Step4Skills from "@/components/wizard/Step4Skills";
import Step5Magic from "@/components/wizard/Step5Magic";
import { PRIORITY_TABLE, type PriorityLevel, type PriorityColumn } from "@/data/sr6-reference";
import { SR6_CORE_SKILLS, type SR6Attributes, type SR6Skill } from "@/types/character";
import { v4 as generateUUID } from "@/lib/uuid";

export interface WizardSkill {
  name: string;
  attribute: keyof SR6Attributes;
  rating: number;
  specialization: string;
  expertise: string;
}

export interface WizardState {
  characterName: string;
  priorities: Partial<Record<PriorityColumn, PriorityLevel>>;
  metatype: string | null;
  adjustmentPoints: Partial<Record<keyof SR6Attributes, number>>;
  attributes: Record<string, number>;
  skills: WizardSkill[];
  magicChoice: string | null;
}

const STEPS = ["Priorities", "Metatype", "Attributes", "Skills", "Magic"];
const DEBOUNCE_MS = 1000;

function createInitialState(): WizardState {
  return {
    characterName: "",
    priorities: {},
    metatype: null,
    adjustmentPoints: {},
    attributes: {
      body: 1, agility: 1, reaction: 1, strength: 1,
      willpower: 1, logic: 1, intuition: 1, charisma: 1,
    },
    skills: SR6_CORE_SKILLS.map((s) => ({
      name: s.name,
      attribute: s.attribute,
      rating: 0,
      specialization: "",
      expertise: "",
    })),
    magicChoice: null,
  };
}

export default function CharacterWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(createInitialState);
  const [saving, setSaving] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const draftLoaded = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load draft on mount
  useEffect(() => {
    if (!user) {
      setLoadingDraft(false);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase
          .from("character_drafts")
          .select("wizard_step, wizard_state")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data && !error) {
          setStep(data.wizard_step);
          setState(data.wizard_state as unknown as WizardState);
          toast.info("Draft restored");
        }
      } catch {
        // ignore — start fresh
      } finally {
        draftLoaded.current = true;
        setLoadingDraft(false);
      }
    })();
  }, [user]);

  // Auto-save draft (debounced)
  useEffect(() => {
    if (!user || !draftLoaded.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      await supabase.from("character_drafts").upsert(
        {
          user_id: user.id,
          wizard_step: step,
          wizard_state: state as any,
        },
        { onConflict: "user_id" }
      );
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [step, state, user]);

  const deleteDraft = useCallback(async () => {
    if (!user) return;
    await supabase.from("character_drafts").delete().eq("user_id", user.id);
  }, [user]);

  const update = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: {
        const vals = Object.values(state.priorities).filter(Boolean);
        return vals.length === 5 && state.characterName.trim().length > 0;
      }
      case 1:
        return !!state.metatype;
      case 2:
      case 3:
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const magicPriority = state.priorities.magic_resonance as PriorityLevel;
      const magicOptions = PRIORITY_TABLE[magicPriority].magic_resonance;
      const selectedMagic = magicOptions.find((o) => o.type === state.magicChoice);

      const attrs: SR6Attributes = {
        body: (state.attributes.body || 1) + (state.adjustmentPoints.body || 0),
        agility: (state.attributes.agility || 1) + (state.adjustmentPoints.agility || 0),
        reaction: (state.attributes.reaction || 1) + (state.adjustmentPoints.reaction || 0),
        strength: (state.attributes.strength || 1) + (state.adjustmentPoints.strength || 0),
        willpower: (state.attributes.willpower || 1) + (state.adjustmentPoints.willpower || 0),
        logic: (state.attributes.logic || 1) + (state.adjustmentPoints.logic || 0),
        intuition: (state.attributes.intuition || 1) + (state.adjustmentPoints.intuition || 0),
        charisma: (state.attributes.charisma || 1) + (state.adjustmentPoints.charisma || 0),
        edge: (state.adjustmentPoints.edge || 0) + 1,
        essence: 6,
        magic: selectedMagic && selectedMagic.type !== "technomancer" ? selectedMagic.magicOrResonance + (state.adjustmentPoints.magic || 0) : 0,
        resonance: selectedMagic && selectedMagic.type === "technomancer" ? selectedMagic.magicOrResonance + (state.adjustmentPoints.resonance || 0) : 0,
      };

      const skills: SR6Skill[] = state.skills
        .filter((s) => s.rating > 0)
        .map((s) => ({
          id: generateUUID(),
          name: s.name,
          attribute: s.attribute,
          rating: s.rating,
          specialization: s.specialization || undefined,
          expertise: s.expertise || undefined,
        }));

      const resPriority = state.priorities.resources as PriorityLevel;

      const { data, error } = await supabase
        .from("characters")
        .insert({
          user_id: user.id,
          name: state.characterName || "New Runner",
          metatype: state.metatype,
          priorities: state.priorities as any,
          attributes: attrs as any,
          skills: skills as any,
          ids_lifestyles: { sins: [], licenses: [], lifestyles: [], nuyen: PRIORITY_TABLE[resPriority].resources } as any,
          personal_info: {} as any,
        })
        .select()
        .single();

      if (error) throw error;

      await deleteDraft();
      toast.success("Character created!");
      navigate(`/character/${data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create character");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    await deleteDraft();
    navigate("/");
  };

  if (loadingDraft) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold tracking-wider text-primary neon-glow-cyan">
            NEW RUNNER
          </h1>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard draft?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your in-progress character will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>Discard</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      <main className="container py-6 max-w-3xl space-y-6">
        <WizardStepper steps={STEPS} currentStep={step} />

        <div className="min-h-[400px]">
          {step === 0 && <Step1Priorities state={state} onChange={update} />}
          {step === 1 && <Step2Metatype state={state} onChange={update} />}
          {step === 2 && <Step3Attributes state={state} onChange={update} />}
          {step === 3 && <Step4Skills state={state} onChange={update} />}
          {step === 4 && <Step5Magic state={state} onChange={update} />}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="font-display tracking-wide"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="font-display tracking-wide"
            >
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={saving}
              className="font-display tracking-wide"
            >
              <Check className="h-4 w-4 mr-1" /> {saving ? "Creating..." : "Create Character"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
