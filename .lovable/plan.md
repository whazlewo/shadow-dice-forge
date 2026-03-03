

## Refactor Character Wizard into 5 Steps

The current wizard has 5 tightly-scoped mechanical steps (Priorities, Metatype, Attributes, Skills, Magic). The new flow restructures these into a more narrative-driven process with 5 steps (the user listed 5 items, not 6):

```text
┌──────────────────────────────────────────────┐
│  Step 1: CONCEPT                             │
│  Name, role/archetype, backstory             │
├──────────────────────────────────────────────┤
│  Step 2: PRIORITIES                          │
│  Priority table + Metatype + Attributes +    │
│  Skills + Magic/Resonance (all stacked)      │
├──────────────────────────────────────────────┤
│  Step 3: QUALITIES                           │
│  Pick positive/negative qualities,           │
│  track karma cost budget                     │
├──────────────────────────────────────────────┤
│  Step 4: KARMA                               │
│  Spend 50 customization karma on raising     │
│  attributes, skills, buying more qualities   │
├──────────────────────────────────────────────┤
│  Step 5: GEAR                                │
│  Spend starting nuyen on weapons, armor,     │
│  gear, augmentations, vehicles               │
└──────────────────────────────────────────────┘
```

### Changes by file

**`src/pages/CharacterWizard.tsx`**
- Update `STEPS` to `["Concept", "Priorities", "Qualities", "Karma", "Gear"]`
- Extend `WizardState` with new fields: `role`, `backstory`, `wizardQualities` (array of quality objects with karma cost), `karmaSpend` (record tracking karma spent on attributes/skills), `purchasedGear` (array of gear items)
- Move `characterName` input out of Step1Priorities into the new Concept step
- Step 2 renders all five old step components stacked vertically (Priorities, Metatype, Attributes, Skills, Magic) in a single scrollable view
- Update `canProceed()` validation for each new step index
- Update `handleFinish` to include qualities, karma-adjusted values, and gear in the character insert

**`src/components/wizard/Step1Concept.tsx`** (new)
- Character name input (moved from old Step1Priorities)
- Role/archetype selector (dropdown or free text): Street Samurai, Decker, Rigger, Face, Mage, Shaman, Adept, Technomancer, etc.
- Backstory textarea
- Simple, lightweight step to set the character identity before mechanical choices

**`src/components/wizard/Step1Priorities.tsx`** (modify)
- Remove the character name input (moved to Concept)
- Otherwise unchanged -- still handles the priority table

**`src/components/wizard/Step2Priorities.tsx`** (new wrapper)
- A single scrollable component that stacks: `Step1Priorities`, `Step2Metatype`, `Step3Attributes`, `Step4Skills`, `Step5Magic` vertically with section dividers
- Each sub-section gets a collapsible header so users can focus on one area at a time
- This becomes the sole component rendered at step index 1

**`src/components/wizard/Step3Qualities.tsx`** (new)
- Reuses the quality structure from `SR6Quality` type
- Shows available positive and negative qualities with karma costs
- Running karma total display (SR6 gives 50 karma for qualities; positive cost karma, negative grant karma, net must stay within bounds)
- Add/remove qualities with name, type, karma cost, and effects fields

**`src/components/wizard/Step4Karma.tsx`** (new)
- Display remaining customization karma (50 base, minus what was spent on qualities)
- Sections to spend karma on: raising attributes (5 karma per point), raising skills (5 karma per point), buying contacts, improving Edge
- Running total of karma spent vs remaining
- Shows the current attribute/skill values from Step 2 as the baseline

**`src/components/wizard/Step5Gear.tsx`** (new)
- Display starting nuyen from Resources priority
- Categorized gear sections: Weapons, Armor, Electronics, Vehicles, Augmentations, Miscellaneous
- Each item has name, cost, quantity fields
- Running nuyen balance
- For now, free-form entry (not a full catalog) -- users type in gear names and costs

**`src/types/character.ts`**
- Add `WizardQuality` interface (name, type, karma_cost, effects)
- Add `WizardGearItem` interface (name, category, cost, quantity, notes)

### What stays the same
- All existing step components (Step1Priorities through Step5Magic) remain unchanged internally
- Draft auto-save/restore mechanism works as-is since `WizardState` is serialized to JSON
- The `WizardStepper` component works with any step count
- Database schema unchanged -- qualities and gear are already stored as JSON columns on the characters table

