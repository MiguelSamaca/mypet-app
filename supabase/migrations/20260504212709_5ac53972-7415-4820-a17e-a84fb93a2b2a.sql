ALTER TABLE public.visitas 
ADD COLUMN IF NOT EXISTS energia smallint,
ADD COLUMN IF NOT EXISTS consenticion smallint,
ADD COLUMN IF NOT EXISTS descanso smallint;