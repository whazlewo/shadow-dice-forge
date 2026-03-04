import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronDown, ChevronRight, Pencil, Check } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { SR6Attributes, SR6Skill, SR6Quality, SR6Augmentation, SR6Gear, DicePoolBreakdown } from "@/types/character";
import { SR6_CORE_SKILLS } from "@/types/character";
import { v4 } from "@/lib/uuid";
import { skillKarmaCost, SPECIALIZATION_KARMA_COST, EXPERTISE_KARMA_COST } from "@/lib/karma";

interface Props {
  skills: SR6Skill[];
  attributes: SR6Attributes;
  qualities: SR6Quality[];
  augmentations: SR6Augmentation[];
  gear: SR6Gear[];
  onUpdate: (skills: SR6Skill[], karmaInfo?: { description: string; cost: number; field: string }) => void;
}

function calculateDicePool(
  skill: SR6Skill,
  attributes: SR6Attributes,
  qualities: SR6Quality[],
  augmentations: SR6Augmentation[],
  gear: SR6Gear[]
): DicePoolBreakdown {
  const attrValue = Number(attributes[skill.attribute]) || 0;
  const modifiers: { source: string; value: number }[] = [];

  qualities.forEach((q) => {
    q.dice_modifiers?.forEach((mod) => {
      if (!mod.skill || mod.skill === skill.name) {
        modifiers.push({ source: `Quality: ${q.name}`, value: mod.value });
      }
    });
  });

  augmentations.forEach((aug) => {
    aug.dice_modifiers?.forEach((mod) => {
      if (!mod.skill || mod.skill === skill.name) {
        modifiers.push({ source: `Aug: ${aug.name}`, value: mod.value });
      }
    });
  });

  gear.forEach((g) => {
    g.dice_modifiers?.forEach((mod) => {
      if (!mod.skill || mod.skill === skill.name) {
        modifiers.push({ source: `Gear: ${g.name}`, value: mod.value });
      }
    });
  });

  const total = attrValue + skill.rating + modifiers.reduce((sum, m) => sum + m.value, 0);

  return {
    skill_name: skill.name,
    attribute_name: skill.attribute,
    attribute_value: attrValue,
    skill_rating: skill.rating,
    modifiers,
    total: Math.max(0, total),
  };
}

