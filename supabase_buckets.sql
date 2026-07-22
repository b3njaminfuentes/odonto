-- Crear los buckets si no existen
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('patients-profile', 'patients-profile', false),
  ('cases-images', 'cases-images', false),
  ('cases-videos', 'cases-videos', false),
  ('radiographs', 'radiographs', false),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Configurar RLS básico para storage
-- (Supabase habilita RLS por defecto en storage.objects)
-- Podemos permitir al admin acceso total a todos los buckets:
CREATE POLICY "Admin access to all buckets"
ON storage.objects FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public."Profile"
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Para el paciente, acceso de lectura a sus propios archivos:
-- Supabase Storage structure relies on the first path segment being the patientId.
CREATE POLICY "Patient read access to own files"
ON storage.objects FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public."Patient" p
    WHERE p.id::text = (string_to_array(storage.objects.name, '/'))[1]
      AND p."profileId" = auth.uid()
  )
);
