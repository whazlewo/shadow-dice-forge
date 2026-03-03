

## Fix Untrained Default Values

**Problem**: Cracking is marked as "Yes" (can default) but in SR6 it cannot be used untrained — it requires a cyberdeck and specialized Matrix training.

**Change**: Add `Cracking: false` to the `SKILL_CAN_DEFAULT` map in `src/components/wizard/Step4Skills.tsx`.

```ts
const SKILL_CAN_DEFAULT: Record<string, boolean> = {
  Astral: false,
  Conjuring: false,
  Cracking: false,   // ← add this
  Enchanting: false,
  Sorcery: false,
  Tasking: false,
  "Exotic Weapons": false,
};
```

Single-line addition, no other files affected.

