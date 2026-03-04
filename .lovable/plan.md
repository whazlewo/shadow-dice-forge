

## Equipped Weapons & Armor — Readability Redesign

### Current Problems
1. **Flat hierarchy** — Every item is the same `bg-muted/30` box with no visual distinction between weapon categories (ranged vs melee vs armor)
2. **Stat pills blend together** — Tiny 9px labels on muted backgrounds, all the same color, making it hard to scan for the number you need
3. **Weapon name is too small** — `text-sm` with no weight difference from surrounding content
4. **No section grouping** — Ranged, melee, and armor items are just stacked with no headers or dividers
5. **Description shoved into a 2-col grid** — The `md:grid-cols-2` layout splits name/stats from description awkwardly

### Proposed Changes — `EquippedGearTab.tsx`

**1. Add category sub-headers with icons**
- When there are ranged weapons, show a small `RANGED WEAPONS` label before them; same for `MELEE WEAPONS` and `ARMOR`
- Uses the existing icon (Crosshair/Sword/Shield) + uppercase label, styled as a separator row
- Removes the per-item icon (redundant once grouped)

**2. Improve weapon name prominence**
- Bump name to `text-sm font-semibold` with `text-foreground` (currently inherits muted tones)
- Add weapon subtype as a subtle tag next to the name (e.g., "Ares Predator VI" `Pistols`)

**3. Color-code stat pills by purpose**
- **DV**: Use a subtle red/destructive tint (`bg-destructive/15 text-destructive`)
- **AR**: Keep neutral (`bg-muted/50`)
- **Pool**: Use primary/cyan tint (`bg-primary/15 text-primary`)
- **DR** (armor): Use a blue/shield tint
- This lets users scan by color — damage is warm, defense is cool, pool is cyan

**4. Increase stat pill font sizes**
- Label: `text-[10px]` (up from 9px)
- Value: `text-sm font-bold` (up from `text-xs`)

**5. Switch to single-column layout**
- Drop the `md:grid-cols-2` split; use full-width rows instead
- Description moves below stats as a full-width line (if present)
- Accessories render on their own line beneath stats

**6. Add left accent border per category**
- Ranged items get a `border-l-2 border-primary` (cyan)
- Melee items get a `border-l-2 border-secondary` (magenta)  
- Armor items get a `border-l-2 border-neon-green` or similar distinct color
- Creates instant visual grouping

### Visual Structure (per item)
```text
┌─ border-l-2 (color by type) ─────────────────────┐
│  Ares Predator VI          [Pistols]              │
│  [DV 3P] [AR 9/11/8/—/—] [SA/BF] [Ammo 15] [12d6]│
│  ┊ Smartlink · +1 DV, min STR 5                   │
│  A heavy pistol favored by...                      │
└───────────────────────────────────────────────────-─┘
```

### File Changes
- **`src/components/character/EquippedGearTab.tsx`** — All changes in this single file:
  - Update `StatPill` to accept an optional `variant` prop for color tinting
  - Add category sub-header rendering logic before each weapon group
  - Restructure item layout to single-column with left border accent
  - Bump font sizes for name and stat values
  - Remove `md:grid-cols-2` grid in favor of stacked layout

