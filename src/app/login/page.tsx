"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Lock,
  AlertCircle,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Phone,
  UserPlus,
  Check,
  Copy,
  X,
  MapPin,
  User,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { store } from "@/lib/store";

function normalizeEcuadorPhone(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("593")) {
    digits = "0" + digits.slice(3);
  }
  if (digits.length === 9 && digits.startsWith("9")) {
    digits = "0" + digits;
  }
  return digits;
}

interface RegistrationSuccessData {
  phone: string;
  password: string;
  fullName: string;
  city: string;
  balanceAvailable: number;
  referralCode: string;
}

export default function LoginPage() {
  const router = useRouter();

  // Estados de Login
  const [phoneInput, setPhoneInput] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados del Modal de Registro
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<RegistrationSuccessData | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const WHATSAPP_ADMIN = process.env.NEXT_PUBLIC_WHATSAPP_CONTACT || "593983741834";

  // --------------------------------------------------------------------------
  // INICIAR SESIÓN DIRECTO
  // --------------------------------------------------------------------------
  const executeLogin = async (targetPhone: string, targetPass: string, customName?: string) => {
    setErrorMessage(null);

    const cleanInput = targetPhone.trim();
    const cleanPassword = targetPass.trim();

    if (!cleanInput || !cleanPassword) {
      setErrorMessage("Por favor, ingresa tu número de WhatsApp y contraseña.");
      return;
    }

    let cleanPhone = cleanInput;
    let internalEmail = cleanInput;

    if (!cleanInput.includes("@")) {
      cleanPhone = normalizeEcuadorPhone(cleanInput);
      if (cleanPhone.length !== 10 || !cleanPhone.startsWith("09")) {
        setErrorMessage("El WhatsApp debe tener 10 dígitos y empezar con 09 (ej: 0983741834).");
        return;
      }
      internalEmail = `${cleanPhone}@microdropi.ec`;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (supabase && isSupabaseConfigured) {
        // 1. Autenticación real contra Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password: cleanPassword,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setErrorMessage("Credenciales incorrectas. Verifica tu WhatsApp y clave asignada.");
          } else if (error.message.includes("Email not confirmed")) {
            setErrorMessage("Tu cuenta aún está pendiente de confirmación.");
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
        // 2. Acceso en modo local / asignado (sin Supabase remoto conectado)
        const isMasterUser =
          cleanPhone === "0983741834" ||
          cleanPhone === "593983741834" ||
          cleanInput.toLowerCase() === "richi@microdropi.ec" ||
          cleanInput.toLowerCase() === "admin@microdropi.ec";

        if (isMasterUser) {
          if (cleanPassword !== "Ecuador2026*") {
            setErrorMessage("Contraseña incorrecta. Tu clave asignada es Ecuador2026*");
            setIsLoading(false);
            return;
          }
        } else if (cleanPassword.length < 4) {
          setErrorMessage("La contraseña debe tener al menos 4 caracteres.");
          setIsLoading(false);
          return;
        }

        // Guardar sesión en cookies para el middleware
        document.cookie = `dropi_session=${encodeURIComponent(cleanPhone)}; path=/; max-age=604800; SameSite=Lax`;

        // Actualizar datos del vendedor en localStorage
        const currentSeller = store.getSeller();
        if (currentSeller) {
          if (isMasterUser) {
            currentSeller.id = "seller-richi-01";
            currentSeller.fullName = "Richi Casa";
            currentSeller.phoneWhatsapp = "+593983741834";
            currentSeller.role = "admin";
            currentSeller.referralCode = "DROPI-RICHI";
            currentSeller.sellerRank = "VERIFICADO";
            currentSeller.balanceAvailable =
              currentSeller.balanceAvailable > 0 ? currentSeller.balanceAvailable : 5.00;
          } else {
            currentSeller.id = `seller-${cleanPhone}`;
            currentSeller.fullName = customName || `Vendedor ${cleanPhone.slice(-4)}`;
            currentSeller.phoneWhatsapp = `+593${cleanPhone.replace(/^0/, "")}`;
            currentSeller.role = "seller";
            currentSeller.referralCode = `DROPI-${cleanPhone.slice(-4).toUpperCase()}`;
            currentSeller.sellerRank = "NOVATO";
            currentSeller.balanceAvailable = 5.00;
            currentSeller.welcomeBonusAwarded = true;
          }
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

  const handleLoginFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(phoneInput, password);
  };

  // --------------------------------------------------------------------------
  // AUTO-REGISTRO DE VENDEDOR
  // --------------------------------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    const cleanName = regFullName.trim();
    const cleanPh = normalizeEcuadorPhone(regPhone);
    const cleanCt = regCity.trim();

    if (cleanName.length < 3) {
      setRegisterError("Ingresa tu nombre y apellido completo.");
      return;
    }

    if (cleanPh.length !== 10 || !cleanPh.startsWith("09")) {
      setRegisterError("El número de WhatsApp debe tener 10 dígitos y empezar con 09.");
      return;
    }

    if (!cleanCt) {
      setRegisterError("Por favor indica tu ciudad de residencia.");
      return;
    }

    setIsRegistering(true);

    try {
      const res = await fetch("/api/auth/register-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: cleanName,
          phone: cleanPh,
          city: cleanCt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar la cuenta.");
      }

      // Registro exitoso -> Mostrar credenciales en pantalla
      setRegisterSuccess({
        phone: data.phone,
        password: data.password,
        fullName: data.fullName,
        city: data.city,
        balanceAvailable: data.balanceAvailable || 5.0,
        referralCode: data.referralCode || `DROPI-${data.phone.slice(-4)}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error en el registro";
      setRegisterError(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  const copyPasswordToClipboard = () => {
    if (!registerSuccess) return;
    navigator.clipboard.writeText(registerSuccess.password);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleStartSessionAfterRegister = () => {
    if (!registerSuccess) return;
    setPhoneInput(registerSuccess.phone);
    setPassword(registerSuccess.password);
    setIsRegisterOpen(false);
    // Ejecutar login inmediato
    executeLogin(registerSuccess.phone, registerSuccess.password, registerSuccess.fullName);
  };

  const getWhatsAppBackupUrl = () => {
    if (!registerSuccess) return "#";
    const msg = encodeURIComponent(
      `🔐 *Mis Credenciales de Micro-Dropi EC* 🇪🇨\n\n` +
        `👤 *Nombre:* ${registerSuccess.fullName}\n` +
        `📱 *WhatsApp:* ${registerSuccess.phone}\n` +
        `🔑 *Contraseña:* ${registerSuccess.password}\n` +
        `💰 *Bono Inicial:* $5.00 USD (Acreditado)\n` +
        `🚀 *Código Referido:* ${registerSuccess.referralCode}\n\n` +
        `Acceso a la plataforma: ${typeof window !== "undefined" ? window.location.origin : ""}/login`
    );
    return `https://wa.me/593${registerSuccess.phone.replace(/^0/, "")}?text=${msg}`;
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
            <span>Acceso por WhatsApp &bull; Ecuador</span>
          </div>
        </div>

        {/* Tarjeta de Formulario de Inicio de Sesión */}
        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-md">
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginFormSubmit} className="space-y-4">
            {/* Campo Número de WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Número de WhatsApp *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  autoComplete="tel"
                  placeholder="09XXXXXXXX"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <span className="mt-1 block text-[10px] text-neutral-500">
                Tu número celular de 10 dígitos registrado en Ecuador.
              </span>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Contraseña de Acceso *
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
                ¿Aún no eres comisionista?
              </span>
            </div>
          </div>

          {/* Botón de Apertura de Auto-Registro */}
          <button
            type="button"
            onClick={() => {
              setIsRegisterOpen(true);
              setRegisterSuccess(null);
              setRegisterError(null);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 py-3 text-xs font-bold text-emerald-400 transition hover:bg-emerald-900/40 active:scale-[0.98]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Registrarme como Vendedor</span>
          </button>
        </div>

        {/* Footer info y soporte */}
        <p className="mt-6 text-center text-[10px] text-neutral-500">
          Micro-Dropi Ecuador &copy; {new Date().getFullYear()} &bull; Pagos Contra Entrega (COD)
        </p>
      </div>

      {/* =================================================================== */}
      {/* MODAL / FORMULARIO DE REGISTRO DE COMISIONISTAS                    */}
      {/* =================================================================== */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            {/* Botón cerrar */}
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {!registerSuccess ? (
              // 1. FORMULARIO DE REGISTRO
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Registro de Comisionista
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Gana comisiones fijas en efectivo por cada entrega COD
                    </p>
                  </div>
                </div>

                {/* Banner de Bono de Bienvenida */}
                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-300">
                  <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Bono de Bienvenida:</strong> Recibirás <strong>$5.00 USD</strong> acreditados en tu billetera al registrarte.
                  </span>
                </div>

                {registerError && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{registerError}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3.5">
                  {/* Nombre y Apellido */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Nombre y Apellido *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Juan Pérez"
                        value={regFullName}
                        onChange={(e) => setRegFullName(e.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      WhatsApp (10 dígitos) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="09XXXXXXXX"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <span className="mt-1 block text-[10px] text-neutral-500">
                      Aquí recibirás tu clave y las notificaciones de tus pagos.
                    </span>
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Ciudad de Residencia *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Quito, Guayaquil, Cuenca..."
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Botón de Envío */}
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-2.5 text-xs font-bold text-black shadow-md shadow-emerald-500/20 transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isRegistering ? (
                      <span>Generando tu cuenta y clave...</span>
                    ) : (
                      <>
                        <span>Obtener mi Clave de Acceso</span>
                        <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // 2. PANTALLA DE ÉXITO CON CREDENCIALES GENERADAS
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-3">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <h2 className="text-lg font-black text-white">
                  ¡Bienvenido a Micro-Dropi EC! 🎉
                </h2>
                <p className="mt-1 text-xs text-neutral-400">
                  Hola <span className="text-white font-semibold">{registerSuccess.fullName}</span>, tu cuenta comisionista ha sido activada con éxito.
                </p>

                {/* Banner de Saldo Acreditado */}
                <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-xs text-emerald-300 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>
                    Bono inicial: <strong>${registerSuccess.balanceAvailable.toFixed(2)} USD</strong> en Billetera
                  </span>
                </div>

                {/* Caja de Credenciales en Grande */}
                <div className="mt-4 rounded-2xl border-2 border-emerald-500/50 bg-neutral-950 p-4 text-left shadow-inner">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Tus Credenciales de Ingreso:
                  </div>

                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400 text-xs font-sans">Tu WhatsApp:</span>
                      <span className="text-white font-bold tracking-wide">
                        {registerSuccess.phone}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-neutral-400 text-xs font-sans">Tu Clave:</span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-base font-black text-emerald-400">
                          {registerSuccess.password}
                        </span>
                        <button
                          type="button"
                          onClick={copyPasswordToClipboard}
                          className="rounded-lg border border-neutral-700 bg-neutral-800 p-1 text-neutral-300 hover:text-white hover:bg-neutral-700 transition"
                          title="Copiar contraseña"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="mt-5 space-y-2.5">
                  {/* Botón Primario: Iniciar Sesión Ahora */}
                  <button
                    type="button"
                    onClick={handleStartSessionAfterRegister}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-xs font-bold text-black shadow-lg shadow-emerald-500/25 transition hover:opacity-95 active:scale-[0.98]"
                  >
                    <span>Iniciar Sesión Ahora</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </button>

                  {/* Botón Secundario: Guardar Clave en WhatsApp */}
                  <a
                    href={getWhatsAppBackupUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-400" />
                    <span>Guardar Clave en WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
