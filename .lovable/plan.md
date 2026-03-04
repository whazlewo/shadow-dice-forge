

## Character Portrait Upload with Crop/Center

### Overview
Add a square character portrait to the Personal Data card. Users can upload an image, then crop and center it in a modal before saving. The portrait displays alongside the personal info fields.

### Infrastructure

**Storage bucket** (SQL migration):
- Create a `character-portraits` public bucket
- RLS policy: authenticated users can upload/delete to path `{user_id}/{character_id}.*`; anyone can read (public bucket)

**Database**: Add a `portrait_url` text column to the `characters` table (nullable, default null).

### UI Changes

**`src/components/character/PersonalInfoTab.tsx`** — Layout restructure:
- Add portrait display area: a square `aspect-square` container (roughly 120-140px) on the left side of the card content, with the existing fields on the right
- When no portrait exists: show a placeholder with camera/upload icon
- When portrait exists: show the cropped image with a small overlay edit button
- Clicking opens the crop dialog

**New: `src/components/character/PortraitUploadDialog.tsx`**:
- Modal with file input to select an image
- Canvas-based crop UI: renders the uploaded image, lets user drag to pan and use a slider to zoom, constraining output to a 1:1 square
- "Save" button uploads the cropped result as a blob to storage, updates the character's `portrait_url`, and closes the dialog
- Uses native Canvas API for cropping (no extra dependencies needed)

**`src/pages/CharacterSheet.tsx`**:
- Pass `portraitUrl` and `onPortraitChange` callback to `PersonalInfoTab`
- `onPortraitChange` uploads to storage bucket and calls `updateField("portrait_url", url)`

### Layout (Personal Data card)

```text
┌─ PERSONAL DATA ──────────────── [edit] ┐
│ ┌──────────┐  Name: Shadowcat          │
│ │          │  Metatype: Elf            │
│ │ Portrait │  Ethnicity: ...           │
│ │  120x120 │  Age/Sex/Height/Weight    │
│ └──────────┘  Street Cred / Notoriety  │
│               Public Awareness         │
└────────────────────────────────────────┘
```

### File Changes
1. **SQL migration** — Create `character-portraits` storage bucket + RLS policies; add `portrait_url` column to `characters`
2. **`src/components/character/PortraitUploadDialog.tsx`** — New crop/upload dialog component
3. **`src/components/character/PersonalInfoTab.tsx`** — Add portrait display area, restructure layout to side-by-side
4. **`src/pages/CharacterSheet.tsx`** — Wire portrait URL and upload handler

