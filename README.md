# 🦷 Clínica Odontológica Villarroel — Plataforma Web & Expediente Digital

Plataforma web integral diseñada a medida para la **Clínica Odontológica Villarroel** (Cochabamba, Bolivia). Combina un sitio web público de alta conversión para atracción de pacientes con un panel de gestión médica y expediente digital avanzado.

---

## 🚀 Características Principales

### 🌐 1. Landing Page Pública (Atracción y Agenda Online)
- **Diseño UI/UX Premium**: Estética moderna con modo oscuro adaptativo, tipografías refinadas y micro-animaciones fluidas.
- **Reserva de Citas en Línea**: Calendario interactivo sincronizado en tiempo real con el huso horario de Bolivia (`America/La_Paz`, UTC-4).
- **Control de Capacidad**: Permite hasta un máximo de 2 citas simultáneas por franja horaria (atención en sillones/clínicas paralelas) y amplía la atención hasta las 20:00.
- **Galería de Transformaciones Reales**: Comparador *Antes / Después* con deslizador interactivo ajustado para visualización de resultados de alineación y estética dental.
- **Galería de Certificados**: Muestra interactiva de títulos y especializaciones de la Dra. Marisol Villarroel.
- **Testimonios e Información de Contacto**: Integración con Google Maps, WhatsApp directo y horarios detallados.

---

### 🩺 2. Panel Administrativo (Expediente Digital Clínico)
- **Gestión de Pacientes**: Creación, listado y acceso directo a expedientes digitales individuales por paciente.
- **Historial Clínico & Odontograma**: Registro de diagnósticos, evolución médica y seguimiento de tratamientos.
- **Organizador Multimedia Categorizado**:
  - 📷 **Foto de Perfil**: Identificación rápida del paciente.
  - 🖼️ **Fotos del Caso / Evolución**: Registro visual del progreso antes, durante y después del tratamiento.
  - 📁 **Documentos / Rayos X**: Almacenamiento seguro de radiografías, tomografías e informes en formato PDF/imagen.
  - 👁️ **Control de Visibilidad**: Permite marcar archivos como *Públicos* (visibles para el paciente) o *Privados* (solo uso interno).
- **Gestor de Citas e Intersecciones**: Agenda interna que valida automáticamente la disponibilidad y previene sobrecupos.

---

### 📄 3. Módulo de Cotizaciones y Presupuestos
- **Generador de Cotizaciones**: Selección dinámica de tratamientos incluidos para elaborar presupuestos en moneda local (**BOB**).
- **Formato de Impresión Limpio**: Configuración CSS optimizada (`@page`) que elimina automáticamente URLs del navegador, encabezados innecesarios y firmas irrelevantes, logrando documentos ejecutables de **1 sola página**.

---

### 👤 4. Portal del Paciente
- Espacio personalizado donde los pacientes pueden ingresar a consultar sus turnos programados, historial de tratamientos y los documentos o radiografías que la clínica haya compartido con ellos.

---

## 🛠️ Tecnología y Arquitectura

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router, Server Actions, React Server Components).
- **Lenguaje**: TypeScript.
- **Estilos**: Tailwind CSS + Lucide React.
- **Base de Datos & ORM**: PostgreSQL / Supabase + [Prisma ORM](https://www.prisma.io/).
- **Almacenamiento (Storage)**: Supabase Storage con subida segura mediante Service Role y firmas temporales de URL (`createSignedUrl`).
- **Manejo de Tiempos**: `@date-fns/tz` con anclaje explícito al huso horario de La Paz (`America/La_Paz`).

---

## ⚙️ Configuración e Instalación Local

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/b3njaminfuentes/odonto.git
cd odonto
npm install
```

### 2. Variables de entorno (`.env.local`)
Crea un archivo `.env.local` en la raíz del proyecto con las siguientes claves:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
DATABASE_URL=postgresql://usuario:password@host:5432/postgres
```

### 3. Sincronizar la base de datos
```bash
npx prisma db push
```

### 4. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📄 Licencia

Desarrollado para uso exclusivo de la **Clínica Odontológica Villarroel**. Todos los derechos reservados.
