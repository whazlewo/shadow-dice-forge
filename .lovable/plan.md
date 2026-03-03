

## Problem

The character sheet currently shows final attribute values with no visibility into how they were calculated. The wizard computes attributes as `base (1) + adjustment points + attribute points + karma raises`, but this breakdown is **not saved** to the character record — only the final number is persisted. Gear/augmentation `dice_modifiers` exist but target skills, not attributes directly.

## Plan

### 1. Persist attribute breakdown data during character creation

Add an `attribute_sources` JSONB column to the `characters` table via migration. When the wizard finalizes a character, save the breakdown alongside the flat attributes:

```ts
// Structure saved per attribute:
{
  body: { base: 1, adjustment: 2, attribute_points: 3, karma: 1 },
  agility: { base: 1, adjustment: 0, attribute_points: 4, karma: 0 },
  // ... etc
}
```

### 2. Update the wizard finalization to persist sources

In `CharacterWizard.tsx`, when inserting the character, also compute and save the `attribute_sources` object from `state.adjustmentPoints`, `state.attributes`, and `state.karmaSpend`.

### 3. Add a new TypeScript type for attribute sources

In `types/character.ts`:
```ts
export interface AttributeSource {
  base: number;
  adjustment: number;
  attribute_points: number;
  karma: number;
}
export type AttributeSources = Partial<Record<keyof SR6CoreAttributes, AttributeSource>>;
```

### 4. Add info tooltips to ALL attributes in `AttributesTab`

- Pass `attributeSources` (from character data) plus `augmentations` and `gear` into the component.
- For **base attributes** (body, agility, etc.): show a tooltip breakdown like:
  ```
  Base: 1
  Metatype Adj: +2
  Attr Points: +3
  Karma: +1
  Total: 7
  ```
- For **Edge, Essence, Magic/Resonance**: similar breakdown from sources.
- For **derived stats** (already have tooltips): keep the existing formula tooltips.
- For **gear modifiers on attributes**: scan `augmentations` and `gear` for `dice_modifiers` that target attributes and include them in the tooltip.

### 5. Wire it up in `CharacterSheet.tsx`

Pass the new `attribute_sources`, `augmentations`, and `gear` data to `AttributesTab` so it has everything needed for the breakdown tooltips.

### Technical notes

- The database migration adds a nullable JSONB column `attribute_sources` — backward-compatible with existing characters (they'll just show the total without breakdown).
- For characters without source data, the tooltip will show "Total: X" with no breakdown.
- The `DiceModifier` type already has an `attribute` field, so gear that modifies attributes can be detected.

