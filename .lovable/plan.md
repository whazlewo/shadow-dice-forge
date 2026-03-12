

## Fix Three TypeScript Build Errors

### 1. `rich-text-editor.tsx` (line 90) — `as const` on ternary
The ternary `editor.isActive(...) ? "secondary" : "ghost"` can't use `as const`. Fix: type it as the union directly.

**Change line 90:**
```ts
variant: (editor.isActive(active, attrs) ? "secondary" : "ghost") as "secondary" | "ghost",
```

### 2. `CharacterSheet.tsx` (line 273) — `Json` not assignable
`inferMagicType(character)` receives a raw DB row with `Json` typed fields. Fix: cast the relevant fields.

**Change line 273:**
```ts
const magicType = inferMagicType(character as any);
```

### 3. `CharacterWizard.tsx` (lines 136-139) — properties on `never`
The `as unknown as WizardState` cast at line 134 doesn't propagate because TS narrows `loaded` to `never` inside the truthiness check. The issue is the cast produces a type that TS can't reconcile. Fix: use explicit type annotation.

**Change line 134:**
```ts
const loaded: (WizardState & { _wizardStepName?: string }) | null = data.wizard_state as any;
```
Lines 136-139 remain unchanged — they'll now work since `loaded` is properly typed.

