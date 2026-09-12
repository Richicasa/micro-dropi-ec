"use client";

import { useState } from "react";
import { Flame, Award, ShieldCheck, X, Zap } from "lucide-react";
import { SellerRank } from "@/lib/types";

interface StreakBadgeProps {
  streakCount: number;
  sellerRank: SellerRank;
  deliveredCount?: number;
}

export default function StreakBadge({ streakCount, sellerRank, deliveredCount = 5 }: StreakBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getRankBadge = () => {
    switch (sellerRank) {
      case "ELITE":
        return {
          icon: "🥇",
          label: "Élite",
          badgeClass: "border-amber-400/40 bg-amber-950/60 text-amber-300",
          perk: "Acceso a Catálogo VIP y Soporte Dedicado 24/7"
        };
      case "VERIFICADO":
        return {
          icon: "🥈",
          label: "Verificado",
          badgeClass: "border-cyan-400/40 bg-cyan-950/60 text-cyan-300",
          perk: "Despacho prioritario en bodega y retiro exprés"
        };
      case "NOVATO":
      default:
        return {
          icon: "🥉",
          label: "Novato",
          badgeClass: "border-orange-400/30 bg-orange-950/40 text-orange-300",
          perk: "5 entregas para subir a Verificado"
        };
    }
  };

  const rankInfo = getRankBadge();

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* Racha Diaria Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-950/50 px-2.5 py-1 text-xs font-bold text-orange-400 transition hover:bg-orange-900/50 active:scale-95 shadow-sm shadow-orange-950/50"
          title="Racha activa de ventas"
        >
          <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-400 animate-pulse" />
          <span>{streakCount}d</span>
        </button>

        {/* Rank Mini Chip */}
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold transition hover:opacity-90 active:scale-95 ${rankInfo.badgeClass}`}
          title={`Rango: ${rankInfo.label}`}
        >
          <span>{rankInfo.icon}</span>
          <span className="hidden xs:inline">{rankInfo.label}</span>
        </button>
      </div>

      {/* MODAL DETALLES DE RACHA Y RANGOS */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400">
                  <Flame className="h-5 w-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Racha & Rango de Vendedor</h3>
                  <p className="text-[10px] text-neutral-400">Beneficios por fidelidad y actividad COD</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-neutral-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Estado Actual de Racha */}
            <div className="mt-4 rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-950/40 to-neutral-900 p-3.5 text-center">
              <div className="flex items-center justify-center gap-2">
                <Flame className="h-6 w-6 fill-orange-500 text-orange-400 animate-bounce" />
                <span className="text-2xl font-black text-white">{streakCount} Días Consecutivos</span>
              </div>
              <p className="mt-1 text-[11px] text-orange-200/90">
                ¡Tienes encendido el fuego de ventas! Registra o entrega al menos un pedido diario para no perder tu racha.
              </p>
            </div>

            {/* Escala de Rangos */}
            <div className="mt-4 space-y-2">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-400" />
                Niveles y Beneficios de Comisionista
              </span>

              {/* Novato */}
              <div className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${sellerRank === "NOVATO" ? "border-orange-500/50 bg-orange-950/30" : "border-neutral-800 bg-neutral-900/40"}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🥉</span>
                  <div>
                    <div className="font-bold text-white">Novato (0 - 4 entregas)</div>
                    <div className="text-[10px] text-neutral-400">Comisiones COD regulares y pago en 24h</div>
                  </div>
                </div>
                {sellerRank === "NOVATO" && (
                  <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[9px] font-bold text-orange-300">
                    Tu Rango
                  </span>
                )}
              </div>

              {/* Verificado */}
              <div className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${sellerRank === "VERIFICADO" ? "border-cyan-500/50 bg-cyan-950/30" : "border-neutral-800 bg-neutral-900/40"}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🥈</span>
                  <div>
                    <div className="font-bold text-white">Verificado (5 - 19 entregas)</div>
                    <div className="text-[10px] text-neutral-400">Despacho prioritario en bodega y retiro exprés</div>
                  </div>
                </div>
                {sellerRank === "VERIFICADO" && (
                  <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                    Tu Rango
                  </span>
                )}
              </div>

              {/* Élite */}
              <div className={`flex items-center justify-between rounded-xl border p-2.5 text-xs ${sellerRank === "ELITE" ? "border-amber-500/50 bg-amber-950/30" : "border-neutral-800 bg-neutral-900/40"}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🥇</span>
                  <div>
                    <div className="font-bold text-white">Élite (20+ entregas)</div>
                    <div className="text-[10px] text-neutral-400">Acceso a Catálogo VIP con mayores márgenes y soporte 24/7</div>
                  </div>
                </div>
                {sellerRank === "ELITE" && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                    Tu Rango
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full rounded-xl bg-neutral-800 py-2.5 text-xs font-bold text-white hover:bg-neutral-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
