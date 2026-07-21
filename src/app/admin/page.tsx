import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createClient();
  
  // TODO: Fetch appointments for today
  
  return (
    <div>
      <h1 className="text-3xl font-serif text-primary mb-2">Agenda de Hoy</h1>
      <p className="text-textMain/70 mb-8">Gestión de citas y pacientes.</p>

      <div className="bg-white rounded-3xl p-8 border border-neutral/10 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-neutral/10 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">15:30</div>
                <div className="text-xs text-textMain/60 uppercase">Hoy</div>
              </div>
              <div className="w-px h-10 bg-neutral/20"></div>
              <div>
                <p className="font-medium text-textMain">Juan Pérez (VLR-001)</p>
                <p className="text-sm text-textMain/60">Revisión de Ortodoncia</p>
              </div>
            </div>
            <div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">Confirmado</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-neutral/10 hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">17:00</div>
                <div className="text-xs text-textMain/60 uppercase">Hoy</div>
              </div>
              <div className="w-px h-10 bg-neutral/20"></div>
              <div>
                <p className="font-medium text-textMain">María López (VLR-002)</p>
                <p className="text-sm text-textMain/60">Evaluación Implantes</p>
              </div>
            </div>
            <div>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium border border-yellow-200">Reservado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
