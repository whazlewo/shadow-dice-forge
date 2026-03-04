

## Plan: Clean Up Augmentations/Gear Item UI

The current item editor in `GenericListTab` is a flat wall of inputs — field labels, descriptions, effects, and dice modifiers all run together in one `bg-muted/30` block with no visual hierarchy. Here's how to fix it.

### Problems
1. **No grouping** — core fields, description, effects, and dice modifiers all blend together
2. **Everything inline** — the flat `flex-wrap` layout makes it hard to scan
3. **Section labels are tiny** — "Effects" and "Dice Modifiers" headers don't stand out
4. **Effects Editor layout** — the special stats (Initiative Bonus, Initiative Dice, DR) are in a horizontal row of label+input pairs that's hard to parse at a glance

### Changes

**1. `GenericListTab.tsx` — Add visual sections with collapsible grouping**

Restructure each item's edit card into clear visual sections separated by subtle dividers:

```text
┌─────────────────────────────────────────┐
│ ☑ [Name________] [Type ▼] [Essence___]  │  ← Core fields row
│   [Rating______] [Effects_____________]  │
├─────────────────────────────────────────┤
│ Description                              │  ← Textarea, slightly indented
│ [_____________________________________] │
├─────────────────────────────────────────┤
│ ⚡ EFFECTS                              │  ← Bordered subsection
│  Initiative +2  |  Init Dice +2  |  DR 0│
│  + Reaction +2                           │
├─────────────────────────────────────────┤
│ 🎲 SKILL MODIFIERS                      │  ← Bordered subsection
│  Firearms +2 (requires Smartgun)         │
└─────────────────────────────────────────┘
```

- Wrap Description, Effects, and Dice Modifiers in visually distinct sub-panels with `border-l-2 border-primary/20 pl-3` left-accent styling
- Add a `Separator` between sections
- Give each section a small bold header label

**2. `EffectsEditor.tsx` — Redesign for scanability**

- Replace the horizontal `flex-wrap` row of special stats with a **compact grid** (3 columns on desktop, stacked on mobile)
- Each special stat gets a small card-like cell: label on top, value below
- Attribute bonuses render as pill-style tags: `Reaction +2` with an X to remove
- "Add Attribute Bonus" becomes a small inline dropdown+value that appears on click

**3. `DiceModifierEditor.tsx` — Minor visual cleanup**

- Add left-accent border consistent with Effects section
- Existing modifiers render as readable pills: `Firearms +2 (req: Smartgun)` in read-friendly format with edit-on-click

### Files Changed
- `src/components/character/GenericListTab.tsx` — section dividers and sub-panel layout
- `src/components/character/EffectsEditor.tsx` — grid layout for special stats, pill-style attribute bonuses
- `src/components/character/DiceModifierEditor.tsx` — consistent styling with effects section

### What stays the same
- All data structures unchanged
- All save/merge logic unchanged
- Same props API on all components

