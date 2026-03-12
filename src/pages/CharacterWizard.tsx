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
import Step1Concept from "@/components/wizard/Step1Concept";
import Step2PrioritiesWrapper from "@/components/wizard/Step2PrioritiesWrapper";
import Step3Qualities from "@/components/wizard/Step3Qualities";
import Step4Karma from "@/components/wizard/Step4Karma";
import Step5Gear from "@/components/wizard/Step5Gear";
import Step6Magic from "@/components/wizard/Step6Magic";
import { PRIORITY_TABLE, type PriorityLevel } from "@/data/sr6-reference";
import { getMysticAdeptSpellSlots } from "@/lib/magic-reference-utils";
import { SR6_CORE_SKILLS, type SR6Attributes, type SR6Skill, type SR6Spell, type SR6AdeptPower, type WizardQuality, type WizardGearItem, type WizardRangedWeapon, type WizardMeleeWeapon, type WizardArmor as WizardArmorType, type WizardAugmentation, type WizardVehicle, type WizardElectronics, type WizardMiscGear, type AttributeSources, type SR6CoreAttributes } from "@/types/character";


export interface WizardSkill {
  name: string;
  attribute: keyof SR6Attributes;
  rating: number;
  specialization: string;
  expertise: string;
}

export interface WizardState {
  characterName: string;
  description: string;
  backstory: string;
  priorities: Partial<Record<import("@/data/sr6-reference").PriorityColumn, PriorityLevel>>;
  metatype: string | null;
  adjustmentPoints: Partial<Record<keyof SR6Attributes, number>>;
  attributes: Record<string, number>;
  skills: WizardSkill[];
  magicChoice: string | null;
  mysticAdeptPowerPoints?: number;
  selectedSpells: SR6Spell[];
  selectedAdeptPowers: SR6AdeptPower[];
  selectedComplexForms: SR6Spell[];
  wizardQualities: WizardQuality[];
  karmaSpend: Record<string, number>;
  karmaSpendSpecializations: Record<string, string>;
  karmaSpendNuyen: number;
  knowledgeSkillsFree: string[];
  karmaSpendKnowledgeSkills: string[];
  purchasedGear: WizardGearItem[];
  karmaSpendSpells: SR6Spell[];
  karmaSpendPowerPoints: number;
}

const BASE_STEPS_MUNDANE = ["Concept", "Priorities", "Qualities", "Karma", "Gear"];
const BASE_STEPS_MAGIC = ["Concept", "Priorities", "Magic", "Qualities", "Karma", "Gear"];
const DEBOUNCE_MS = 1000;

function getSteps(magicChoice: string | null): string[] {
  const isMagicUser = magicChoice && magicChoice !== "mundane";
  return isMagicUser ? BASE_STEPS_MAGIC : BASE_STEPS_MUNDANE;
}

