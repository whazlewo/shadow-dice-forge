

## Merge Personal, Attributes, Skills, and Qualities into a Single "Core" Tab

These four sections are the most frequently referenced parts of a character sheet and belong together conceptually. Merging them into one scrollable page reduces tab count from 15 to 12 and keeps the core character identity in one place.

### Layout

The merged tab (called **"Core"**) will stack the four existing components vertically in this order:

```text
┌─────────────────────────────────┐
│  PERSONAL INFO (name, karma…)   │
├─────────────────────────────────┤
│  ATTRIBUTES (BOD, AGI, etc.)    │
├─────────────────────────────────┤
│  QUALITIES (positive/negative)  │
├─────────────────────────────────┤
│  SKILLS (with dice pools)       │
└─────────────────────────────────┘
```

Skills go last since it's the longest section and benefits from being at the bottom where it can expand without pushing other content off-screen.

### Changes

**`src/pages/CharacterSheet.tsx`**
- Remove the four individual tab values (`attributes`, `skills`, `personal`, `qualities`) from the tabs list
- Add a single `"core"` tab in their place
- Create one `<TabsContent value="core">` that renders `<PersonalInfoTab>`, `<AttributesTab>`, `<QualitiesTab>`, and `<SkillsTab>` stacked vertically with spacing between them
- Set `defaultValue="core"` on the `<Tabs>` component
- All props/wiring stays exactly the same — just composition changes

No changes to any of the four component files themselves.

