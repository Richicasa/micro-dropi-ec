"use client";

import { useState, useEffect } from "react";
import { Package, TrendingUp, X } from "lucide-react";

interface SaleNotification {
  id: string;
  name: string;
  city: string;
  product: string;
  commission: number;
  timeAgo: string;
  courier: string;
}

const SAMPLE_SALES: SaleNotification[] = [
  {
    id: "sale-1",
    name: "Andrea M.",
    city: "Guayaquil (Urdesa)",
    product: "Mini Licuadora Portátil USB",
    commission: 13.99,
    timeAgo: "hace 2 min",
    courier: "Laar Courier COD"
  },
  {
    id: "sale-2",
    name: "Esteban R.",
    city: "Quito (Cumbayá)",
    product: "Foco Cámara de Seguridad 360°",
    commission: 14.30,
    timeAgo: "hace 4 min",
    courier: "Servientrega COD"
  },
  {
    id: "sale-3",
    name: "Doménica S.",
    city: "Cuenca",
    product: "Cepillo Secador 3 en 1",
    commission: 12.20,
    timeAgo: "hace 7 min",
    courier: "Laar Courier COD"
  },
  {
    id: "sale-4",
    name: "Mateo V.",
    city: "Ambato",
    product: "Kit Restaurador de Faros",
    commission: 11.49,
    timeAgo: "hace 11 min",
    courier: "Servientrega COD"
  },
  {
    id: "sale-5",
    name: "Xavier G.",
    city: "Machala",
    product: "Mini Licuadora Portátil USB",
    commission: 13.99,
    timeAgo: "hace 14 min",
    courier: "Laar Courier COD"
  },
  {
    id: "sale-6",
    name: "Valeria C.",
    city: "Santo Domingo",
    product: "Foco Cámara 360° WiFi",
    commission: 14.30,
    timeAgo: "hace 18 min",
    courier: "Servientrega COD"
  }
];

export default function LiveSalesToast() {
  const [currentSale, setCurrentSale] = useState<SaleNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    const triggerNotification = () => {
      if (dismissed) return;
      const randomSale = SAMPLE_SALES[Math.floor(Math.random() * SAMPLE_SALES.length)];
      setCurrentSale(randomSale);
      setIsVisible(true);

      // Desaparece después de 6 segundos
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Primera aparición a los 6 segundos de entrar a la app
    const initialDelay = setTimeout(() => {
      triggerNotification();

      // Luego cada 35 segundos
      timer = setInterval(() => {
        triggerNotification();
      }, 35000);
    }, 6000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(hideTimer);
      clearInterval(timer);
    };
  }, [dismissed]);

  if (!currentSale || !isVisible) return null;

  return (
    <aside
      aria-label="Notificación de venta en vivo"
      className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto sm:left-auto sm:right-5 sm:bottom-24 sm:mx-0 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-neutral-900/95 p-3.5 shadow-2xl backdrop-blur-md shadow-emerald-950/40 text-xs">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black font-bold shadow-md shadow-emerald-500/20">
          <TrendingUp className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-white truncate">
              {currentSale.name} <span className="font-normal text-neutral-400">en {currentSale.city}</span>
            </span>
            <span className="text-[10px] text-neutral-500 shrink-0">{currentSale.timeAgo}</span>
          </div>

          <p className="mt-0.5 text-neutral-300 truncate text-[11px]">
            Vendió: <strong className="text-white">{currentSale.product}</strong>
          </p>

          <div className="mt-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              <Package className="h-2.5 w-2.5" />
              +${currentSale.commission.toFixed(2)} USD ganados
            </span>
            <span className="text-[9px] text-neutral-400 font-mono">
              {currentSale.courier}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setDismissed(true);
          }}
          className="text-neutral-500 hover:text-neutral-300 p-0.5"
          title="Cerrar notificación"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
