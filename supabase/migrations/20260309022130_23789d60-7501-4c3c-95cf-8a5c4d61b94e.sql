-- Create leads table for popup registrations
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT,
  email TEXT NOT NULL,
  telefono TEXT,
  origen TEXT DEFAULT 'popup_descuento',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (visitors aren't authenticated)
CREATE POLICY "Anyone can insert leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- No public read access
CREATE POLICY "No public read access" ON public.leads
  FOR SELECT USING (false);