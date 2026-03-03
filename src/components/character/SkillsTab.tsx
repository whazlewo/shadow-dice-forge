import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { SR6Attributes, SR6Skill, SR6Quality, SR6Augmentation, SR6Gear, DicePoolBreakdown } from "@/types/character";
import { SR6_CORE_SKILLS } from "@/types/character";
import { v4 } from "@/lib/uuid";

interface Props {
  skills: SR6Skill[];
  attributes: SR6Attributes;
  qualities: SR6Quality[];
  augmentations: SR6Augmentation[];
  gear: SR6Gear[];
  onUpdate: (skills: SR6Skill[]) => void;
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

  // Quality modifiers
  qualities.forEach((q) => {
    q.dice_modifiers?.forEach((mod) => {
      if (!mod.skill || mod.skill === skill.name) {
        modifiers.push({ source: `Quality: ${q.name}`, value: mod.value });
      }
    });
  });

  // Augmentation modifiers
  augmentations.forEach((aug) => {
    aug.dice_modifiers?.forEach((mod) => {
      if (!mod.skill || mod.skill === skill.name) {
        modifiers.push({ source: `Aug: ${aug.name}`, value: mod.value });
      }
    });
  });

  // Gear modifiers
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

export function SkillsTab({ skills, attributes, qualities, augmentations, gear, onUpdate }: Props) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

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
    const updated = [...skills];
    updated[index] = { ...updated[index], ...updates };
    onUpdate(updated);
  };

  const removeSkill = (index: number) => {
    onUpdate(skills.filter((_, i) => i !== index));
  };

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display tracking-wider">SKILLS</CardTitle>
        <Button variant="outline" size="sm" onClick={addSkill}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Skill
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {skills.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-6">No skills added yet.</p>
        )}
        {skills.map((skill, index) => {
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

                {/* Specialization / Expertise */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Specialization (+2)</Label>
                    <Input
                      value={skill.specialization || ""}
                      onChange={(e) => updateSkill(index, { specialization: e.target.value })}
                      className="h-7 text-xs"
                      placeholder="None"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Expertise (+3)</Label>
                    <Input
                      value={skill.expertise || ""}
                      onChange={(e) => updateSkill(index, { expertise: e.target.value })}
                      className="h-7 text-xs"
                      placeholder="None"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}
