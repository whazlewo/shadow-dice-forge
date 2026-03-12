import type { ReferenceQuality } from "@/types/quality-reference";
import type { SR6Quality, WizardQuality } from "@/types/character";

export function referenceToCharacterQuality(ref: ReferenceQuality): SR6Quality {
  return {
    id: crypto.randomUUID(),
    name: ref.name,
    type: ref.type,
    karma_cost: ref.karma_cost,
    effects: ref.effects,
    description: ref.description,
  };
}

export function referenceToWizardQuality(ref: ReferenceQuality): WizardQuality {
  return {
    id: crypto.randomUUID(),
    name: ref.name,
    type: ref.type,
    karma_cost: ref.karma_cost,
    effects: ref.effects,
    description: ref.description,
  };
}
