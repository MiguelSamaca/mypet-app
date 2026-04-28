ALTER TABLE public.visitas
ADD COLUMN obediencia smallint,
ADD COLUMN interaccion_social smallint,
ADD COLUMN tarifa_pagada numeric(10,2),
ADD COLUMN notas_admin text;

ALTER TABLE public.visitas
ADD CONSTRAINT obediencia_rango CHECK (obediencia IS NULL OR (obediencia BETWEEN 1 AND 10)),
ADD CONSTRAINT interaccion_rango CHECK (interaccion_social IS NULL OR (interaccion_social BETWEEN 1 AND 10));