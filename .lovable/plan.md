

## Add Weapon Subtype for Specialization-Aware Dice Pools

### Problem
Weapons don't carry a subtype (e.g., "Pistols (Heavy)", "Shotguns", "Blades") so the dice pool calculator can't check if the character's specialization applies for the +2 bonus.

### Changes

**1. Add `subtype` field to weapon types** (`src/types/character.ts`)
- Add optional `subtype?: string` to `SR6RangedWeapon` and `SR6MeleeWeapon`
- This stores the Firearms/Close Combat specialization category (e.g., "Pistols (Heavy)", "Blades")

**2. Add subtype dropdown to weapon editing** (`src/components/character/GenericListTab.tsx`)
- For ranged weapons: show a `<Select>` populated with Firearms specializations from `SR6_CORE_SKILLS`
- For melee weapons: show a `<Select>` populated with Close Combat specializations
- Allow free-text fallback for custom subtypes

**3. Extract `calculateDicePool` to shared utility** (`src/lib/dice-pool.ts`)
- Move the function from `SkillsTab.tsx` into a shared module
- Update `SkillsTab.tsx` to import from there

**4. Add dice pool display to `EquippedGearTab`** (`src/components/character/EquippedGearTab.tsx`)
- Accept `skills`, `attributes`, `qualities`, `augmentations`, `gear` as props
- For each ranged weapon: look up the "Firearms" skill, compute base pool, then check if `weapon.subtype` matches the skill's `specialization` (+2) or `expertise` (+3)
- For each melee weapon: same logic with "Close Combat" skill
- Display as a "Pool" `StatPill` with tooltip breakdown showing attribute + skill + spec/exp + modifiers

**5. Pass props from `CharacterSheet.tsx`**
- Add the additional props to the `EquippedGearTab` call

**6. Map subtype during wizard finalization** (`src/pages/CharacterWizard.tsx`)
- No change needed — subtypes don't exist in wizard gear currently; users will set them on the character sheet

### Tooltip Breakdown Example
```
Agility          6
Firearms         5
Spec: Heavy P.  +2
Total          13d6
```

