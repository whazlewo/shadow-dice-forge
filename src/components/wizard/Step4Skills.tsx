import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Minus, Plus } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PRIORITY_TABLE, SKILL_SPECIALIZATIONS, type PriorityLevel } from "@/data/sr6-reference";
import { SR6_CORE_SKILLS } from "@/types/character";
import type { WizardState, WizardSkill } from "@/pages/CharacterWizard";
import { cn } from "@/lib/utils";

const SKILL_CAN_DEFAULT: Record<string, boolean> = {
  Astral: false,
  Biotech: false,
  Conjuring: false,
  Cracking: false,
  Enchanting: false,
  "Exotic Weapons": false,
  Sorcery: false,
  Tasking: false,
};

const SKILL_DESCRIPTIONS: Record<string, string> = {
  Astral: "Navigating and interacting with the astral plane, including astral combat and projection.",
  Athletics: "Running, climbing, swimming, jumping, and other physical feats of coordination.",
  Biotech: "First aid, medicine, cybertechnology, and biotechnology knowledge.",
  "Close Combat": "Melee fighting with blades, clubs, unarmed strikes, and other close-range weapons.",
  Con: "Deception, disguise, impersonation, and fast-talking.",
  Conjuring: "Summoning, binding, and banishing spirits.",
  Cracking: "Hacking, cybercombat, and electronic warfare in the Matrix.",
  Electronics: "Computer use, software, hardware, and electronic devices.",
  Enchanting: "Creating magical preparations, foci, and other enchanted items.",
  Engineering: "Building, repairing, and modifying mechanical and structural systems.",
  "Exotic Weapons": "Proficiency with unusual or specialized weaponry.",
  Firearms: "Shooting pistols, rifles, shotguns, and other ranged projectile weapons.",
  Influence: "Negotiation, leadership, etiquette, and social persuasion.",
  Outdoors: "Survival, tracking, navigation, and wilderness knowledge.",
  Perception: "Noticing details, searching areas, and general awareness of surroundings.",
  Piloting: "Operating ground vehicles, drones, watercraft, and aircraft.",
  Sorcery: "Casting spells, counterspelling, and sustaining magical effects.",
  Stealth: "Sneaking, palming objects, and avoiding detection.",
  Tasking: "Compiling, registering, and decompiling sprites in the Matrix.",
};

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

