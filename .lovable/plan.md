

## Update Firearms Specializations

The current list (`"Automatics", "Longarms", "Pistols", "Rifles", "Shotguns"`) uses older SR5-style categories. Your SR6 list is solid. Two others worth considering:

- **Sporting Rifles** — sometimes listed separately from Rifles in some SR6 supplements
- **Grenade Launchers** — though these sometimes fall under Engineering (Gunnery) depending on interpretation

If you'd rather keep it to your list only, that works fine — it covers all the standard SR6 Firearms weapon categories.

### Change

**`src/data/sr6-reference.ts`** — replace the `Firearms` entry in `SKILL_SPECIALIZATIONS`:

```ts
Firearms: [
  "Tasers",
  "Hold-Outs",
  "Light Pistols",
  "Machine Pistols",
  "Heavy Pistols",
  "Submachine Guns",
  "Shotguns",
  "Rifles",
  "Machine Guns",
  "Assault Cannons",
],
```

Single-line change in one file.

