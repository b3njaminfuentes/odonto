-- ==============================================================================
-- MIGRACIÓN MULTI-TENANT PARA CLINICOS / CLINICA VILLARROEL
-- Preservación 100% de datos existentes asociándolos al tenant Villarroel
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Crear tabla Clinic
CREATE TABLE IF NOT EXISTS "Clinic" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "plan" TEXT NOT NULL DEFAULT 'core',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Clinic_slug_idx" ON "Clinic"("slug");

-- 2. Crear tabla Branch
CREATE TABLE IF NOT EXISTS "Branch" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clinicId" UUID NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Branch_clinicId_idx" ON "Branch"("clinicId");

-- 3. Crear tabla ClinicDomain
CREATE TABLE IF NOT EXISTS "ClinicDomain" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clinicId" UUID NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
    "domain" TEXT NOT NULL UNIQUE,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ClinicDomain_clinicId_idx" ON "ClinicDomain"("clinicId");
CREATE INDEX IF NOT EXISTS "ClinicDomain_domain_idx" ON "ClinicDomain"("domain");

-- 4. Crear o Actualizar ClinicSettings
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ClinicSettings') THEN
        CREATE TABLE "ClinicSettings" (
            "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "clinicId" UUID NOT NULL UNIQUE REFERENCES "Clinic"("id") ON DELETE CASCADE,
            "phone" TEXT,
            "address" TEXT,
            "currency" TEXT NOT NULL DEFAULT 'BOB',
            "doctorName" TEXT,
            "specialty" TEXT,
            "pendingAppointmentsAlert" BOOLEAN NOT NULL DEFAULT true,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    ELSE
        -- Si ya existe con id text, asegurar que tenga columna clinicId
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ClinicSettings' AND column_name = 'clinicId') THEN
            ALTER TABLE "ClinicSettings" ADD COLUMN "clinicId" UUID;
        END IF;
    END IF;
END $$;

-- 5. Crear tabla ClinicTheme
CREATE TABLE IF NOT EXISTS "ClinicTheme" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clinicId" UUID NOT NULL UNIQUE REFERENCES "Clinic"("id") ON DELETE CASCADE,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0F6E56',
    "heroImageUrl" TEXT,
    "heroHeadline" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Crear tabla Testimonial
CREATE TABLE IF NOT EXISTS "Testimonial" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clinicId" UUID NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "quote" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Testimonial_clinicId_idx" ON "Testimonial"("clinicId");

-- 7. Crear tabla GalleryItem
CREATE TABLE IF NOT EXISTS "GalleryItem" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clinicId" UUID NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL, -- 'before_after' | 'certificate' | 'general'
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS "GalleryItem_clinicId_idx" ON "GalleryItem"("clinicId");

-- 8. Crear tabla user_clinic_map
CREATE TABLE IF NOT EXISTS "user_clinic_map" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "clinicId" UUID NOT NULL REFERENCES "Clinic"("id") ON DELETE CASCADE,
    "role" TEXT NOT NULL DEFAULT 'doctor',
    "branchId" UUID REFERENCES "Branch"("id") ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_clinic_map_userId_clinicId_key" UNIQUE ("userId", "clinicId")
);
CREATE INDEX IF NOT EXISTS "user_clinic_map_userId_idx" ON "user_clinic_map"("userId");
CREATE INDEX IF NOT EXISTS "user_clinic_map_clinicId_idx" ON "user_clinic_map"("clinicId");

-- ==============================================================================
-- INSERCIÓN DEL TENANT PILOTO (VILLARROEL)
-- ==============================================================================

INSERT INTO "Clinic" ("id", "name", "slug", "plan")
VALUES ('a0000000-0000-0000-0000-000000000001'::uuid, 'Clínica Odontológica Villarroel', 'villarroel', 'enterprise')
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name";

-- Dominios de Villarroel
INSERT INTO "ClinicDomain" ("clinicId", "domain", "isPrimary")
VALUES 
    ('a0000000-0000-0000-0000-000000000001'::uuid, 'clinica-villarroel.vercel.app', true),
    ('a0000000-0000-0000-0000-000000000001'::uuid, 'localhost', false),
    ('a0000000-0000-0000-0000-000000000001'::uuid, 'localhost:3000', false),
    ('a0000000-0000-0000-0000-000000000001'::uuid, 'villarroel.clinicos.app', false)
ON CONFLICT ("domain") DO NOTHING;

-- Tema de Villarroel
INSERT INTO "ClinicTheme" ("clinicId", "primaryColor", "heroHeadline")
VALUES ('a0000000-0000-0000-0000-000000000001'::uuid, '#0F6E56', 'Tu sonrisa en manos expertas')
ON CONFLICT ("clinicId") DO NOTHING;

-- ==============================================================================
-- AGREGAR COLUMNAS clinicId / branchId A TODAS LAS TABLAS EXISTENTES
-- Y ASIGNAR AL TENANT VILLARROEL
-- ==============================================================================

-- Helper macro para cada tabla
DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY[
        'Patient', 'Appointment', 'Payment', 'DoctorPayment', 
        'Treatment', 'CaseMedia', 'TimelineEvent', 'AuditLog', 
        'ToothMoldChart', 'CephalometricCase'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
            -- Agregar clinicId si no existe
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'clinicId') THEN
                EXECUTE format('ALTER TABLE %I ADD COLUMN "clinicId" UUID REFERENCES "Clinic"("id") ON DELETE CASCADE DEFAULT ''a0000000-0000-0000-0000-000000000001''::uuid', t);
            END IF;
            -- Backfill de datos existentes
            EXECUTE format('UPDATE %I SET "clinicId" = ''a0000000-0000-0000-0000-000000000001''::uuid WHERE "clinicId" IS NULL', t);
            -- Crear indice
            EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I("clinicId")', t || '_clinicId_idx', t);
        END IF;
    END LOOP;
END $$;

-- Agregar branchId a Patient y Appointment
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Patient') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Patient' AND column_name = 'branchId') THEN
            ALTER TABLE "Patient" ADD COLUMN "branchId" UUID REFERENCES "Branch"("id") ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS "Patient_branchId_idx" ON "Patient"("branchId");
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Appointment') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Appointment' AND column_name = 'branchId') THEN
            ALTER TABLE "Appointment" ADD COLUMN "branchId" UUID REFERENCES "Branch"("id") ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS "Appointment_branchId_idx" ON "Appointment"("branchId");
        END IF;
    END IF;
END $$;

-- Vincular usuarios existentes en Profile a user_clinic_map
INSERT INTO "user_clinic_map" ("userId", "clinicId", "role")
SELECT "id", 'a0000000-0000-0000-0000-000000000001'::uuid, COALESCE("role", 'doctor')
FROM "Profile"
ON CONFLICT ("userId", "clinicId") DO UPDATE SET "role" = EXCLUDED."role";
