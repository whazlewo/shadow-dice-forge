

## Make Augmentation "Type" a Dropdown

The `type` field on the Augmentations tab is currently a free-text input. It should be a dropdown with these SR6 augmentation types:

- **cyberware** — mechanical/electronic implants
- **bioware** — biological enhancements
- **cultured bioware** — lab-grown biological enhancements (e.g., Synaptic Booster)
- **nanotechnology** — nanite-based augmentations
- **geneware** — genetic modifications

### Change

In `src/pages/CharacterSheet.tsx`, add `fieldOptions` to the Augmentations `GenericListTab`:

```tsx
fieldOptions={{ type: ["cyberware", "bioware", "cultured bioware", "nanotechnology", "geneware"] }}
fieldDefaults={{ type: "cyberware" }}
```

This uses existing `GenericListTab` support for `fieldOptions` — no new components needed. One line change.

