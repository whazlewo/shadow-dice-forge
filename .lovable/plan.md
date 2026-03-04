

## Fix Attribute Bonus Chip Readability

The current `secondary` badge variant produces a bright pink/magenta chip where the destructive-colored X blends in. Two quick fixes:

### Change in `src/components/character/EffectsEditor.tsx`

- Switch badge variant from `"secondary"` to `"outline"` — gives a subtle bordered chip on dark background, making both text and the X clearly visible
- Style the X button with a contrasting `text-muted-foreground hover:text-destructive` instead of always `text-destructive` (which clashes with the pink)

```tsx
// Before
<Badge key={i} variant="secondary" className="gap-1.5 pl-2.5 pr-1 py-1 font-mono text-xs">
  ...
  <Button ... className="h-5 w-5 ml-1 text-destructive hover:bg-destructive/20 rounded-full">

// After  
<Badge key={i} variant="outline" className="gap-1.5 pl-2.5 pr-1 py-1 font-mono text-xs">
  ...
  <Button ... className="h-5 w-5 ml-1 text-muted-foreground hover:text-destructive hover:bg-destructive/20 rounded-full">
```

One file, two class changes. The outline variant keeps things readable on both light and dark themes.

