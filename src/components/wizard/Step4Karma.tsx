import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITY_TABLE, formatNuyen, type PriorityLevel } from "@/data/sr6-reference";
import { SR6_CORE_SKILLS } from "@/types/character";
import { MagicReferenceSelect } from "@/components/MagicReferenceSelect";
import type { WizardState } from "@/pages/CharacterWizard";
import type { SR6Spell } from "@/types/character";

interface Props {
  state: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
}

const KARMA_PER_ATTR_POINT = 5;
const KARMA_PER_SKILL_POINT = 5;
const KARMA_PER_SPEC = 5;
const KARMA_PER_MAGIC_ITEM = 5;
const KARMA_PER_2000_NUYEN = 1;
const KARMA_PER_KNOWLEDGE_SKILL = 3;
const BASE_KARMA = 50;

export default function Step4Karma({ state, onChange }: Props) {
  const karmaSpend = state.karmaSpend || {};
  const magicChoice = state.magicChoice;
  const magicPriority = state.priorities.magic_resonance as PriorityLevel | undefined;
  const magicEntry = magicPriority && magicChoice
    ? PRIORITY_TABLE[magicPriority]?.magic_resonance.find((o) => o.type === magicChoice)
    : null;
  const magicRating =
    (magicEntry?.magicOrResonance ?? 0) +
    (magicChoice === "technomancer" ? (state.adjustmentPoints?.resonance ?? 0) : (state.adjustmentPoints?.magic ?? 0));

  const karmaSpendSpells = state.karmaSpendSpells ?? [];
  const karmaSpendPowerPoints = state.karmaSpendPowerPoints ?? 0;
  const karmaSpendSpecializations = state.karmaSpendSpecializations ?? {};
  const karmaSpendNuyen = state.karmaSpendNuyen ?? 0;
  const knowledgeSkillsFree = state.knowledgeSkillsFree ?? [];
  const karmaSpendKnowledgeSkills = state.karmaSpendKnowledgeSkills ?? [];

  // Karma from negative qualities
  const negativeKarma = (state.wizardQualities || [])
    .filter((q) => q.type === "negative")
    .reduce((sum, q) => sum + q.karma_cost, 0);
  const positiveKarma = (state.wizardQualities || [])
    .filter((q) => q.type === "positive")
    .reduce((sum, q) => sum + q.karma_cost, 0);
  const qualityNet = negativeKarma - positiveKarma;

  const totalKarma = BASE_KARMA + qualityNet;
  const karmaFromAttrsAndSkills = Object.values(karmaSpend).reduce((sum, v) => sum + (v || 0), 0);
  const karmaFromMagic =
    karmaSpendSpells.length * KARMA_PER_MAGIC_ITEM +
    karmaSpendPowerPoints * KARMA_PER_MAGIC_ITEM;
  const karmaFromSpecs = Object.keys(karmaSpendSpecializations).length * KARMA_PER_SPEC;
  const karmaFromNuyen = karmaSpendNuyen * KARMA_PER_2000_NUYEN;
  const karmaFromKnowledgeSkills = karmaSpendKnowledgeSkills.length * KARMA_PER_KNOWLEDGE_SKILL;
  const spentKarma = karmaFromAttrsAndSkills + karmaFromMagic + karmaFromSpecs + karmaFromNuyen + karmaFromKnowledgeSkills;
  const remainingKarma = totalKarma - spentKarma;

  const setSpend = (key: string, value: number) => {
    onChange({ karmaSpend: { ...karmaSpend, [key]: Math.max(0, value) } });
  };

  const attrKeys = ["body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma"] as const;

  const isSpellcaster = magicChoice === "full" || magicChoice === "aspected" || magicChoice === "mystic_adept";
  const isMysticAdept = magicChoice === "mystic_adept";

  const addKarmaSpell = (spell: SR6Spell) => {
    if (remainingKarma < KARMA_PER_MAGIC_ITEM) return;
    onChange({ karmaSpendSpells: [...karmaSpendSpells, spell] });
  };

  const removeKarmaSpell = (index: number) => {
    onChange({ karmaSpendSpells: karmaSpendSpells.filter((_, i) => i !== index) });
  };

  const addKarmaSpec = (skillName: string, specName: string) => {
    if (remainingKarma < KARMA_PER_SPEC) return;
    onChange({ karmaSpendSpecializations: { ...karmaSpendSpecializations, [skillName]: specName } });
  };

  const removeKarmaSpec = (skillName: string) => {
    const next = { ...karmaSpendSpecializations };
    delete next[skillName];
    onChange({ karmaSpendSpecializations: next });
  };

  // Logic attribute for free knowledge skill slots
  const baseLogic = (state.attributes.logic || 1) + (state.adjustmentPoints?.logic || 0);
  const logicKarmaRaises = Math.floor((karmaSpend.attr_logic || 0) / KARMA_PER_ATTR_POINT);
  const logicAttr = baseLogic + logicKarmaRaises;

  const adjustKarmaNuyen = (delta: number) => {
    const current = karmaSpendNuyen;
    const newVal = current + delta;
    if (newVal < 0) return;
    if (delta > 0 && remainingKarma < KARMA_PER_2000_NUYEN) return;
    onChange({ karmaSpendNuyen: newVal });
  };

  const addKarmaKnowledgeSkill = () => {
    if (remainingKarma < KARMA_PER_KNOWLEDGE_SKILL) return;
    onChange({ karmaSpendKnowledgeSkills: [...karmaSpendKnowledgeSkills, ""] });
  };

  const updateKarmaKnowledgeSkill = (index: number, name: string) => {
    const next = [...karmaSpendKnowledgeSkills];
    next[index] = name;
    onChange({ karmaSpendKnowledgeSkills: next });
  };

  const removeKarmaKnowledgeSkill = (index: number) => {
    onChange({ karmaSpendKnowledgeSkills: karmaSpendKnowledgeSkills.filter((_, i) => i !== index) });
  };

  const updateKnowledgeSkillFree = (index: number, name: string) => {
    const next = [...knowledgeSkillsFree];
    while (next.length <= index) next.push("");
    next[index] = name;
    onChange({ knowledgeSkillsFree: next.slice(0, logicAttr) });
  };

  const mysticAdeptPPMax = magicRating;
  const adjustKarmaPP = (delta: number) => {
    const current = karmaSpendPowerPoints;
    const newVal = current + delta;
    if (newVal < 0) return;
    if (newVal > mysticAdeptPPMax) return;
    if (delta > 0 && remainingKarma < KARMA_PER_MAGIC_ITEM) return;
    onChange({ karmaSpendPowerPoints: newVal });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg tracking-wide">Customization Karma</CardTitle>
          <p className="text-sm text-muted-foreground">
            Spend karma to raise attributes (5/point), skills (5/point), specializations (5 each), nuyen (1 karma = 2,000¥), knowledge skills (3 each), and optionally purchase additional spells or power points (5 karma each).
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 text-sm font-mono flex-wrap">
            <Badge variant="outline">Base: {BASE_KARMA}</Badge>
            <Badge variant="outline" className={qualityNet >= 0 ? "text-emerald-400 border-emerald-400/30" : "text-amber-400 border-amber-400/30"}>
              Qualities: {qualityNet >= 0 ? "+" : ""}{qualityNet}
            </Badge>
            <Badge variant="outline">Total: {totalKarma}</Badge>
            <Badge variant="outline" className="text-primary border-primary/30">
              Remaining: {remainingKarma}
            </Badge>
          </div>

          {/* Attributes */}
          <div>
            <Label className="font-display tracking-wide text-sm mb-3 block">Attribute Raises</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {attrKeys.map((attr) => {
                const baseVal = (state.attributes[attr] || 1) + (state.adjustmentPoints?.[attr] || 0);
                const karmaPoints = karmaSpend[`attr_${attr}`] || 0;
                const karmaRaises = Math.floor(karmaPoints / KARMA_PER_ATTR_POINT);

                return (
                  <div key={attr} className="flex items-center gap-2 rounded-md border border-border/30 px-3 py-2 bg-card/40">
                    <span className="text-xs font-display tracking-wide uppercase flex-1">{attr}</span>
                    <span className="font-mono text-sm text-muted-foreground">{baseVal}</span>
                    {karmaRaises > 0 && (
                      <span className="font-mono text-sm text-primary">+{karmaRaises}</span>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={karmaPoints <= 0}
                        onClick={() => setSpend(`attr_${attr}`, karmaPoints - KARMA_PER_ATTR_POINT)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={remainingKarma < KARMA_PER_ATTR_POINT}
                        onClick={() => setSpend(`attr_${attr}`, karmaPoints + KARMA_PER_ATTR_POINT)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skills - show all skills so user can buy from 0 */}
          <div>
            <Label className="font-display tracking-wide text-sm mb-3 block">Skill Raises</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {state.skills.map((skill) => {
                const karmaPoints = karmaSpend[`skill_${skill.name}`] || 0;
                const karmaRaises = Math.floor(karmaPoints / KARMA_PER_SKILL_POINT);
                const effectiveRating = (skill.rating || 0) + karmaRaises;

                return (
                  <div key={skill.name} className="flex items-center gap-2 rounded-md border border-border/30 px-3 py-2 bg-card/40">
                    <span className="text-xs font-display tracking-wide flex-1">{skill.name}</span>
                    <span className="font-mono text-sm text-muted-foreground">{skill.rating}</span>
                    {karmaRaises > 0 && (
                      <span className="font-mono text-sm text-primary">+{karmaRaises}</span>
                    )}
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={karmaPoints <= 0}
                        onClick={() => setSpend(`skill_${skill.name}`, karmaPoints - KARMA_PER_SKILL_POINT)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6"
                        disabled={remainingKarma < KARMA_PER_SKILL_POINT || effectiveRating >= 6}
                        onClick={() => setSpend(`skill_${skill.name}`, karmaPoints + KARMA_PER_SKILL_POINT)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {state.skills.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2">No skills available. Go back to Priorities and assign skill points first.</p>
              )}
            </div>
          </div>

          {/* Specializations (5 karma each) */}
          <div>
            <Label className="font-display tracking-wide text-sm mb-3 block">Specializations (5 karma each)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Add a specialization to a skill with rating ≥ 1. Max one per skill.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {state.skills.map((skill) => {
                const karmaRaises = Math.floor((karmaSpend[`skill_${skill.name}`] || 0) / KARMA_PER_SKILL_POINT);
                const effectiveRating = (skill.rating || 0) + karmaRaises;
                const coreSkill = SR6_CORE_SKILLS.find((s) => s.name === skill.name);
                const specs = coreSkill?.specializations || [];

                if (effectiveRating < 1 || specs.length === 0) return null;
                if (skill.specialization) return null;

                const karmaSpec = karmaSpendSpecializations[skill.name];

                return (
                  <div key={skill.name} className="flex items-center gap-2 rounded-md border border-border/30 px-3 py-2 bg-card/40">
                    <span className="text-xs font-display tracking-wide flex-1">{skill.name}</span>
                    {karmaSpec ? (
                      <>
                        <span className="font-mono text-sm text-primary">{karmaSpec}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => removeKarmaSpec(skill.name)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Select
                        value="__none__"
                        onValueChange={(v) => v !== "__none__" && addKarmaSpec(skill.name, v)}
                        disabled={remainingKarma < KARMA_PER_SPEC}
                      >
                        <SelectTrigger className="h-7 text-xs font-mono flex-1 min-w-0">
                          <SelectValue placeholder="Add specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Add specialization</SelectItem>
                          {specs.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              })}
            </div>
            {Object.keys(karmaSpendSpecializations).length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {Object.keys(karmaSpendSpecializations).length} specialization{Object.keys(karmaSpendSpecializations).length !== 1 ? "s" : ""} ({Object.keys(karmaSpendSpecializations).length * KARMA_PER_SPEC} karma)
              </p>
            )}
          </div>

          {/* Resources (Nuyen) */}
          <div>
            <Label className="font-display tracking-wide text-sm mb-3 block">Resources (Nuyen)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              1 karma = 2,000¥. Spend karma to add nuyen to your gear budget.
            </p>
            <div className="flex items-center gap-2 rounded-md border border-border/30 px-3 py-2 bg-card/40 max-w-xs">
              <span className="text-xs font-display tracking-wide flex-1">Karma → Nuyen</span>
              <span className="font-mono text-sm text-muted-foreground">
                {karmaSpendNuyen} karma → {formatNuyen(karmaSpendNuyen * 2000)}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={karmaSpendNuyen <= 0}
                  onClick={() => adjustKarmaNuyen(-1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={remainingKarma < KARMA_PER_2000_NUYEN}
                  onClick={() => adjustKarmaNuyen(1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Knowledge Skills */}
          <div>
            <Label className="font-display tracking-wide text-sm mb-3 block">Knowledge Skills</Label>
            <p className="text-xs text-muted-foreground mb-2">
              You have {logicAttr} free knowledge skill{logicAttr !== 1 ? "s" : ""} (from Logic).
              {logicAttr > baseLogic && (
                <span className="block mt-1">
                  {logicAttr - baseLogic} additional slot{logicAttr - baseLogic !== 1 ? "s" : ""} from raising Logic with karma.
                </span>
              )}
              {" "}Karma-purchased knowledge skills cost 3 karma each.
            </p>
            <div className="space-y-3">
              {logicAttr > 0 && (
                <div>
                  <span className="text-xs font-display tracking-wide text-muted-foreground block mb-2">Free (from Logic)</span>
                  <div className="space-y-2">
                    {Array.from({ length: logicAttr }, (_, i) => (
                      <div key={`free-${i}`} className="flex items-center gap-2">
                        <Input
                          value={knowledgeSkillsFree[i] ?? ""}
                          onChange={(e) => updateKnowledgeSkillFree(i, e.target.value)}
                          placeholder={`Knowledge skill ${i + 1}`}
                          className="h-8 text-xs font-mono flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-display tracking-wide text-muted-foreground">Karma-purchased (3 karma each)</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={remainingKarma < KARMA_PER_KNOWLEDGE_SKILL}
                    onClick={addKarmaKnowledgeSkill}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
                {karmaSpendKnowledgeSkills.length > 0 && (
                  <ul className="space-y-2">
                    {karmaSpendKnowledgeSkills.map((name, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Input
                          value={name}
                          onChange={(e) => updateKarmaKnowledgeSkill(i, e.target.value)}
                          placeholder="Knowledge skill name"
                          className="h-8 text-xs font-mono flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive shrink-0"
                          onClick={() => removeKarmaKnowledgeSkill(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
                {karmaSpendKnowledgeSkills.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {karmaSpendKnowledgeSkills.length} karma-purchased ({karmaSpendKnowledgeSkills.length * KARMA_PER_KNOWLEDGE_SKILL} karma)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Magic Purchases */}
          {(isSpellcaster || isMysticAdept) && (
            <div>
              <Label className="font-display tracking-wide text-sm mb-3 block">Magic Purchases (5 karma each)</Label>
              <Card className="border-border/50 bg-card/60">
                <CardContent className="pt-4 space-y-4">
                  {isSpellcaster && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-display tracking-wide">Additional Spells</span>
                        <MagicReferenceSelect
                          category="spells"
                          onSelect={addKarmaSpell}
                          placeholder="Search spells…"
                          triggerLabel="Add spell"
                        />
                      </div>
                      {karmaSpendSpells.length > 0 && (
                        <ul className="space-y-2">
                          {karmaSpendSpells.map((s, i) => (
                            <li
                              key={s.id}
                              className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                            >
                              <span className="font-mono text-sm">{s.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => removeKarmaSpell(i)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {karmaSpendSpells.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {karmaSpendSpells.length} spell{karmaSpendSpells.length !== 1 ? "s" : ""} ({karmaSpendSpells.length * KARMA_PER_MAGIC_ITEM} karma)
                        </p>
                      )}
                    </div>
                  )}

                  {isMysticAdept && (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-display tracking-wide">Additional Power Points</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={karmaSpendPowerPoints <= 0}
                            onClick={() => adjustKarmaPP(-1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-mono text-sm w-8 text-center">{karmaSpendPowerPoints}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={remainingKarma < KARMA_PER_MAGIC_ITEM || karmaSpendPowerPoints >= mysticAdeptPPMax}
                            onClick={() => adjustKarmaPP(1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max {mysticAdeptPPMax} PP. {karmaSpendPowerPoints * KARMA_PER_MAGIC_ITEM} karma spent.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
