

## Add "Notes" Tab with Rich Text Editor

### Overview
Add a new "Notes" tab to the character sheet with a rich text editor supporting basic formatting and session-based organization. Notes are stored per-character in a JSONB column.

### Database
- Add a `notes` column (JSONB, nullable, default `'[]'`) to the `characters` table to store an array of session note entries: `[{ id, title, content, created_at, collapsed }]`
- `content` stores HTML produced by the editor

### Dependencies
- Install **`@tiptap/react`**, **`@tiptap/starter-kit`**, and **`@tiptap/extension-task-list`** / **`@tiptap/extension-task-item`** — Tiptap is a lightweight, headless rich text editor built on ProseMirror that integrates cleanly with React and requires no heavy UI framework

### New Component: `src/components/character/NotesTab.tsx`
- **Session list panel**: displays collapsible session entries sorted by date, each with a title (editable), timestamp, and collapse/expand toggle
- **"+ New Session" button**: creates a new entry with today's date as the default title
- **Editor area**: Tiptap editor instance with a minimal toolbar — bold, italic, headings (H2/H3), bullet list, ordered list, horizontal rule
- **Auto-save**: debounced save (e.g. 1s after last keystroke) calls `updateField("notes", ...)`
- **Delete session**: option to remove a session entry with confirmation

### Integration: `src/pages/CharacterSheet.tsx`
- Add `"notes"` to the tabs array (between "core" and "weapons-gear" or at the end before "other")
- Add `<TabsContent value="notes">` rendering `<NotesTab>`
- Pass `notes={(character.notes || []) as any[]}` and `onUpdate={(n) => updateField("notes", n)}`

### File Changes
1. **SQL migration** — add `notes` JSONB column to `characters`
2. **`src/components/character/NotesTab.tsx`** — new component with Tiptap editor + session organization
3. **`src/pages/CharacterSheet.tsx`** — wire up the new tab

