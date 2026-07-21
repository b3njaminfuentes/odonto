-- ==========================================
-- RLS POLICIES FOR CLINIC OS VILLARROEL
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Diagnosis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Odontogram" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicalHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClinicalHistoryVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Treatment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CaseMedia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TimelineEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- POLÍTICAS GENERALES DE ADMIN (Doctora)
-- -----------------------------------------------------
-- Asumimos que los perfiles admin tienen role = 'admin' en la tabla Profile.
-- Podemos crear una función auxiliar para facilitar las comprobaciones de admin.
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "Profile"
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar acceso TOTAL (ALL) a todas las tablas si es admin.
CREATE POLICY "admin_all_profile" ON "Profile" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_patient" ON "Patient" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_diagnosis" ON "Diagnosis" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_odontogram" ON "Odontogram" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_clinical_history" ON "ClinicalHistory" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_clinical_history_version" ON "ClinicalHistoryVersion" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_treatment" ON "Treatment" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_case_media" ON "CaseMedia" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_appointment" ON "Appointment" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_payment" ON "Payment" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_timeline" ON "TimelineEvent" FOR ALL USING (is_admin());
CREATE POLICY "admin_all_audit" ON "AuditLog" FOR ALL USING (is_admin());

-- -----------------------------------------------------
-- POLÍTICAS PARA PACIENTES
-- -----------------------------------------------------

-- 1. Profile: Un paciente solo puede ver su propio profile.
CREATE POLICY "patient_select_own_profile" ON "Profile"
  FOR SELECT USING (id = auth.uid());

-- 2. Patient: Un paciente solo puede ver su propia ficha de paciente.
CREATE POLICY "patient_select_own_patient" ON "Patient"
  FOR SELECT USING ("profileId" = auth.uid());

-- 3. Entidades relacionadas a Patient (uso de EXISTS con Join)
-- Diagnosis
CREATE POLICY "patient_select_own_diagnosis" ON "Diagnosis"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Patient" p
      WHERE p.id = "Diagnosis"."patientId"
        AND p."profileId" = auth.uid()
    )
  );

-- Odontogram
CREATE POLICY "patient_select_own_odontogram" ON "Odontogram"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Patient" p
      WHERE p.id = "Odontogram"."patientId"
        AND p."profileId" = auth.uid()
    )
  );

-- ClinicalHistory
CREATE POLICY "patient_select_own_clinical_history" ON "ClinicalHistory"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Patient" p
      WHERE p.id = "ClinicalHistory"."patientId"
        AND p."profileId" = auth.uid()
    )
  );

-- Treatment
CREATE POLICY "patient_select_own_treatment" ON "Treatment"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Patient" p
      WHERE p.id = "Treatment"."patientId"
        AND p."profileId" = auth.uid()
    )
  );

-- CaseMedia (Solo ver los que pertenecen al paciente)
CREATE POLICY "patient_select_own_media" ON "CaseMedia"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Patient" p
      WHERE p.id = "CaseMedia"."patientId"
        AND p."profileId" = auth.uid()
    )
  );

-- Appointment (Ver las suyas)
CREATE POLICY "patient_select_own_appointment" ON "Appointment"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Patient" p
      WHERE p.id = "Appointment"."patientId"
        AND p."profileId" = auth.uid()
    )
  );

-- Payment (Ver sus pagos)
CREATE POLICY "patient_select_own_payment" ON "Payment"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Patient" p
      WHERE p.id = "Payment"."patientId"
        AND p."profileId" = auth.uid()
    )
  );

-- TimelineEvent (Ver su historial de eventos)
CREATE POLICY "patient_select_own_timeline" ON "TimelineEvent"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Patient" p
      WHERE p.id = "TimelineEvent"."patientId"
        AND p."profileId" = auth.uid()
    )
  );

-- Nota: Appointment público
-- Para el calendario público, Muelita o la página de inicio pueden necesitar consultar horas ocupadas.
-- Esto se suele manejar con un backend de Next.js u ocultando info privada, pero a nivel DB:
-- Una opción es permitir a todos leer `Appointment` pero solo los campos `startsAt` y `endsAt` o estado,
-- Sin embargo, Supabase no restringe por columna fácilmente sin usar Vistas. 
-- Lo ideal es que el público consulte los turnos mediante una API Route (que usa un token admin o la Service Role key de manera muy controlada) o una View pública.