function createInitialState(): WizardState {
  return {
    characterName: "",
    description: "",
    backstory: "",
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
    mysticAdeptPowerPoints: 0,
    selectedSpells: [],
    selectedAdeptPowers: [],
    selectedComplexForms: [],
    wizardQualities: [],
    karmaSpend: {},
    karmaSpendSpecializations: {},
    karmaSpendNuyen: 0,
    knowledgeSkillsFree: [],
    karmaSpendKnowledgeSkills: [],
    purchasedGear: [],
    karmaSpendSpells: [],
    karmaSpendPowerPoints: 0,
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
          const loaded: (WizardState & { _wizardStepName?: string }) | null = data.wizard_state as any;
          if (loaded) {
            if (!("karmaSpendSpecializations" in loaded)) loaded.karmaSpendSpecializations = {};
            if (!("karmaSpendNuyen" in loaded)) loaded.karmaSpendNuyen = 0;
            if (!("knowledgeSkillsFree" in loaded)) loaded.knowledgeSkillsFree = [];
            if (!("karmaSpendKnowledgeSkills" in loaded)) loaded.karmaSpendKnowledgeSkills = [];
          }
          const steps = getSteps(loaded.magicChoice);
          const stepName = loaded._wizardStepName;
          const stepIndex = stepName && steps.includes(stepName)
            ? steps.indexOf(stepName)
            : Math.min(data.wizard_step ?? 0, steps.length - 1);
          const { _wizardStepName, ...cleanState } = loaded;
          setStep(stepIndex);
          setState(cleanState as WizardState);
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

    const steps = getSteps(state.magicChoice);
    const wizardStateToSave = { ...state, _wizardStepName: steps[step] };

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      await supabase.from("character_drafts").upsert(
        {
          user_id: user.id,
          wizard_step: step,
          wizard_state: wizardStateToSave as any,
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

  const steps = getSteps(state.magicChoice);
  const isMagicStep = steps[step] === "Magic";

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return state.characterName.trim().length > 0;
      case 1: {
        const vals = Object.values(state.priorities).filter(Boolean);
        const magicPriority = state.priorities.magic_resonance as PriorityLevel | undefined;
        const magicOptions = magicPriority ? PRIORITY_TABLE[magicPriority]?.magic_resonance ?? [] : [];
        const magicChoiceValid = magicOptions.some((o) => o.type === state.magicChoice);
        return vals.length === 5 && !!state.metatype && magicChoiceValid;
      }
      case 2:
      case 3:
      case 4:
        return true;
      default:
        if (isMagicStep) {
          const magicPriority = state.priorities.magic_resonance as PriorityLevel;
          const magicOptions = PRIORITY_TABLE[magicPriority]?.magic_resonance ?? [];
          const selected = magicOptions.find((o) => o.type === state.magicChoice);
          const magic = selected?.magicOrResonance ?? 0;
          const mysticPP = state.mysticAdeptPowerPoints ?? 0;
          const karmaSpendPowerPoints = state.karmaSpendPowerPoints ?? 0;
          const spellSlots = getMysticAdeptSpellSlots(magic, mysticPP);
          const adeptPPBudget =
            state.magicChoice === "mystic_adept"
              ? mysticPP + karmaSpendPowerPoints
              : state.magicChoice === "adept"
                ? magic
                : 0;
          const adeptPPSpent = (state.selectedAdeptPowers ?? []).reduce((s, p) => s + p.pp_cost, 0);

          if (state.magicChoice === "full" || state.magicChoice === "aspected") {
            return (state.selectedSpells ?? []).length === magic * 2;
          }
          if (state.magicChoice === "mystic_adept") {
            return adeptPPSpent <= adeptPPBudget && (state.selectedSpells ?? []).length === spellSlots;
          }
          if (state.magicChoice === "adept") {
            return adeptPPSpent <= adeptPPBudget;
          }
          if (state.magicChoice === "technomancer") {
            return (state.selectedComplexForms ?? []).length === magic * 2;
          }
        }
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
      const karmaSpend = state.karmaSpend || {};

      const KARMA_PER_POINT = 5;

      const attrs: SR6Attributes = {
        body: (state.attributes.body || 1) + (state.adjustmentPoints.body || 0) + Math.floor((karmaSpend.attr_body || 0) / KARMA_PER_POINT),
        agility: (state.attributes.agility || 1) + (state.adjustmentPoints.agility || 0) + Math.floor((karmaSpend.attr_agility || 0) / KARMA_PER_POINT),
        reaction: (state.attributes.reaction || 1) + (state.adjustmentPoints.reaction || 0) + Math.floor((karmaSpend.attr_reaction || 0) / KARMA_PER_POINT),
        strength: (state.attributes.strength || 1) + (state.adjustmentPoints.strength || 0) + Math.floor((karmaSpend.attr_strength || 0) / KARMA_PER_POINT),
        willpower: (state.attributes.willpower || 1) + (state.adjustmentPoints.willpower || 0) + Math.floor((karmaSpend.attr_willpower || 0) / KARMA_PER_POINT),
        logic: (state.attributes.logic || 1) + (state.adjustmentPoints.logic || 0) + Math.floor((karmaSpend.attr_logic || 0) / KARMA_PER_POINT),
        intuition: (state.attributes.intuition || 1) + (state.adjustmentPoints.intuition || 0) + Math.floor((karmaSpend.attr_intuition || 0) / KARMA_PER_POINT),
        charisma: (state.attributes.charisma || 1) + (state.adjustmentPoints.charisma || 0) + Math.floor((karmaSpend.attr_charisma || 0) / KARMA_PER_POINT),
        edge: (state.adjustmentPoints.edge || 0) + 1,
        essence: 6,
        magic: selectedMagic && selectedMagic.type !== "technomancer" ? selectedMagic.magicOrResonance + (state.adjustmentPoints.magic || 0) : 0,
        resonance: selectedMagic && selectedMagic.type === "technomancer" ? selectedMagic.magicOrResonance + (state.adjustmentPoints.resonance || 0) : 0,
      };

      // Build attribute sources breakdown
      const attrKeys: (keyof SR6CoreAttributes)[] = ["body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma", "edge", "essence", "magic", "resonance"];
      const attributeSources: AttributeSources = {};
      for (const key of attrKeys) {
        if (key === "essence") {
          attributeSources[key] = { base: 6, adjustment: 0, attribute_points: 0, karma: 0 };
        } else if (key === "edge") {
          attributeSources[key] = { base: 1, adjustment: state.adjustmentPoints.edge || 0, attribute_points: 0, karma: 0 };
        } else if (key === "magic") {
          const magicBase = selectedMagic && selectedMagic.type !== "technomancer" ? selectedMagic.magicOrResonance : 0;
          attributeSources[key] = { base: magicBase, adjustment: state.adjustmentPoints.magic || 0, attribute_points: 0, karma: 0 };
        } else if (key === "resonance") {
          const resBase = selectedMagic && selectedMagic.type === "technomancer" ? selectedMagic.magicOrResonance : 0;
          attributeSources[key] = { base: resBase, adjustment: state.adjustmentPoints.resonance || 0, attribute_points: 0, karma: 0 };
        } else {
          attributeSources[key] = {
            base: 1,
            adjustment: state.adjustmentPoints[key] || 0,
            attribute_points: (state.attributes[key] || 1) - 1,
            karma: Math.floor((karmaSpend[`attr_${key}`] || 0) / KARMA_PER_POINT),
          };
        }
      }

      const skills: SR6Skill[] = state.skills
        .filter((s) => s.rating > 0 || (karmaSpend[`skill_${s.name}`] || 0) > 0)
        .map((s) => {
          const karmaRaises = Math.floor((karmaSpend[`skill_${s.name}`] || 0) / KARMA_PER_POINT);
          return {
            id: crypto.randomUUID(),
            name: s.name,
            attribute: s.attribute,
            rating: s.rating + karmaRaises,
            specialization: s.specialization || (state.karmaSpendSpecializations ?? {})[s.name] || undefined,
            expertise: s.expertise || undefined,
          };
        });

      const qualities = (state.wizardQualities || []).map((q) => ({
        id: q.id,
        name: q.name,
        type: q.type,
        karma_cost: q.karma_cost,
        effects: q.effects,
      }));

      const resPriority = state.priorities.resources as PriorityLevel;
      const karmaNuyen = (state.karmaSpendNuyen ?? 0) * 2000;
      const startingNuyen = PRIORITY_TABLE[resPriority].resources + karmaNuyen;
      const allGear = state.purchasedGear || [];
      const gearCost = allGear.reduce((sum, g) => sum + g.cost * g.quantity, 0);

      // Split gear by category into character columns
      const rangedWeapons = allGear
        .filter((g): g is WizardRangedWeapon => g.category === "ranged_weapon")
        .map((g) => {
          const accessories = typeof g.accessories === "string"
            ? g.accessories.split(",").map((s) => s.trim()).filter(Boolean).map((name) => ({ name, ar_modifier: "" as string | undefined, notes: "" as string | undefined }))
            : (g.accessories ?? []);
          return { id: g.id, name: g.name, subtype: g.subtype, dv: g.dv, ar: g.attack_ratings, fire_modes: g.fire_modes, ammo: g.ammo, accessories, notes: (g as { notes?: string }).notes, description: (g as { description?: string }).description };
        });

      const meleeWeapons = allGear
        .filter((g): g is WizardMeleeWeapon => g.category === "melee_weapon")
        .map((g) => ({ id: g.id, name: g.name, subtype: g.subtype, dv: g.dv, ar: g.attack_ratings, reach: g.reach, notes: (g as { notes?: string }).notes, description: (g as { description?: string }).description }));

      const armorItems = allGear
        .filter((g): g is WizardArmorType => g.category === "armor")
        .map((g) => ({ id: g.id, name: g.name, rating: g.defense_rating, capacity: g.capacity, modifications: g.modifications, subtype: g.subtype, notes: (g as { notes?: string }).notes, description: (g as { description?: string }).description }));

      const augmentationItems = allGear
        .filter((g): g is WizardAugmentation => g.category === "augmentation")
        .map((g) => ({ id: g.id, name: g.name, type: g.aug_type, essence_cost: g.essence_cost, rating: g.rating, effects: g.effects, notes: (g as { notes?: string }).notes, dice_modifiers: g.dice_modifiers, description: (g as { description?: string }).description }));

      const vehicleItems = allGear
        .filter((g): g is WizardVehicle => g.category === "vehicle")
        .map((g) => ({ id: g.id, name: g.name, handling: g.handling, speed: g.speed, body: g.veh_body, armor: g.veh_armor, sensor: g.sensor, pilot: g.pilot, seats: g.seats, notes: (g as { notes?: string }).notes, description: (g as { description?: string }).description }));

      const miscGear = allGear
        .filter((g): g is WizardElectronics | WizardMiscGear => g.category === "electronics" || g.category === "miscellaneous")
        .map((g) => ({ id: g.id, name: g.name, quantity: g.quantity, notes: "notes" in g ? g.notes : "", dice_modifiers: "dice_modifiers" in g ? g.dice_modifiers : undefined }));

      // Update essence based on augmentations
      const totalEssenceLost = augmentationItems.reduce((sum, a) => sum + a.essence_cost, 0);

      const spells = [
        ...(state.selectedSpells ?? []),
        ...(state.selectedComplexForms ?? []),
        ...(state.karmaSpendSpells ?? []),
      ];

      const logicAttr = (state.attributes.logic || 1) + (state.adjustmentPoints?.logic || 0) + Math.floor((karmaSpend.attr_logic || 0) / KARMA_PER_POINT);
      const freeKnowledge = (state.knowledgeSkillsFree ?? []).slice(0, logicAttr).filter(Boolean);
      const karmaKnowledge = (state.karmaSpendKnowledgeSkills ?? []).filter(Boolean);
      const knowledgeSkills = [...freeKnowledge, ...karmaKnowledge];

      const { data, error } = await supabase
        .from("characters")
        .insert({
          user_id: user.id,
          name: state.characterName || "New Runner",
          metatype: state.metatype,
          priorities: { ...state.priorities, magic_type: state.magicChoice } as any,
          attributes: { ...attrs, essence: 6 - totalEssenceLost } as any,
          attribute_sources: attributeSources as any,
          skills: skills as any,
          qualities: qualities as any,
          ranged_weapons: rangedWeapons as any,
          melee_weapons: meleeWeapons as any,
          armor: armorItems as any,
          augmentations: augmentationItems as any,
          vehicles: vehicleItems as any,
          gear: miscGear as any,
          spells: spells as any,
          adept_powers: (state.selectedAdeptPowers ?? []) as any,
          ids_lifestyles: { sins: [], licenses: [], lifestyles: [], nuyen: startingNuyen - gearCost, knowledge_skills: knowledgeSkills } as any,
          personal_info: { description: state.description, backstory: state.backstory } as any,
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
        <WizardStepper steps={steps} currentStep={step} />

        <div className="min-h-[400px]">
          {steps[step] === "Concept" && <Step1Concept state={state} onChange={update} />}
          {steps[step] === "Priorities" && <Step2PrioritiesWrapper state={state} onChange={update} />}
          {steps[step] === "Magic" && <Step6Magic state={state} onChange={update} />}
          {steps[step] === "Qualities" && <Step3Qualities state={state} onChange={update} />}
          {steps[step] === "Karma" && <Step4Karma state={state} onChange={update} />}
          {steps[step] === "Gear" && <Step5Gear state={state} onChange={update} />}
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

          {step < steps.length - 1 ? (
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
