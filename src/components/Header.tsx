"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, PackageCheck, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { SellerProfile } from "@/lib/types";

export default function Header() {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setSeller(store.getSeller());

    const handleUpdate = () => {
      setSeller(store.getSeller());
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("microdropi_update", handleUpdate);
    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("microdropi_update", handleUpdate);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 sm:max-w-xl md:max-w-2xl">
        {/* Brand & Flag */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 font-black text-black shadow-lg shadow-emerald-500/20">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
              <span>Micro-Dropi</span>
              <span className="text-sm">🇪🇨</span>
            </div>
            <span className="block text-[10px] font-medium tracking-wide text-neutral-400">
              COD Ecuador &bull; Comisiones Directas
            </span>
          </div>
        </Link>

        {/* Live Balance Chips */}
        {seller && (
          <div className="flex items-center gap-2">
            <Link
              href="/billetera"
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-900/40"
              title="Saldo disponible para retiro inmediato"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>${seller.balanceAvailable.toFixed(2)}</span>
            </Link>
            
            <Link
              href="/pedidos"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-300"
              title="Saldo en tránsito (cobro pendiente en entrega)"
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>${seller.balancePending.toFixed(2)}</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
