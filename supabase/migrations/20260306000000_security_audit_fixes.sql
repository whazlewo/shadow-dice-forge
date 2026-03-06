-- Security audit fixes (2026-03-06)

-- 1. Allow users to delete their own profile (previously missing)
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Tighten profile SELECT policy: users can only see their own profile.
--    The prior "Anyone can view profiles" policy exposed all display names to
--    any authenticated user. Remove it and replace with a scoped policy.
--    NOTE: If you plan to add social/sharing features later, adjust accordingly.
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);