export default function Step4Skills({ state, onChange }: Props) {
  const skillPriority = state.priorities.skills as PriorityLevel;
  const totalPoints = PRIORITY_TABLE[skillPriority].skills;
  const { skills } = state;

  const spentPoints = skills.reduce(
    (sum, s) => sum + s.rating + (s.specialization ? 1 : 0) + (s.expertise ? 1 : 0),
    0
  );
  const remaining = totalPoints - spentPoints;

  const atSixCount = skills.filter((s) => s.rating >= 6).length;

  const updateSkill = (index: number, updates: Partial<WizardSkill>) => {
    const newSkills = [...skills];
    const updated = { ...newSkills[index], ...updates };
    // Clear expertise if specialization is cleared
    if ("specialization" in updates && !updates.specialization) {
      updated.expertise = "";
    }
    newSkills[index] = updated;
    onChange({ skills: newSkills });
  };

  const adjustRating = (index: number, delta: number) => {
    const current = skills[index].rating;
    const newVal = current + delta;
    if (newVal < 0 || newVal > 6) return;
    if (delta > 0 && remaining <= 0) return;
    const updates: Partial<WizardSkill> = { rating: newVal };
    // Clear specialization/expertise if rating drops to 0
    if (newVal === 0) {
      updates.specialization = "";
      updates.expertise = "";
    }
    updateSkill(index, updates);
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg tracking-wide">Skills</CardTitle>
          <Badge variant={remaining < 0 ? "destructive" : "outline"} className="font-mono">
            {remaining} / {totalPoints} remaining
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Max rank 6, only one skill at rank 6. Specializations cost 1 pt (+2 dice), expertise costs 1 pt (+1 die, requires spec).
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {remaining < 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20 mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            You've overspent skill points.
          </div>
        )}
        {atSixCount > 1 && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 rounded-md px-3 py-2 border border-amber-400/20 mb-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Only one skill should be at rank 6 at creation.
          </div>
        )}

        <TooltipProvider delayDuration={200}>
        <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
          <div className="flex items-center gap-2 py-1 px-2 text-xs text-muted-foreground font-mono uppercase tracking-wider border-b border-border/50 mb-1">
            <span className="w-32 shrink-0">Skill</span>
            <span className="w-10 shrink-0 text-center">Untr?</span>
            <span className="w-16 shrink-0">Attr</span>
            <span className="w-[72px] shrink-0 text-center">Rating</span>
            <span className="flex-1">Spec / Expertise</span>
          </div>
          {skills.map((skill, i) => {
            const specs = SKILL_SPECIALIZATIONS[skill.name] || [];
            return (
            <div key={skill.name} className={cn(
              "flex items-center gap-2 py-1 px-2 rounded-sm",
              skill.rating > 0 && "bg-primary/5"
            )}>
              <span className="w-32 shrink-0 font-display text-sm tracking-wide">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 cursor-help">
                      {skill.name} <Info className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-64">{SKILL_DESCRIPTIONS[skill.name] || skill.name}</TooltipContent>
                </Tooltip>
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-mono w-10 shrink-0 text-center cursor-help text-muted-foreground">
                    {(SKILL_CAN_DEFAULT[skill.name] ?? true) ? "Yes" : "No"}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-64">
                  {(SKILL_CAN_DEFAULT[skill.name] ?? true)
                    ? "Can be attempted untrained, defaulting to the linked attribute."
                    : "Cannot be used without at least 1 rank."}
                </TooltipContent>
              </Tooltip>
              <span className="text-xs text-muted-foreground font-mono w-16 shrink-0 capitalize">
                {SR6_CORE_SKILLS[i]?.attribute}
              </span>
              <div className="flex items-center gap-1 mx-1.5">
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => adjustRating(i, -1)} disabled={skill.rating <= 0}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className={cn("font-mono text-sm w-6 text-center", skill.rating > 0 && "text-primary font-bold")}>
                  {skill.rating}
                </span>
                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => adjustRating(i, 1)} disabled={skill.rating >= 6 || remaining <= 0}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {skill.rating > 0 && specs.length > 0 && (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {skill.name === "Exotic Weapons" ? (
                    <>
                      <Input
                        list="exotic-specs"
                        placeholder="Spec..."
                        value={skill.specialization}
                        onChange={(e) => updateSkill(i, { specialization: e.target.value })}
                        className="h-7 text-xs font-mono flex-1 min-w-0"
                      />
                      <datalist id="exotic-specs">
                        {specs.map((s) => <option key={s} value={s} />)}
                      </datalist>
                      {skill.specialization && (
                        <>
                          <Input
                            list="exotic-expertise"
                            placeholder="Expertise..."
                            value={skill.expertise}
                            onChange={(e) => updateSkill(i, { expertise: e.target.value })}
                            className="h-7 text-xs font-mono w-32 shrink-0"
                          />
                          <datalist id="exotic-expertise">
                            {specs.filter((s) => s !== skill.specialization).map((s) => <option key={s} value={s} />)}
                          </datalist>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Select
                        value={skill.specialization || "__none__"}
                        onValueChange={(v) => updateSkill(i, { specialization: v === "__none__" ? "" : v })}
                      >
                        <SelectTrigger className="h-7 text-xs font-mono flex-1 min-w-0">
                          <SelectValue placeholder="Spec..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {specs.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {skill.specialization && (
                        <Select
                          value={skill.expertise || "__none__"}
                          onValueChange={(v) => updateSkill(i, { expertise: v === "__none__" ? "" : v })}
                        >
                          <SelectTrigger className="h-7 text-xs font-mono w-32 shrink-0">
                            <SelectValue placeholder="Expertise..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {specs
                              .filter((s) => s !== skill.specialization)
                              .map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )})}
        </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
