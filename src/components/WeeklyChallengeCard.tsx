"use client";

import { useMemo } from "react";
import { Trophy, Target, Sparkles, CheckCircle2, Flame, Clock, Award } from "lucide-react";
import { Order } from "@/lib/types";

interface WeeklyChallengeCardProps {
  orders: Order[];
}

export default function WeeklyChallengeCard({ orders }: WeeklyChallengeCardProps) {
  // 1. Calcular rango de la semana actual (Lunes 00:00 a Domingo 23:59 UTC-5 Ecuador)
  const { startOfWeek, endOfWeek, daysRemaining } = useMemo(() => {
    const now = new Date();
    // Ajuste a zona horaria de Ecuador (UTC-5)
    const ecTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Guayaquil" }));
    
    const dayOfWeek = ecTime.getDay(); // 0 = Domingo, 1 = Lunes, ...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(ecTime);
    monday.setDate(ecTime.getDate() + distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const msPerDay = 1000 * 60 * 60 * 24;
    const remainingDays = Math.max(0, Math.ceil((sunday.getTime() - ecTime.getTime()) / msPerDay));

    return {
      startOfWeek: monday,
      endOfWeek: sunday,
      daysRemaining: remainingDays
    };
  }, []);

  // 2. Filtrar órdenes calificadas:
  // - Estado: ENTREGADO
  // - Entregadas dentro de la semana actual
  // - totalToCollect >= 18.00
  const qualifiedOrders = useMemo(() => {
    return orders.filter((order) => {
      if (order.status !== "ENTREGADO") return false;

      const total = order.totalToCollect ?? 0;
      if (total < 18.0) return false;

      const deliveryDateStr = order.deliveredAt || order.createdAt;
      if (!deliveryDateStr) return false;

      const deliveryDate = new Date(deliveryDateStr);
      return deliveryDate >= startOfWeek && deliveryDate <= endOfWeek;
    });
  }, [orders, startOfWeek, endOfWeek]);

  const count = qualifiedOrders.length;

  // 3. Definición de Hitos y Niveles
  const milestones = [
    { level: 1, name: "Arranque", target: 3, bonus: 5, badge: "🥉", color: "from-amber-700 to-amber-500" },
    { level: 2, name: "Pro", target: 7, bonus: 15, badge: "🥈", color: "from-slate-400 to-zinc-300" },
    { level: 3, name: "Élite", target: 15, bonus: 40, badge: "🥇", color: "from-yellow-400 to-amber-300" }
  ];

  // 4. Determinar siguiente nivel y progreso
  const { currentMilestone, nextTarget, bonusReward, needed, progressPct, isAllCompleted } = useMemo(() => {
    if (count >= 15) {
      return {
        currentMilestone: milestones[2],
        nextTarget: 15,
        bonusReward: 40,
        needed: 0,
        progressPct: 100,
        isAllCompleted: true
      };
    }
    if (count >= 7) {
      const target = 15;
      return {
        currentMilestone: milestones[2],
        nextTarget: target,
        bonusReward: 40,
        needed: target - count,
        progressPct: Math.min(100, Math.round((count / target) * 100)),
        isAllCompleted: false
      };
    }
    if (count >= 3) {
      const target = 7;
      return {
        currentMilestone: milestones[1],
        nextTarget: target,
        bonusReward: 15,
        needed: target - count,
        progressPct: Math.min(100, Math.round((count / target) * 100)),
        isAllCompleted: false
      };
    }
    // Nivel 1
    const target = 3;
    return {
      currentMilestone: milestones[0],
      nextTarget: target,
      bonusReward: 5,
      needed: target - count,
      progressPct: Math.min(100, Math.round((count / target) * 100)),
      isAllCompleted: false
    };
  }, [count]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-4 shadow-xl shadow-amber-950/20">
      {/* Luz ambiental dorada de fondo */}
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Encabezado */}
      <div className="relative flex items-start justify-between gap-2 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-md shadow-amber-500/20">
            <Trophy className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                <span>Desafío Semanal de Ventas</span>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
              <Clock className="h-3 w-3 text-amber-400/80" />
              <span>
                Cierra este domingo a medianoche &bull;{" "}
                <strong className="text-amber-300">{daysRemaining} día(s)</strong> restantes
              </span>
            </div>
          </div>
        </div>

        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
          Bonos USD
        </span>
      </div>

      {/* Barra de Progreso y Métricas */}
      <div className="mt-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              Progreso: <strong className="text-emerald-400">{count}</strong> / {nextTarget} entregas
            </span>
          </div>
          <span className="text-[11px] font-bold text-neutral-400">{progressPct}%</span>
        </div>

        {/* Barra Visual */}
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 transition-all duration-500 shadow-sm shadow-emerald-500/30"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Llamado a la Acción Motivador */}
        <div className="rounded-xl bg-neutral-900/90 border border-neutral-800/80 p-2.5 text-xs">
          {isAllCompleted ? (
            <p className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
              <Flame className="h-4 w-4 text-amber-400 shrink-0" />
              <span>¡Felicitaciones! Has completado todas las metas élite de la semana. Bono de $40 USD acreditado.</span>
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-neutral-200 text-[11px]">
              <Flame className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                ¡Estás a solo <strong className="text-amber-300">{needed} venta(s)</strong> de desbloquear tu bono en efectivo de{" "}
                <strong className="text-emerald-400 font-extrabold">+${bonusReward}.00 USD</strong>!
              </span>
            </p>
          )}
        </div>
      </div>

      {/* 3 Indicadores de Hitos (🥉 $5, 🥈 $15, 🥇 $40) */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-neutral-800/80 pt-3">
        {milestones.map((m) => {
          const isReached = count >= m.target;

          return (
            <div
              key={m.level}
              className={`relative flex flex-col items-center justify-between rounded-xl border p-2 text-center transition ${
                isReached
                  ? "border-emerald-500/60 bg-emerald-950/40 text-white shadow-md shadow-emerald-950/30"
                  : "border-neutral-800 bg-neutral-900/60 text-neutral-400"
              }`}
            >
              {isReached && (
                <div className="absolute -top-1.5 -right-1.5 rounded-full bg-emerald-500 text-black p-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
              )}

              <div className="text-base">{m.badge}</div>
              <div className="text-[10px] font-bold mt-0.5 text-neutral-200">
                {m.name} ({m.target} COD)
              </div>

              <div
                className={`text-xs font-black mt-1 ${
                  isReached ? "text-emerald-400" : "text-amber-400/80"
                }`}
              >
                +${m.bonus} USD
              </div>

              <span className="text-[9px] text-neutral-500 mt-0.5">
                {isReached ? "¡Alcanzado!" : `${Math.max(0, m.target - count)} faltantes`}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 text-center">
        <span className="text-[9px] text-neutral-500">
          * Válido para órdenes COD con cobro ≥ $18.00 USD entregadas por courier en la semana en curso.
        </span>
      </div>
    </div>
  );
}
