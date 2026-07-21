"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Checking roles or routing to portal/admin could happen here or in middleware
    router.push("/portal");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-6">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-neutral/10">
        <h1 className="text-3xl font-serif text-primary mb-2 text-center">Bienvenido</h1>
        <p className="text-textMain/60 text-center mb-8">Ingresá a tu portal de paciente</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMain/80 mb-2">Correo o Código</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral/20 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              placeholder="ej: juan@email.com o VLR-001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMain/80 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-neutral/20 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
