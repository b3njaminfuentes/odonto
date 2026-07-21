-- Tabla de Pacientes (Extendida de auth.users o standalone)
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Vinculado a Supabase Auth
    patient_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Citas
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id),
    treatment_type VARCHAR(100),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'reservado', -- reservado, confirmado, completado, cancelado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Casos (Portafolio Clínico)
CREATE TABLE public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    treatment_type VARCHAR(100),
    created_by UUID REFERENCES auth.users(id), -- Doctora
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Archivos Multimedia del Caso (Fotos/Videos)
CREATE TABLE public.case_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id),
    media_type VARCHAR(50), -- foto, video
    url TEXT NOT NULL,
    caption TEXT,
    visibility VARCHAR(50) DEFAULT 'solo_paciente_dueño', -- solo_paciente_dueño, interno
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pagos
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id),
    appointment_id UUID REFERENCES public.appointments(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BOB',
    status VARCHAR(50) DEFAULT 'pendiente', -- pendiente, pagado
    method VARCHAR(50), -- qr, efectivo
    paid_at TIMESTAMP WITH TIME ZONE,
    qr_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Las políticas deben ajustarse según si el usuario es "admin" o el paciente dueño)
-- Ejemplo simple: los pacientes solo ven sus propios datos.
CREATE POLICY "Pacientes pueden ver sus propios datos" ON public.patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pacientes pueden ver sus propias citas" ON public.appointments
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM public.patients WHERE id = patient_id
    ));
