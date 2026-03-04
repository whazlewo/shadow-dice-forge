

## Karma Tracking System

This is a significant feature. Here's how it could work within the existing architecture.

### Concept

A **karma ledger** — an array of transaction records stored alongside the character — that tracks every karma expenditure and refund. The Personal Data card shows a live summary (total earned, spent, available). When the user makes changes that cost karma (raising attributes, adding skills, buying qualities), a confirmation dialog appears. Transactions can be undone individually from a log view.

### Data Model Changes

**New JSONB column on `characters` table:** `karma_ledger`

```
karma_ledger: [
  { id, timestamp, type, description, amount, undone? }
]
```

- `type`: "earned" | "spent" | "refund"
- `amount`: always positive (sign determined by type)
- `undone`: boolean flag — soft-delete so the history is preserved
- Example: `{ id: "abc", timestamp: "...", type: "spent", description: "Raise Body 3→4 (15 karma)", amount: 15 }`

**Update `SR6PersonalInfo`**: Replace the manually-edited `karma` / `total_karma` fields with computed values derived from the ledger. Add a `total_karma` seed value (set during character creation) that represents the starting budget.

### Karma Cost Rules (SR6)

These are the actions on the character sheet that cost karma:

| Action | Cost |
|--------|------|
| Raise attribute by 1 | New rating × 5 |
| Raise skill by 1 | New rating × 5 |
| Add specialization | 5 karma |
| Add expertise | 5 karma (requires spec) |
| Buy positive quality | Quality's karma cost |
| Buy off negative quality | Quality's karma cost |

### UI Changes

**1. Personal Data card** — Replace editable Karma/Total Karma fields with a read-only summary panel:

```text
┌─────────────────────────────┐
│  KARMA                      │
│  Available: 12   Total: 50  │
│  Spent: 38                  │
│  [View Ledger]              │
└─────────────────────────────┘
```

**2. Confirmation Dialog** — When the user changes an attribute value, skill rating, or adds a quality, intercept the save and show:

> "Raise Body from 3 → 4 costs **20 karma** (4 × 5). You have 32 karma available. Proceed?"
> [Confirm] [Cancel]

If insufficient karma, the dialog warns and disables Confirm.

**3. Karma Ledger Dialog** — A modal opened from "View Ledger" showing all transactions in reverse chronological order. Each non-undone "spent" entry has an "Undo" button that:
- Marks the transaction as `undone: true`
- Reverses the associated change (e.g., decrements the attribute back)
- Adds a corresponding "refund" entry to the ledger

### Implementation Plan

**Database migration**: Add `karma_ledger jsonb DEFAULT '[]'` column to `characters`.

**New shared types** in `types/character.ts`: `KarmaTransaction` interface.

**New component**: `src/components/character/KarmaTracker.tsx` — the summary display + ledger dialog.

**Modified components**:
- `PersonalInfoTab` — embed KarmaTracker, remove manual karma fields
- `AttributesTab` — intercept attribute changes, show confirmation dialog with karma cost
- `SkillsTab` — intercept skill rating / spec / expertise changes
- `QualitiesTab` — intercept quality additions/removals
- `CharacterSheet.tsx` — pass karma ledger and update handler to child components

### Undo Mechanism

Each karma transaction stores enough metadata to reverse the change:
- `related_field`: e.g. "attributes.body" or "skills[abc].rating"  
- `previous_value`: the value before the change

When "Undo" is clicked, the system restores `previous_value` to the field and marks the transaction as undone. This keeps full audit history.

### Technical Notes
- All karma logic stays client-side with saves to the existing character record
- No edge functions needed — just JSONB column updates
- The ledger is append-only (undo marks entries, doesn't delete them)
- Character creation wizard already handles its own karma budget separately; the ledger starts fresh when the character is finalized

