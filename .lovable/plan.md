

## Persist Wizard Draft State in Database

### Approach

Add a `character_drafts` table to store in-progress wizard state per user. The wizard will auto-save on every step change and state update (debounced), and restore on mount. Each user gets at most one draft row — upserted on save, deleted on finish or cancel.

### Database Migration

Create a new `character_drafts` table:

```sql
CREATE TABLE public.character_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wizard_step integer NOT NULL DEFAULT 0,
  wizard_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.character_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own drafts" ON public.character_drafts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

One row per user (unique constraint on `user_id`). Upsert pattern keeps it simple.

### Changes to `CharacterWizard.tsx`

1. **On mount**: Query `character_drafts` for the current user. If a row exists, restore `step` and `state` from it and show a toast ("Draft restored").

2. **Auto-save**: Add a `useEffect` watching `[step, state]` that debounces (~1s) an upsert to `character_drafts` with the current `{ wizard_step, wizard_state }`. Use `ON CONFLICT (user_id) DO UPDATE`.

3. **On finish** (`handleFinish`): After successful character insert, delete the draft row.

4. **On cancel**: Add a confirmation dialog. If confirmed, delete the draft row and navigate away.

### Technical Details

- Upsert call: `supabase.from('character_drafts').upsert({ user_id, wizard_step: step, wizard_state: state }, { onConflict: 'user_id' })`
- Debounce with a `setTimeout`/`useRef` pattern (no new dependency needed)
- Loading state while fetching draft on mount to avoid flash of empty wizard
- The `WizardState` type serializes cleanly to JSON — no changes needed

### Files Changed

- **Database**: 1 migration (new `character_drafts` table + RLS)
- **`src/pages/CharacterWizard.tsx`**: Add draft load, auto-save effect, delete on finish/cancel, loading state

