import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Clock } from "lucide-react";

export default async function PagosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-3xl font-serif text-primary mb-2">Mis Pagos</h1>
      <p className="text-textMain/70 mb-8">Historial de pagos y saldos pendientes.</p>

      <div className="bg-white rounded-3xl p-8 border border-neutral/10 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg text-textMain/70">Saldo Pendiente</h2>
            <p className="text-4xl font-serif text-primary mt-1">Bs. 500.00</p>
          </div>
          <button className="bg-accent text-white px-8 py-3 rounded-xl font-medium hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20">
            Pagar con QR
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-neutral/10 shadow-sm">
        <h2 className="text-xl font-serif text-primary mb-6">Historial</h2>
        <div className="space-y-4">
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-neutral/10 bg-secondary/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-medium text-textMain">Pago de Cuota Inicial</p>
                <p className="text-sm text-textMain/60">12 de Julio, 2026</p>
              </div>
            </div>
            <div className="font-medium text-primary">Bs. 1000.00</div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-neutral/10 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="font-medium text-textMain">Mantenimiento Mensual</p>
                <p className="text-sm text-textMain/60">Vence: 25 de Julio, 2026</p>
              </div>
            </div>
            <div className="font-medium text-orange-600">Bs. 500.00</div>
          </div>

        </div>
      </div>
    </div>
  );
}