function ReadOnlySkillRow({ skill, pool }: { skill: SR6Skill; pool: DicePoolBreakdown }) {
  const hasExtras = !!(skill.specialization || skill.expertise);
  return (
    <div className="flex flex-col gap-0.5 px-2 py-1.5 rounded-md bg-muted/30">
      <div className="flex items-center gap-3">
        <span className="font-display tracking-wider text-xs w-40 truncate">{skill.name}</span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {pool.skill_rating} + {pool.attribute_value}
          <span className="uppercase ml-0.5">({pool.attribute_name.slice(0, 3)})</span>
        </span>
        <span className="ml-auto font-mono text-sm font-bold text-primary neon-glow-cyan">{pool.total}d6</span>
      </div>
      {hasExtras && (
        <div className="flex items-center gap-1.5 ml-1">
          {skill.specialization && (
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-mono">
              Spec: {skill.specialization} +2
            </span>
          )}
          {skill.expertise && (
            <span className="inline-flex items-center rounded-full bg-accent/50 text-accent-foreground px-2 py-0.5 text-[10px] font-mono">
              Exp: {skill.expertise} +3
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function SkillsTab({ skills, attributes, qualities, augmentations, gear, onUpdate }: Props) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const addSkill = () => {
    const firstAvailable = SR6_CORE_SKILLS.find((s) => !skills.some((sk) => sk.name === s.name));
    const newSkill: SR6Skill = {
      id: v4(),
      name: firstAvailable?.name || "Custom Skill",
      attribute: firstAvailable?.attribute || "agility",
      rating: 0,
    };
    onUpdate([...skills, newSkill]);
  };

  const updateSkill = (index: number, updates: Partial<SR6Skill>) => {
    const oldSkill = skills[index];
    const updated = [...skills];
    updated[index] = { ...updated[index], ...updates };

    // Check if rating increased (costs karma)
    if (updates.rating !== undefined && updates.rating > oldSkill.rating) {
      const cost = skillKarmaCost(updates.rating);
      onUpdate(updated, {
        description: `Raise ${oldSkill.name} ${oldSkill.rating}→${updates.rating} (${updates.rating} × 5)`,
        cost,
        field: `skills[${oldSkill.id}].rating`,
      });
      return;
    }

    // Check if specialization was added
    if (updates.specialization !== undefined && updates.specialization !== "" && !oldSkill.specialization) {
      onUpdate(updated, {
        description: `Add specialization "${updates.specialization}" to ${oldSkill.name}`,
        cost: SPECIALIZATION_KARMA_COST,
        field: `skills[${oldSkill.id}].specialization`,
      });
      return;
    }

    // Check if expertise was added
    if (updates.expertise !== undefined && updates.expertise !== "" && !oldSkill.expertise) {
      onUpdate(updated, {
        description: `Add expertise "${updates.expertise}" to ${oldSkill.name}`,
        cost: EXPERTISE_KARMA_COST,
        field: `skills[${oldSkill.id}].expertise`,
      });
      return;
    }

    // No karma cost (decrease, removal, name change, etc.)
    onUpdate(updated);
  };

  const removeSkill = (index: number) => {
    onUpdate(skills.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display tracking-wider">SKILLS</CardTitle>
        <div className="flex items-center gap-1">
          {editing && (
            <Button variant="outline" size="sm" onClick={addSkill}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Skill
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(!editing)}>
            {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {skills.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">No skills added yet.</p>
        )}

        {!editing
          ? skills.map((skill) => {
              const pool = calculateDicePool(skill, attributes, qualities, augmentations, gear);
              return <ReadOnlySkillRow key={skill.id} skill={skill} pool={pool} />;
            })
          : skills.map((skill, index) => {
              const pool = calculateDicePool(skill, attributes, qualities, augmentations, gear);
              const isExpanded = expandedSkill === skill.id;

              return (
                <Collapsible key={skill.id} open={isExpanded} onOpenChange={() => setExpandedSkill(isExpanded ? null : skill.id)}>
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </Button>
                    </CollapsibleTrigger>

                    <Select
                      value={skill.name}
                      onValueChange={(v) => {
                        const match = SR6_CORE_SKILLS.find((s) => s.name === v);
                        updateSkill(index, { name: v, attribute: match?.attribute || skill.attribute });
                      }}
                    >
                      <SelectTrigger className="w-40 h-8 text-xs font-display tracking-wider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SR6_CORE_SKILLS.map((s) => (
                          <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      value={skill.rating}
                      onChange={(e) => updateSkill(index, { rating: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-16 h-8 text-center font-mono text-sm"
                      min={0}
                    />

                    <div className="ml-auto flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary neon-glow-cyan">
                        {pool.total}d6
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeSkill(index)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <CollapsibleContent className="ml-8 mt-1 mb-2">
                    <div className="rounded-md bg-muted/20 p-3 space-y-1 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Attribute ({pool.attribute_name.toUpperCase()})</span>
                        <span className="text-primary">+{pool.attribute_value}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Skill Rating</span>
                        <span className="text-primary">+{pool.skill_rating}</span>
                      </div>
                      {pool.modifiers.map((mod, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground">{mod.source}</span>
                          <span className={mod.value >= 0 ? "text-neon-green" : "text-destructive"}>
                            {mod.value >= 0 ? "+" : ""}{mod.value}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-border pt-1 mt-1 font-bold">
                        <span>Total Dice Pool</span>
                        <span className="text-primary neon-glow-cyan">{pool.total}d6</span>
                      </div>
                    </div>

                    {(() => {
                      const skillDef = SR6_CORE_SKILLS.find((s) => s.name === skill.name);
                      const specs = skillDef?.specializations || [];
                      const isExotic = skill.name === "Exotic Weapons";

                      return (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Specialization (+2)</Label>
                            {isExotic || specs.length === 0 ? (
                              <Input
                                value={skill.specialization || ""}
                                onChange={(e) => updateSkill(index, { specialization: e.target.value })}
                                className="h-7 text-xs"
                                placeholder="None"
                              />
                            ) : (
                              <Select
                                value={skill.specialization || "__none__"}
                                onValueChange={(v) => updateSkill(index, { specialization: v === "__none__" ? "" : v })}
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">None</SelectItem>
                                  {specs.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Expertise (+3)</Label>
                            {isExotic || specs.length === 0 ? (
                              <Input
                                value={skill.expertise || ""}
                                onChange={(e) => updateSkill(index, { expertise: e.target.value })}
                                className="h-7 text-xs"
                                placeholder="None"
                              />
                            ) : (
                              <Select
                                value={skill.expertise || "__none__"}
                                onValueChange={(v) => updateSkill(index, { expertise: v === "__none__" ? "" : v })}
                              >
                                <SelectTrigger className="h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">None</SelectItem>
                                  {specs.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
      </CardContent>
    </Card>
  );
}
