
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Characters table (core, with JSONB for flexible sub-data)
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'New Character',
  metatype TEXT DEFAULT 'Human',
  
  -- Priority selections
  priorities JSONB DEFAULT '{}',
  
  -- Personal info
  personal_info JSONB DEFAULT '{}',
  
  -- Attributes (body, agility, etc.)
  attributes JSONB DEFAULT '{"body":1,"agility":1,"reaction":1,"strength":1,"willpower":1,"logic":1,"intuition":1,"charisma":1,"edge":1,"essence":6,"magic":0,"resonance":0}',
  
  -- Skills array
  skills JSONB DEFAULT '[]',
  
  -- Qualities
  qualities JSONB DEFAULT '[]',
  
  -- IDs, Lifestyles, Currency
  ids_lifestyles JSONB DEFAULT '{"sins":[],"licenses":[],"lifestyles":[],"nuyen":0}',
  
  -- Contacts
  contacts JSONB DEFAULT '[]',
  
  -- Ranged weapons
  ranged_weapons JSONB DEFAULT '[]',
  
  -- Melee weapons
  melee_weapons JSONB DEFAULT '[]',
  
  -- Armor
  armor JSONB DEFAULT '[]',
  
  -- Matrix stats
  matrix_stats JSONB DEFAULT '{"device_rating":0,"attack":0,"sleaze":0,"data_processing":0,"firewall":0,"programs":[]}',
  
  -- Augmentations
  augmentations JSONB DEFAULT '[]',
  
  -- Gear
  gear JSONB DEFAULT '[]',
  
  -- Vehicles/Drones
  vehicles JSONB DEFAULT '[]',
  
  -- Spells/Preparations/Rituals/Complex Forms
  spells JSONB DEFAULT '[]',
  
  -- Adept Powers
  adept_powers JSONB DEFAULT '[]',
  
  -- Other abilities
  other_abilities JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION public.is_character_owner(char_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.characters
    WHERE id = char_id AND user_id = auth.uid()
  );
$$;

CREATE POLICY "Users can view own characters" ON public.characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own characters" ON public.characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own characters" ON public.characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own characters" ON public.characters FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON public.characters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
