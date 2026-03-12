// Magic reference data - imported from YAML at build time
// Edit src/data/magic/*.yaml to add or modify spells, adept powers, complex forms

import type { ReferenceSpell, ReferenceAdeptPower, ReferenceComplexForm } from "@/types/magic-reference";

import spells from "./magic/spells.yaml";
import adeptPowers from "./magic/adept-powers.yaml";
import complexForms from "./magic/complex-forms.yaml";

export const SPELL_REFERENCE = spells as ReferenceSpell[];
export const ADEPT_POWER_REFERENCE = adeptPowers as ReferenceAdeptPower[];
export const COMPLEX_FORM_REFERENCE = complexForms as ReferenceComplexForm[];
