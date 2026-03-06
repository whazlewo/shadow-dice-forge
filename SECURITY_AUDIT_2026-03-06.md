# Security Audit — Shadow Dice Forge
**Date:** 2026-03-06
**Branch:** `audit/2026-03-06`
**Scope:** Auth & Secrets · Supabase RLS · Frontend · Cloudflare Config

---

## Summary

| # | Severity | Area | Finding | Status |
|---|----------|------|---------|--------|
| 1 | 🔴 HIGH | Secrets | `.env` committed to git | **Fixed** |
| 2 | 🔴 HIGH | Cloudflare | No security headers (`_headers` missing) | **Fixed** |
| 3 | 🟠 MEDIUM | Supabase RLS | `profiles` SELECT allows all authenticated users to see all display names | **Fixed** |
| 4 | 🟠 MEDIUM | Supabase RLS | No DELETE policy on `profiles` table | **Fixed** |
| 5 | 🟡 LOW | Frontend | Password minimum length of 6 characters | **Fixed** |
| 6 | 🟡 LOW | Frontend | TipTap stores raw HTML — safe within TipTap, risky if rendered elsewhere | **Advisory** |
| 7 | ℹ️ INFO | Auth | Session persisted in `localStorage` | **Advisory** |
| 8 | ℹ️ INFO | Supabase | Two separate Supabase projects (dev vs prod) with different key formats | **Advisory** |

---

## Findings & Fixes

---

### 🔴 FINDING 1 — `.env` committed to git (HIGH)

**File:** `.gitignore`

**Problem:**
`.gitignore` excluded `.env.development` and `.env.production` but left `.env` unprotected. The `.env` file (containing the dev Supabase URL, project ID, and anon key) was actively tracked in git and appears in the commit history.

While the Supabase **anon key** is technically a public key designed to be exposed to browsers, committing it means:
- The URL and project reference are permanently embedded in git history (visible in any clone or fork).
- If you accidentally added a service role key here in the future, it would immediately be compromised.
- The dev Supabase project is now permanently associated with this repo's history.

**Fix applied:**
`.gitignore` updated to:
```
.env
.env.*
!.env.example
```

A `.env.example` template was also added so contributors know what variables are required without exposing real values.

**⚠️ Manual action required:**
The `.env` file and its values are already in git history. You must scrub the history using one of the following:
```bash
# Option A: git-filter-repo (recommended, install with pip)
pip install git-filter-repo
git filter-repo --path .env --invert-paths

# Option B: BFG Repo Cleaner
java -jar bfg.jar --delete-files .env
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```
After scrubbing, force-push all branches and notify collaborators to re-clone. Also **rotate** the dev Supabase anon key from the Supabase dashboard, even though it's technically public — it's good hygiene.

---

### 🔴 FINDING 2 — No security headers configured (HIGH)

**File:** `public/_headers` (did not exist)

**Problem:**
Cloudflare Pages uses a `public/_headers` file to set HTTP response headers. Without it, no security headers were sent to browsers, leaving the app vulnerable to:
- **Clickjacking** — no `X-Frame-Options` or CSP `frame-ancestors`.
- **MIME sniffing attacks** — no `X-Content-Type-Options`.
- **XSS amplification** — no Content Security Policy restricting script sources.
- **Referrer leakage** — sensitive URL paths sent in `Referer` headers to third parties.
- **Overly broad browser APIs** — camera, mic, geolocation available by default to any injected script.

**Fix applied:**
Created `public/_headers` with the following policies:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    font-src 'self' data:; frame-src 'none'; object-src 'none';
    base-uri 'self'; form-action 'self'
```

**Notes on CSP:**
`'unsafe-inline'` is needed for both scripts and styles because Vite injects inline code during the build, and TipTap/shadcn-ui uses runtime inline styles. A future improvement would be to use a CSP nonce or hash-based policy, which requires server-side rendering support. For a static SPA this is acceptable.

**Additional Cloudflare settings to verify in your dashboard:**
- Enable **HTTPS Redirect** (HTTP → HTTPS) under SSL/TLS.
- Enable **HSTS** under SSL/TLS → Edge Certificates (min-age 31536000, include subdomains).
- Set **SSL mode** to "Full (strict)" — not just "Flexible".
- Enable **Bot Fight Mode** under Security to rate-limit automated attacks.

---

### 🟠 FINDING 3 — Profiles table exposes all display names (MEDIUM)

**File:** `supabase/migrations/20260303041158_...sql`

**Problem:**
The original RLS policy for `profiles.SELECT` was:
```sql
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
```
`USING (true)` means any authenticated user (or even unauthenticated users depending on your Supabase anon settings) can query all rows in `profiles` — retrieving the `display_name` and `user_id` of every registered user. Unless you're building social features, this is unnecessarily broad.

**Fix applied:**
Migration `20260306000000_security_audit_fixes.sql` drops the old policy and replaces it:
```sql
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);
```

**Note:** If you later add character-sharing or a public gallery feature where users can see others' display names, you'll need to revisit this policy with a more targeted approach (e.g., only expose profiles for users who have a shared character with the viewer).

---

### 🟠 FINDING 4 — No DELETE policy on `profiles` table (MEDIUM)

**File:** `supabase/migrations/20260303041158_...sql`

**Problem:**
The original migrations defined INSERT and UPDATE policies for profiles, but no DELETE policy. This means users could never delete their own profile row, even if they wanted to delete their account. Combined with the `ON DELETE CASCADE` on `auth.users`, this would leave orphaned profile rows if a user was deleted at the `auth.users` level (e.g., via the Supabase admin console).

**Fix applied:**
```sql
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 🟡 FINDING 5 — Weak password minimum length (LOW)

