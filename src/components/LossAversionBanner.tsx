"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Zap, Flame } from "lucide-react";
import { Order } from "@/lib/types";

interface LossAversionBannerProps {
  orders: Order[];
}

export default function LossAversionBanner({ orders }: LossAversionBannerProps) {
  // Calcular órdenes calificadas de la semana actual
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Lunes, ...
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const hoursUntilMidnight = 24 - now.getHours();

  // Filtrar órdenes entregadas con totalToCollect >= 18
  const qualifiedDeliveries = orders.filter((o) => {
    if (o.status !== "ENTREGADO") return false;
    return o.totalToCollect >= 18.0;
  }).length;

  // Determinar próximo objetivo
  let nextGoal = 3;
  let nextReward = 5;
  if (qualifiedDeliveries >= 7) {
    nextGoal = 15;
    nextReward = 40;
  } else if (qualifiedDeliveries >= 3) {
    nextGoal = 7;
    nextReward = 15;
  }

  const remaining = Math.max(0, nextGoal - qualifiedDeliveries);

  // Mostrar banner si faltan 3 o menos pedidos para la meta Y quedan menos de 3 días (o si es fin de semana)
  const isUrgentTime = daysUntilSunday <= 2;
  const isCloseToGoal = remaining > 0 && remaining <= 3;

  if (!isCloseToGoal && !isUrgentTime) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-neutral-900 to-amber-950/40 p-4 shadow-xl shadow-rose-950/20 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
          <AlertTriangle className="h-5 w-5 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
            <span>¡NO PIERDAS TU BONO SEMANAL!</span>
            <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-200">
              {daysUntilSunday === 0
                ? `Cierra hoy en ${hoursUntilMidnight}h`
                : `${daysUntilSunday} días restantes`}
            </span>
          </div>

          <p className="mt-1 text-xs text-neutral-200 leading-snug">
            {remaining === 1 ? (
              <>
                Te falta <strong className="text-amber-300 font-bold">solo 1 entrega más</strong> para embolsarte{" "}
                <strong className="text-emerald-400 font-bold">+${nextReward}.00 USD de bono en efectivo</strong>.
              </>
            ) : (
              <>
                Te faltan <strong className="text-amber-300 font-bold">{remaining} entregas</strong> para desbloquear{" "}
                <strong className="text-emerald-400 font-bold">+${nextReward}.00 USD extras</strong>.
              </>
            )}
            {" "}El domingo a las 23:59 el contador vuelve a cero.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-rose-900/30 transition hover:opacity-95 active:scale-95"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>Conseguir Ventas Ahora</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <span className="text-[11px] text-neutral-400">
              {qualifiedDeliveries}/{nextGoal} entregas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
