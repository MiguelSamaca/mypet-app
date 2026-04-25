CREATE TYPE public.app_role AS ENUM ('admin', 'colaborador');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'colaborador')) $$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can insert perros" ON public.perros
FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update perros" ON public.perros
FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete perros" ON public.perros
FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert visitas" ON public.visitas
FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update visitas" ON public.visitas
FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete visitas" ON public.visitas
FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can upload peludos photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'peludos' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff can update peludos photos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'peludos' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff can delete peludos photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'peludos' AND public.is_staff(auth.uid()));