"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Lock, Mail, AlertCircle, ArrowRight, MessageCircle, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { store } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const WHATSAPP_CONTACT = process.env.NEXT_PUBLIC_WHATSAPP_CONTACT || "593998765432";
  const postulationMessage = encodeURIComponent(
    "Hola, quiero postularme como vendedor comisionista en Micro-Dropi EC"
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_CONTACT}?text=${postulationMessage}`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Por favor, ingresa tu email y contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (supabase && isSupabaseConfigured) {
        // 1. Autenticación real contra Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setErrorMessage("Credenciales incorrectas. Verifica tu email y contraseña asignada.");
          } else if (error.message.includes("Email not confirmed")) {
            setErrorMessage("Tu correo electrónico aún no ha sido verificado.");
          } else {
            setErrorMessage(error.message || "Error al autenticar con el servidor.");
          }
          setIsLoading(false);
          return;
        }

        if (data.session) {
          // Establecer cookie de sesión para sincronización con Middleware
          document.cookie = `dropi_session=${encodeURIComponent(data.session.user.id)}; path=/; max-age=604800; SameSite=Lax`;
          window.dispatchEvent(new Event("microdropi_auth_change"));
          router.push("/billetera");
          router.refresh();
          return;
        }
      } else {
        // 2. Acceso en modo local / asignado (cuando no se han configurado llaves de Supabase en .env.local)
        // Permite acceso controlado y testeo del MVP
        if (cleanPassword.length < 4) {
          setErrorMessage("La contraseña debe tener al menos 4 caracteres.");
          setIsLoading(false);
          return;
        }

        // Guardar sesión en cookies y store local
        document.cookie = `dropi_session=${encodeURIComponent(cleanEmail)}; path=/; max-age=604800; SameSite=Lax`;
        
        // Actualizar datos del vendedor si es la primera vez
        const currentSeller = store.getSeller();
        if (currentSeller) {
          currentSeller.fullName = cleanEmail.split("@")[0].toUpperCase() + " (Comisionista)";
          localStorage.setItem("microdropi_seller", JSON.stringify(currentSeller));
        }

        window.dispatchEvent(new Event("microdropi_auth_change"));
        router.push("/billetera");
        router.refresh();
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al intentar iniciar sesión.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-sm">
        {/* Logo y Encabezado de Marca */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-xl shadow-emerald-500/25">
            <Zap className="h-8 w-8 fill-current" />
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-2xl font-black tracking-tight text-white">
            <span>Micro-Dropi</span>
            <span>🇪🇨</span>
          </div>

          <p className="mt-1 text-xs font-medium text-neutral-400">
            Plataforma Privada de Comisiones y Ventas Contra Entrega (COD)
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-0.5 text-[10px] font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Acceso Exclusivo por Credenciales</span>
          </div>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-md">
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Correo Electrónico *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="vendedor@microdropi.ec"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Contraseña Asignada *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/25 transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verificando acceso...</span>
              ) : (
                <>
                  <span>Ingresar a mi Cuenta</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-neutral-900 px-2 text-neutral-500 font-semibold">
                ¿No tienes acceso?
              </span>
            </div>
          </div>

          {/* Botón de Postulación por WhatsApp */}
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 text-center">
            <p className="text-xs font-medium text-neutral-300">
              ¿Quieres ser comisionista de nuestro equipo?
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-400">
              El acceso es otorgado manualmente por nuestra administración.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 py-2.5 px-3 text-xs font-bold text-emerald-400 transition hover:bg-emerald-900/40 active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Solicita tu cuenta por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-[10px] text-neutral-500">
          Micro-Dropi Ecuador &copy; {new Date().getFullYear()} &bull; Pagos Contra Entrega (COD)
        </p>
      </div>
    </div>
  );
}
