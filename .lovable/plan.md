

## Fix: Tiptap Toolbar Buttons Not Working

### Root Cause
The shadcn `Button` components steal focus from the editor on `mousedown`, causing the editor to blur before the formatting command executes. Even though `editor.chain().focus()` tries to refocus, the timing conflict prevents the command from applying to the selection.

### Fix in `src/components/character/NotesTab.tsx`

1. **Add `onMouseDown: (e) => e.preventDefault()`** to the `tb()` helper — this keeps focus in the editor when clicking toolbar buttons, allowing the chain commands to work on the current selection.

2. **Add `immediatelyRender: false`** to the `useEditor` options — required for React 18 strict mode compatibility with Tiptap v3, prevents hydration warnings.

Both changes are in the `NoteEditor` component only — no other files affected.

