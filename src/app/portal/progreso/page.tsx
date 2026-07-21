import { createClient } from "@/lib/supabase/server";

export default async function ProgresoPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Obtener casos del paciente (Mock)
  // const { data: cases } = await supabase.from('cases').select('*, case_media(*)').eq('patient_id', patientId);

  return (
    <div>
      <h1 className="text-3xl font-serif text-primary mb-2">Mi Progreso</h1>
      <p className="text-textMain/70 mb-8">Historial de tu tratamiento, fotos clínicas y videos asignados.</p>

      <div className="bg-white rounded-3xl p-8 border border-neutral/10 shadow-sm mb-8">
        <h2 className="text-xl font-serif text-primary mb-6">Fotos del Caso</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Placeholder para fotos */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-neutral/10 rounded-xl overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center text-textMain/40 text-sm">
                Foto {i}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-neutral/10 shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-6">Videos Recomendados</h2>
        <p className="text-textMain/70 mb-6">Material exclusivo preparado para ti por la Dra. Villarroel.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="border border-neutral/10 rounded-2xl p-4 flex gap-4 items-start">
             <div className="w-32 h-20 bg-neutral/10 rounded-lg shrink-0"></div>
             <div>
               <h4 className="font-medium text-primary">Cuidados Post-Extracción</h4>
               <p className="text-sm text-textMain/60 mt-1">Qué hacer las primeras 24 horas.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
