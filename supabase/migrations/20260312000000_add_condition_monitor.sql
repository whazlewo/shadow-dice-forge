-- Add condition_monitor JSONB to characters for Physical/Stun/Overflow damage tracking
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS condition_monitor jsonb DEFAULT '{"physical_damage":0,"stun_damage":0,"overflow_damage":0}'::jsonb;
