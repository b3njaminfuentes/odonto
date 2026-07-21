import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, Upload, FileText, CreditCard, PlayCircle } from "lucide-react";
import Link from "next/link";

export default async function PacienteDetallePage({ params }: { params: { id: string } }) {
  // const supabase = createClient();
  
  return (
    <div>
      <Link href="/admin/pacientes" className="inline-flex items-center gap-2 text-textMain/60 hover:text-primary transition-colors mb-6 text-sm font-medium">
        <ArrowLeft size={16} />
        Volver a Pacientes
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-primary mb-2">Juan Pérez</h1>
          <p className="text-textMain/70">Código: <span className="font-medium text-primary">VLR-001</span> • +591 70000001</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-neutral/20 text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral/5 transition-colors">
            Editar Perfil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Tabs / Acciones */}
        <div className="col-span-1 space-y-4">
          <button className="w-full bg-white p-4 rounded-2xl border border-primary/20 shadow-sm flex items-center justify-between text-left group hover:border-primary transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <p className="font-medium text-primary">Historial Clínico</p>
                <p className="text-xs text-textMain/60">Tratamientos y notas</p>
              </div>
            </div>
          </button>

          <button className="w-full bg-white p-4 rounded-2xl border border-neutral/10 shadow-sm flex items-center justify-between text-left group hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <Upload size={18} />
              </div>
              <div>
                <p className="font-medium text-textMain">Subir Fotos/Casos</p>
                <p className="text-xs text-textMain/60">Actualizar progreso</p>
              </div>
            </div>
          </button>

          <button className="w-full bg-white p-4 rounded-2xl border border-neutral/10 shadow-sm flex items-center justify-between text-left group hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <div>
                <p className="font-medium text-textMain">Pagos y Saldos</p>
                <p className="text-xs text-textMain/60">Gestionar cobranzas</p>
              </div>
            </div>
          </button>

          <button className="w-full bg-white p-4 rounded-2xl border border-neutral/10 shadow-sm flex items-center justify-between text-left group hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <PlayCircle size={18} />
              </div>
              <div>
                <p className="font-medium text-textMain">Asignar Videos</p>
                <p className="text-xs text-textMain/60">Post-operatorios</p>
              </div>
            </div>
          </button>
        </div>

        {/* Columna Derecha: Contenido Activo (Mock) */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 border border-neutral/10 shadow-sm">
             <h2 className="text-xl font-serif text-primary mb-6">Detalles del Tratamiento Actual</h2>
             <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-textMain/60 mb-1">Motivo de Consulta</p>
                  <p className="text-textMain bg-secondary/30 p-4 rounded-xl border border-neutral/5">
                    Paciente refiere dolor en piezas posteriores y desea evaluación para ortodoncia invisible.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-textMain/60 mb-1">Diagnóstico</p>
                  <p className="text-textMain bg-secondary/30 p-4 rounded-xl border border-neutral/5">
                    Maloclusión clase II. Caries incipiente en pieza 46.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-textMain/60 mb-1">Plan de Tratamiento</p>
                  <ul className="list-disc list-inside text-textMain space-y-2 bg-secondary/30 p-4 rounded-xl border border-neutral/5">
                    <li>Fase 1: Profilaxis y restauración resina P46.</li>
                    <li>Fase 2: Escaneo digital y plan de alineadores.</li>
                  </ul>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
