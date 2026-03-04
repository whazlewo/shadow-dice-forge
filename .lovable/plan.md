

## Show Accessory Notes Inline on Equipped Gear Tab

### Problem
Accessory notes (like "+1 DV") are currently only visible on hover via tooltips on the accessory badges. Users need a persistent visual reminder for important mechanical effects.

### Solution
Update the `AccessoryBadges` component in `EquippedGearTab.tsx` to display notes text inline next to (or beneath) each accessory badge when a note exists, rather than hiding it behind a tooltip.

### Changes

**`src/components/character/EquippedGearTab.tsx`** — Modify `AccessoryBadges`:
- When an accessory has `notes`, render the notes text as a small inline label next to the badge (e.g., `[Internal Gyro] +1 DV, min STR 5`)
- Keep the AR modifier in the tooltip since it's a formatted breakdown
- Display format: badge followed by notes in muted text, so it's always visible

