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

-- Para el paciente, acceso limitado a sus cosas (requiere que la app guarde los archivos
-- en un folder con el formato patient_id/...).
-- Como el diseño completo es complejo, dejamos la validación básica o signed URLs.
