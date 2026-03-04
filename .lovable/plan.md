

## Improve Gear Tab Item Separation and Readability

The core problem: each item in a `GenericListTab` section (e.g., two augmentations) uses a subtle `border-border/40 bg-muted/20` card, which barely distinguishes items from each other or from the section background. The sub-sections (Description, Effects, Skill Modifiers) also blend together.

### Changes to `src/components/character/GenericListTab.tsx`

**1. Stronger item card separation**
- Increase item gap from `space-y-3` to `space-y-4`
- Give each item card a more visible border and slightly stronger background: `border-border/60 bg-muted/30` with a subtle left accent border (`border-l-2 border-l-primary/30`) so items have a clear visual anchor
- Add a small item index/name header strip at the top of each card with a slightly darker background to act as a visual "title bar"

**2. Collapsible sub-sections**
- Keep Description, Effects, and Skill Modifiers sections but replace the flat `<Separator>` dividers with visually distinct sub-section containers that have their own background tint and consistent padding
- Remove the redundant `<Separator />` elements — instead rely on spacing and background contrast between sub-sections

**3. Visual hierarchy improvements**
- Core fields row: slightly darker background strip (`bg-muted/40 rounded-t-lg`) to anchor the item identity
- Sub-sections (Description, Effects, Modifiers): use a consistent indented panel style with `bg-background/30 rounded-md mx-3 my-2 p-3` instead of the current border-left-only approach, making them read as distinct contained blocks
- Increase bottom padding on each item card to create breathing room before the next item

### Technical details

All changes are in one file: `src/components/character/GenericListTab.tsx`.

```text
Before (item structure):
┌─ border-border/40 bg-muted/20 ──────────────┐
│ [fields row]                                  │
│ ── separator ──                               │
│ │ Description (border-left only)              │
│ ── separator ──                               │
│ │ Effects (border-left only)                  │
│ ── separator ──                               │
│ │ Skill Modifiers (border-left only)          │
└───────────────────────────────────────────────┘
 (space-y-3)
┌─ border-border/40 bg-muted/20 ──────────────┐
│ ... next item ...                             │

After (item structure):
┌─ border-border/60 border-l-2 border-l-primary/40 ─┐
│▓▓ [fields row — bg-muted/40 rounded-t]         ▓▓│
│                                                    │
│  ┌─ Description ── bg-background/30 rounded ──┐   │
│  │ textarea                                    │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─ Effects ── bg-background/30 rounded ──────┐   │
│  │ initiative / dice / def rating / bonuses    │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─ Skill Modifiers ── bg-background/30 ──────┐   │
│  │ modifier pills                              │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
└────────────────────────────────────────────────────┘
 (space-y-5)
┌─ next item ...
```

Key class changes:
- Item wrapper: `rounded-lg border border-border/60 border-l-[3px] border-l-primary/40 bg-muted/20 overflow-hidden`
- Fields row: add `bg-muted/40` background
- Replace all `<Separator /> + border-l-2` patterns with `bg-background/30 rounded-md mx-3 mb-3 p-3` panels
- Container gap: `space-y-5` instead of `space-y-3`
- Add `pb-1` to item wrapper for bottom breathing room

