## Plan: Dedicated Effect Fields on Augmentations and Gear

### Problem

Currently, attribute bonuses (+1 Body), initiative dice (+2D6), and defense rating changes from augmentations/gear are configured through the generic `DiceModifierEditor`, which is designed for skill pool modifiers. Users have to know to set `attribute: "initiative_dice"` or `attribute: "defense_rating"` — unintuitive and error-prone.

### Current State

The system already reads `dm.attribute` values like `"defense_rating"`, `"initiative_dice"`, and `"initiative"` from `DiceModifier[]` via `collectDiceModifiers` in `AttributesTab.tsx`. The plumbing works; the UX for setting these values is the problem.

### Approach

Add a dedicated **"Effects"** editor component that provides labeled, purpose-built fields for common augmentation/gear effects. This sits alongside (not replacing) the existing `DiceModifierEditor`, which remains for skill pool modifiers.

### Changes

**1. New component: `src/components/character/EffectsEditor.tsx**`
A compact editor with explicit fields for:

- **Attribute Bonuses** — dropdown (Body, Agility, Reaction, etc.) + numeric value. Writes to `dice_modifiers` with `attribute: "body"`, etc.
- **Initiative Bonus** — numeric field for flat bonus to initiative score. Writes `attribute: "initiative"`.
- **Initiative Dice** — numeric field for extra D6s. Writes `attribute: "initiative_dice"`.
- **Defense Rating** — numeric field. Writes `attribute: "defense_rating"`.

Under the hood, it reads/writes the same `DiceModifier[]` array, just filtering by whether `dm.attribute` is set (effects) vs `dm.skill` (skill pool modifiers). This means no data model changes and full backward compatibility.

**2. Update `GenericListTab.tsx**`

- Add a `showEffects?: boolean` prop.
- When true, render `<EffectsEditor>` between the description and the `DiceModifierEditor`.

**3. Update `CharacterSheet.tsx**`

- Pass `showEffects={true}` on the Augmentations and Gear tabs.

**4. Update `DiceModifierEditor.tsx**`

- Filter out modifiers where `attribute` is set (those belong to the EffectsEditor), so the two editors don't show duplicates.

### Technical Detail

The `EffectsEditor` component manages a subset of the item's `dice_modifiers` array:

```text
dice_modifiers: [
  { attribute: "reaction", value: 1, source: "..." },       ← EffectsEditor
  { attribute: "initiative_dice", value: 2, source: "..." }, ← EffectsEditor  
  { skill: "Firearms", value: 2, requires_accessory: "..." } ← DiceModifierEditor
]
```

Both editors call the same `onChange(modifiers)` but each only touches its own subset, merging back on save.

### What This Does NOT Change

- No database migration needed — same `DiceModifier[]` structure in JSONB.
- No changes to `collectDiceModifiers` or `computeDerived` — they already read these attribute keys.
- `DiceModifierEditor` still works for skill pool modifiers.