import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

export default async function AdminPacientesPage() {
  const supabase = createClient();
  
  // TODO: Fetch patients
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-primary mb-2">Pacientes</h1>
          <p className="text-textMain/70">Directorio de pacientes de la clínica.</p>
        </div>
        <button className="bg-accent text-white px-6 py-3 rounded-xl font-medium hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 flex items-center gap-2">
          <Plus size={18} />
          Nuevo Paciente
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-neutral/10 shadow-sm mb-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral/40" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o código (Ej: VLR-001)..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral/20 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral/10 text-textMain/60 text-sm">
                <th className="pb-3 font-medium">Código</th>
                <th className="pb-3 font-medium">Nombre Completo</th>
                <th className="pb-3 font-medium">Teléfono</th>
                <th className="pb-3 font-medium">Última Cita</th>
                <th className="pb-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral/5 hover:bg-secondary/20 transition-colors group">
                <td className="py-4 text-primary font-medium">VLR-001</td>
                <td className="py-4">Juan Pérez</td>
                <td className="py-4 text-textMain/70">+591 70000001</td>
                <td className="py-4 text-textMain/70">12/07/2026</td>
                <td className="py-4 text-right">
                  <Link href="/admin/pacientes/1" className="text-accent text-sm font-medium hover:underline">
                    Ver Ficha
                  </Link>
                </td>
              </tr>
              <tr className="hover:bg-secondary/20 transition-colors group">
                <td className="py-4 text-primary font-medium">VLR-002</td>
                <td className="py-4">María López</td>
                <td className="py-4 text-textMain/70">+591 70000002</td>
                <td className="py-4 text-textMain/70">10/07/2026</td>
                <td className="py-4 text-right">
                  <Link href="/admin/pacientes/2" className="text-accent text-sm font-medium hover:underline">
                    Ver Ficha
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
