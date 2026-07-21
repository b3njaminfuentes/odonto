import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Star, FileText, Calendar, CreditCard, LogOut } from "lucide-react";
import Link from "next/link";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Sidebar Privado */}
      <aside className="w-64 bg-white border-r border-neutral/10 hidden md:flex flex-col">
        <div className="p-6 border-b border-neutral/10">
          <h2 className="text-xl font-serif text-primary">Mi Portal</h2>
          <p className="text-xs text-textMain/60 mt-1">Clínica Villarroel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/portal" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-textMain hover:bg-primary/5 hover:text-primary transition-colors">
            <Calendar size={18} />
            Mi Tratamiento
          </Link>
          <Link href="/portal/progreso" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-textMain hover:bg-primary/5 hover:text-primary transition-colors">
            <Star size={18} />
            Progreso y Casos
          </Link>
          <Link href="/portal/pagos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-textMain hover:bg-primary/5 hover:text-primary transition-colors">
            <CreditCard size={18} />
            Pagos
          </Link>
        </nav>

        <div className="p-4 border-t border-neutral/10">
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors">
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-12 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
