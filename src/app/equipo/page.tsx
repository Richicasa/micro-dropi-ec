"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Copy,
  Check,
  Share2,
  DollarSign,
  Gift,
  Award,
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { store } from "@/lib/store";
import { SellerProfile } from "@/lib/types";
import { showToast } from "@/components/Toast";

export default function EquipoPage() {
  const [seller, setSeller] = useState<SellerProfile>(store.getSeller());
  const [referrals, setReferrals] = useState(store.getReferrals());
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setSeller(store.getSeller());
      setReferrals(store.getReferrals());
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("microdropi_update", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("microdropi_update", handleUpdate);
    };
  }, []);

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/registro?ref=${seller.referralCode}`
    : `https://microdropi.ec/registro?ref=${seller.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(seller.referralCode);
    setCopiedCode(true);
    showToast(`Código ${seller.referralCode} copiado al portapapeles`, "success");
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast("Enlace de referido copiado", "success");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `🇪🇨 ¡Hola! Te invito a vender productos por internet en Ecuador sin invertir en stock con Micro-Dropi.\n\n` +
      `🎁 Regístrate con mi código *${seller.referralCode}* y recibe *$5.00 USD de bienvenida* de inmediato:\n` +
      `${referralLink}\n\n` +
      `¡Pagas contra entrega en todo el país y ganas comisiones en efectivo!`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const activeReferralsCount = referrals.filter((r) => r.firstOrderDelivered).length;

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 sm:max-w-xl md:max-w-2xl">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Mi Equipo & Red de Referidos</span>
          <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-400">
            Programa Viral 🇪🇨
          </span>
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Construye tu red de comisionistas en Ecuador y gana comisiones pasivas de por vida.
        </p>
      </div>

      {/* Tarjeta Principal de Referidos con Ganancia Extra */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-neutral-900 to-neutral-950 p-5 shadow-xl shadow-indigo-950/20">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
          <Gift className="h-4 w-4" />
          <span>PROGRAMA DE EMBAJADORES DROPI</span>
        </div>

        <div className="mt-2 text-2xl sm:text-3xl font-black text-white">
          Gana <span className="text-emerald-400">+$5.00 USD</span> por amigo
        </div>

        <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
          Cada comisionista que se registre con tu código recibe un <strong className="text-amber-300">Bono de Bienvenida de $5.00 USD</strong>.
          Cuando entregue su primer pedido con cobro en efectivo, tú recibes automáticamente <strong className="text-emerald-400">+$5.00 USD</strong> en tu saldo retirable.
        </p>

        {/* Código y Botones de Compartir */}
        <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950/80 p-3">
          <div className="text-[11px] font-medium text-neutral-400 mb-1">
            Tu Código de Invitación Exclusivo:
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-lg font-black tracking-wider text-emerald-400">
              {seller.referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition active:scale-95"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCode ? "¡Copiado!" : "Copiar Código"}</span>
            </button>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 transition active:scale-95"
          >
            <Share2 className="h-4 w-4" />
            <span>Enviar por WhatsApp</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 py-2.5 px-3 text-xs font-bold text-white transition active:scale-95"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <ArrowUpRight className="h-4 w-4" />}
            <span>{copiedLink ? "¡Enlace Copiado!" : "Copiar Enlace"}</span>
          </button>
        </div>
      </div>

      {/* Métricas de Red */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-center">
          <span className="text-[10px] font-medium text-neutral-400 block">Total Amigos</span>
          <span className="mt-1 text-xl font-black text-white">{seller.referredCount || referrals.length}</span>
          <span className="text-[9px] text-neutral-500 block">Registrados</span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-center">
          <span className="text-[10px] font-medium text-neutral-400 block">Activos COD</span>
          <span className="mt-1 text-xl font-black text-emerald-400">{activeReferralsCount}</span>
          <span className="text-[9px] text-neutral-500 block">Con 1ra Entrega</span>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 text-center">
          <span className="text-[10px] font-medium text-neutral-400 block">Ganancias Red</span>
          <span className="mt-1 text-xl font-black text-emerald-400">
            ${seller.totalReferralEarnings ? seller.totalReferralEarnings.toFixed(2) : (activeReferralsCount * 5).toFixed(2)}
          </span>
          <span className="text-[9px] text-neutral-500 block">USD Cobrados</span>
        </div>
      </div>

      {/* Lista de Vendedores Referidos */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <span>Comisionistas en tu Red</span>
          </h2>
          <span className="text-[11px] text-neutral-400">{referrals.length} miembros</span>
        </div>

        <div className="space-y-2">
          {referrals.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/70 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 font-bold text-white text-xs">
                  {friend.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{friend.name}</div>
                  <div className="text-[10px] text-neutral-400">{friend.joinedDate}</div>
                </div>
              </div>

              <div className="text-right">
                {friend.firstOrderDelivered ? (
                  <>
                    <div className="text-xs font-bold text-emerald-400">
                      +${friend.bonusEarned.toFixed(2)} USD
                    </div>
                    <span className="inline-block rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                      Bono Cobrado
                    </span>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold text-neutral-400">
                      Pendiente
                    </div>
                    <span className="inline-block rounded-full bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-[9px] font-medium text-amber-300">
                      En 1ra venta
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reglas Claras del Sistema de Referidos */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-4 text-xs text-neutral-400 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>¿Cómo funciona el Bono de Referidos en Ecuador?</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-300 leading-relaxed">
          <li>Comparte tu enlace o código <strong className="text-white">{seller.referralCode}</strong> con amigos, comisionistas o grupos de Facebook/Telegram.</li>
          <li>Tu amigo recibe <strong className="text-emerald-400">$5.00 USD de bienvenida</strong> cargados en su billetera al registrarse.</li>
          <li>Cuando tu invitado realice su <strong className="text-white">primer pedido y el courier confirme entrega en efectivo</strong>, el sistema te acredita <strong className="text-emerald-400">+$5.00 USD de inmediato</strong>.</li>
          <li>¡No hay límite de referidos! Puedes invitar a tantos comisionistas como desees.</li>
        </ol>
      </div>
    </div>
  );
}
