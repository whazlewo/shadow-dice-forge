

## Codebase Optimization Plan

After a thorough analysis of all source files, here are the issues found and proposed fixes, grouped by category.

---

### 1. Duplicated Fire Mode Constants and Components

**Problem:** The fire mode data and `FireModeCheckboxes` component are defined **three separate times** with identical logic:
- `src/components/character/GenericListTab.tsx` — `FIRE_MODES` + `FireModeCheckboxes`
- `src/components/wizard/Step5Gear.tsx` — `FIRE_MODES` + `FireModeCheckboxes`
- `src/components/character/EquippedGearTab.tsx` — `FIRE_MODE_INFO` (same data, different shape) + `FireModeBadges`

**Fix:** Extract into a single shared file `src/components/character/FireModes.tsx` containing:
- One `FIRE_MODES` constant (single source of truth)
- Exported `FireModeCheckboxes` component
- Exported `FireModeBadges` component

Then import from that file in all three consumers.

---

### 2. Duplicated Specialization Data

**Problem:** Skill specializations are defined **twice**:
- `src/data/sr6-reference.ts` → `SKILL_SPECIALIZATIONS` (used in wizard Step4Skills)
- `src/types/character.ts` → `SR6_CORE_SKILLS[].specializations` (used in character sheet SkillsTab)

These contain the same data but with some discrepancies (e.g., Firearms specializations differ between the two).

**Fix:** Remove `SKILL_SPECIALIZATIONS` from `sr6-reference.ts`. Update `Step4Skills.tsx` to use `SR6_CORE_SKILLS` (which already has specializations) as the single source of truth.

---

### 3. Dead Code

| File | Dead Code | Action |
|------|-----------|--------|
| `src/components/character/EquippedGearTab.tsx` | `accessoryNames()` function — defined but never called | Delete |
| `src/components/character/ARModifierList.tsx` | Entire file — never imported anywhere | Delete file |
| `src/components/NavLink.tsx` | Entire file — never imported anywhere | Delete file |
| `src/pages/Index.tsx` | Redirects to `/` but `/` is already routed directly in `App.tsx`. No route maps to `/index` | Delete file and remove route if any |
| `src/types/character.ts` | `SR6PersonalInfo.karma` and `SR6PersonalInfo.total_karma` fields — superseded by the karma ledger system | Remove these two fields |

---

### 4. `uuid.ts` Wrapper is Unnecessary

**Problem:** `src/lib/uuid.ts` is a one-line wrapper around `crypto.randomUUID()`. It's imported in 4 files as `v4` or `generateUUID`.

**Fix:** Replace all imports with direct `crypto.randomUUID()` calls and delete the file. This removes an abstraction layer with no value.

---

### 5. Repeated `scanMods` Helper Pattern in AttributesTab

**Problem:** `AttributesTab.tsx` contains three near-identical `scanMods`/`scanDRMods`/`scanInitMods` inline functions that iterate items looking for dice modifiers by attribute name.

**Fix:** Extract a single generic `collectDiceModifiers(items, attributeKey)` utility function and reuse it for DR, initiative dice, and initiative flat modifiers.

---

### 6. No Security Issues Found

The codebase is clean on security:
- RLS policies are correctly applied on all tables (restrictive, user-scoped)
- Auth uses server-side validation via Supabase Auth (no client-side role checks)
- No secrets or credentials are hardcoded
- No direct manipulation of `auth` schema tables

---

### Summary of Changes

| Change | Files Affected |
|--------|---------------|
| Extract shared `FireModes.tsx` | Create 1 new file, modify 3 files |
| Consolidate specialization data | Modify 2 files |
| Delete dead code | Delete 3 files, modify 2 files |
| Inline `crypto.randomUUID()` | Delete 1 file, modify 4 files |
| Extract `collectDiceModifiers` utility | Modify 1 file |
| Remove stale `karma`/`total_karma` fields | Modify 1 file |

Total: ~3 new/modified utilities, 4 deleted files, 8 files modified. No database changes needed.