**File:** `src/pages/Auth.tsx`

**Problem:**
The password input had `minLength={6}`, which is Supabase's default but considered too weak by modern standards (NIST recommends at minimum 8 characters, ideally 12+).

**Fix applied:**
Changed `minLength={6}` → `minLength={8}` in `Auth.tsx`.

**Recommendation:** Also configure the minimum password length in your Supabase dashboard under **Authentication → Settings → Password strength** to enforce this server-side — the `minLength` attribute is only a client-side hint and can be bypassed.

---

### 🟡 FINDING 6 — TipTap stores raw HTML in database (LOW / Advisory)

**File:** `src/components/character/NotesTab.tsx`

**Problem:**
The TipTap rich text editor serializes note content as HTML via `editor.getHTML()` and stores it in the Supabase `notes` JSONB column. This is fine within TipTap — ProseMirror's schema enforces an allowlist of nodes/marks, so injected `<script>` tags cannot be persisted via the editor's normal flow.

However, if this HTML is ever rendered **outside** of TipTap (e.g., in a future email summary, PDF export, or another component using `dangerouslySetInnerHTML`), it would be an XSS vector since the stored HTML was user-supplied.

**No fix required now**, but going forward:
- Always render notes content only through `EditorContent` (TipTap), never via raw `innerHTML` or `dangerouslySetInnerHTML`.
- If you need to render it outside TipTap, run it through [DOMPurify](https://github.com/cure53/DOMPurify) first: `DOMPurify.sanitize(noteContent)`.

---

### ℹ️ FINDING 7 — Auth session stored in `localStorage` (INFO)

**File:** `src/integrations/supabase/client.ts`

**Observation:**
The Supabase client is configured with `storage: localStorage`. This is the standard and recommended approach for browser-based SPAs. However, `localStorage` is accessible to any JavaScript running on the page. If an XSS attack were successful, session tokens would be at risk.

**Mitigation:** The CSP added in Finding 2 significantly reduces XSS surface area. No code change is needed here — this is a known trade-off in SPA authentication.

---

### ℹ️ FINDING 8 — Two Supabase projects (dev vs prod) (INFO)

**Observation:**
The project uses two separate Supabase instances:
- **Dev** (`cmasgnfrpwtsgjztuxgm`) — managed by Lovable, used in `.env.development`.
- **Prod** (`rqfkfwmohpjfjtxvirin`) — your personal project, used in `.env.production`.

**Recommendation:** Ensure the RLS migrations in this repo have been applied to **both** databases. The security fixes in `20260306000000_security_audit_fixes.sql` need to be run against both the Lovable-managed dev instance and your prod Supabase instance.

You can apply them via the Supabase SQL editor, or use the Supabase CLI:
```bash
supabase db push --db-url "postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres"
```

---

## Files Changed

| File | Change |
|------|--------|
| `.gitignore` | Added `.env` and `.env.*` patterns; whitelisted `.env.example` |
| `.env.example` | Created template for contributors |
| `public/_headers` | Created with security headers for Cloudflare Pages |
| `src/pages/Auth.tsx` | Changed `minLength` from 6 → 8 |
| `supabase/migrations/20260306000000_security_audit_fixes.sql` | Added profiles DELETE policy; tightened SELECT policy |

---

## Remaining Manual Actions

1. **Scrub `.env` from git history** and force-push (see Finding 1).
2. **Apply the new migration** to both dev and prod Supabase instances.
3. **Verify Cloudflare dashboard settings**: HTTPS redirect, HSTS, SSL Full Strict, Bot Fight Mode.
4. **Set minimum password length in Supabase dashboard** to match the new `minLength={8}` frontend value.
5. **(Optional)** Rotate the dev Supabase anon key since it was exposed in git history.

---

*Audit conducted on branch `audit/2026-03-06`. Merge after applying the manual actions above.*
