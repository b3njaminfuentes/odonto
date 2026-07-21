import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, Calendar, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // TODO: Check if user is actually admin
  // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  // if (profile?.role !== 'admin') redirect("/portal");

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-primary text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-serif">Panel Clínico</h2>
          <p className="text-xs text-white/60 mt-1">Dra. Villarroel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            <Calendar size={18} />
            Agenda
          </Link>
          <Link href="/admin/pacientes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            <Users size={18} />
            Pacientes
          </Link>
          <Link href="/admin/configuracion" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
            <Settings size={18} />
            Configuración
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-500/20 text-red-300 w-full transition-colors">
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-12 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
