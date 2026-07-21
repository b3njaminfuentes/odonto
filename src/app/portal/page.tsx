import { createClient } from "@/lib/supabase/server";

export default async function PortalPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Obtener datos del paciente (Mock para estructura, se conecta real en Fase 3)
  // const { data: patient } = await supabase.from('patients').select('*').eq('user_id', user?.id).single();

  return (
    <div>
      <h1 className="text-3xl font-serif text-primary mb-2">Hola, Paciente</h1>
      <p className="text-textMain/70 mb-8">Aquí puedes ver el resumen de tu tratamiento actual.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Próxima Cita */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl p-8 border border-neutral/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-accent"></div>
          <h3 className="text-lg font-medium text-textMain mb-4">Tu Próxima Cita</h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-secondary/50 rounded-2xl p-6">
            <div className="text-center sm:text-left">
              <div className="text-4xl font-serif text-primary">24</div>
              <div className="text-sm font-medium text-textMain/70 uppercase tracking-wide">Julio</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-neutral/20"></div>
            <div>
              <p className="font-medium text-lg text-primary">Revisión de Ortodoncia</p>
              <p className="text-textMain/70">15:30 hrs • Consultorio 1</p>
            </div>
          </div>
        </div>

        {/* Estado del Tratamiento */}
        <div className="col-span-1 bg-primary text-white rounded-3xl p-8 shadow-md">
          <h3 className="text-lg font-medium mb-6">Fase Actual</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-serif">2</span>
            <span className="text-white/70 mb-1">/ 4</span>
          </div>
          <p className="font-medium mb-1">Alineación Inicial</p>
          <div className="w-full bg-white/20 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-accent h-full w-1/2 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
