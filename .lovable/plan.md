

## Add "Untrained?" Column to Skills Table

In SR6, most skills **can** be used untrained (defaulting to the linked attribute alone), but a few **cannot**:

- **Astral** — No (requires Awakened ability)
- **Conjuring** — No (requires magic)
- **Enchanting** — No (requires magic)
- **Sorcery** — No (requires magic)
- **Tasking** — No (requires Resonance)
- **Exotic Weapons** — No (specialized training required)
- All others — **Yes** (can default)

### Changes

**`src/components/wizard/Step4Skills.tsx`**:
1. Add a `SKILL_CAN_DEFAULT` map (`Record<string, boolean>`) with `false` for the six skills above and `true` for the rest.
2. Insert a new column after the skill name showing a green "Yes" or red "No" badge/indicator, with a tooltip explaining what "untrained" means.
3. Add a column header "Untrained?" with a small info tooltip: "Whether this skill can be attempted without any ranks."

