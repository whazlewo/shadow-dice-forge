import type { SR6Attributes, SR6Skill, SR6Quality, SR6Augmentation, SR6Gear, DicePoolBreakdown } from "@/types/character";

export function calculateDicePool(
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

/**
 * Calculate the weapon dice pool including specialization/expertise bonuses.
 */
export function calculateWeaponPool(
  skillName: string,
  weaponSubtype: string | undefined,
  attributes: SR6Attributes,
  skills: SR6Skill[],
  qualities: SR6Quality[],
  augmentations: SR6Augmentation[],
  gear: SR6Gear[]
): DicePoolBreakdown {
  const skill = skills.find((s) => s.name === skillName);
  const effectiveSkill: SR6Skill = skill || {
    id: "",
    name: skillName,
    attribute: "agility",
    rating: 0,
  };

  const base = calculateDicePool(effectiveSkill, attributes, qualities, augmentations, gear);

  // Check specialization / expertise match
  if (weaponSubtype && skill) {
    if (skill.specialization && skill.specialization === weaponSubtype) {
      base.modifiers.push({ source: `Spec: ${skill.specialization}`, value: 2 });
      base.total = Math.max(0, base.total + 2);
    }
    if (skill.expertise && skill.expertise === weaponSubtype) {
      base.modifiers.push({ source: `Exp: ${skill.expertise}`, value: 3 });
      base.total = Math.max(0, base.total + 3);
    }
  }

  return base;
}
