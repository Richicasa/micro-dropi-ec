"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Wallet,
  Clock,
  CheckCircle2,
  TrendingUp,
  PlusCircle,
  ShoppingBag,
  ArrowUpRight,
  Package,
  AlertTriangle,
  ChevronRight,
  Truck
} from "lucide-react";
import { store } from "@/lib/store";
import { Order, SellerProfile, Product } from "@/lib/types";

export default function Home() {
  const [seller, setSeller] = useState<SellerProfile>(store.getSeller());
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [products, setProducts] = useState<Product[]>(store.getProducts());

  useEffect(() => {
    const refreshData = () => {
      setSeller(store.getSeller());
      setOrders(store.getOrders());
      setProducts(store.getProducts());
    };

    window.addEventListener("storage", refreshData);
    window.addEventListener("microdropi_update", refreshData);
    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("microdropi_update", refreshData);
    };
  }, []);

  const deliveredOrders = orders.filter((o) => o.status === "ENTREGADO");
  const inTransitOrders = orders.filter((o) => o.status === "EN_TRANSITO" || o.status === "GUIA_GENERADA");
  const noveltyOrders = orders.filter((o) => o.status === "NOVEDAD");

  // Efectividad de entrega en Ecuador (COD Benchmark)
  const totalFinished = deliveredOrders.length + orders.filter((o) => o.status === "DEVUELTO").length;
  const deliveryRate = totalFinished > 0 ? Math.round((deliveredOrders.length / totalFinished) * 100) : 85;

  return (
    <div className="mx-auto max-w-md space-y-5 px-4 sm:max-w-xl md:max-w-2xl">
      {/* Saludo & Status */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Hola, {seller.fullName.split(" ")[0]} 👋
            </h1>
            <span className="rounded-full border border-orange-500/40 bg-orange-950/40 px-2 py-0.5 text-[10px] font-bold text-orange-400">
              🔥 {seller.streakCount || 0}d
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Rango: <strong className="text-white font-semibold">{seller.sellerRank || "NOVATO"}</strong> &bull; COD Ecuador
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Bodega Activa</span>
        </div>
      </div>

      {/* Tarjetas de Balance Financiero */}
      <div className="grid grid-cols-2 gap-3">
        {/* Balance Disponible */}
        <div className="col-span-2 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-neutral-900/80 to-neutral-950 p-4 shadow-xl shadow-emerald-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Wallet className="h-4 w-4" />
              <span>SALDO DISPONIBLE (USD)</span>
            </div>
            <Link
              href="/billetera"
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:underline"
            >
              <span>Retirar</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight text-white">
            ${seller.balanceAvailable.toFixed(2)}
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            Listo para transferencias a Banco Pichincha, Guayaquil o DeUna! (Mínimo $20)
          </p>
        </div>

        {/* Balance Pendiente */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            <span>En Tránsito</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-white">
            ${seller.balancePending.toFixed(2)}
          </div>
          <span className="text-[10px] text-neutral-500">
            {inTransitOrders.length} pedido(s) en ruta COD
          </span>
        </div>

        {/* Total Retirado */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Total Cobrado</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-white">
            ${seller.balanceWithdrawn.toFixed(2)}
          </div>
          <span className="text-[10px] text-neutral-500">
            Comisiones liquidadas
          </span>
        </div>
      </div>

      {/* Banner Red de Referidos ($5 USD por amigo) */}
      <Link
        href="/equipo"
        className="flex items-center justify-between rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/50 via-neutral-900 to-neutral-950 p-3.5 transition hover:border-indigo-500/50 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 font-bold">
            👥
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Invita Comisionistas y Gana +$5.00 USD</span>
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">+$5</span>
            </div>
            <p className="text-[10px] text-neutral-400">
              Tu código: <strong className="text-emerald-400 font-mono">{seller.referralCode}</strong> &bull; {seller.referredCount || 0} amigos unidos
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-neutral-400" />
      </Link>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/pedidos/nuevo"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 px-4 font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:opacity-95 active:scale-[0.98]"
        >
          <PlusCircle className="h-5 w-5 stroke-[2.5]" />
          <span className="text-xs sm:text-sm">Nueva Venta COD</span>
        </Link>
        <Link
          href="/catalogo"
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/90 py-3 px-4 font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]"
        >
          <ShoppingBag className="h-5 w-5 text-neutral-400" />
          <span className="text-xs sm:text-sm">Ver Catálogo</span>
        </Link>
      </div>

      {/* Alerta de Novedades de Courier en Ecuador */}
      {noveltyOrders.length > 0 && (
        <Link
          href="/pedidos?filter=NOVEDAD"
          className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-amber-200 transition hover:bg-amber-950/50"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-300">
                {noveltyOrders.length} pedido(s) con Novedad de Entrega
              </p>
              <p className="text-[11px] text-amber-400/80">
                El repartidor no encontró al cliente. ¡Coordina por WhatsApp!
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-amber-400" />
        </Link>
      )}

      {/* Métricas Logísticas COD */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Rendimiento Logístico Ecuador
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-neutral-900 p-2.5">
            <div className="text-lg font-bold text-emerald-400">
              {deliveredOrders.length}
            </div>
            <div className="text-[10px] text-neutral-400">Entregados</div>
          </div>
          <div className="rounded-lg bg-neutral-900 p-2.5">
            <div className="text-lg font-bold text-amber-400">
              {inTransitOrders.length}
            </div>
            <div className="text-[10px] text-neutral-400">En Ruta</div>
          </div>
          <div className="rounded-lg bg-neutral-900 p-2.5">
            <div className="text-lg font-bold text-white">
              {deliveryRate}%
            </div>
            <div className="text-[10px] text-neutral-400">Efectividad</div>
          </div>
        </div>
      </div>

      {/* Pedidos Recientes */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Pedidos Recientes</h2>
          <Link href="/pedidos" className="text-xs text-emerald-400 hover:underline">
            Ver todos ({orders.length})
          </Link>
        </div>

        <div className="space-y-2">
          {orders.slice(0, 3).map((order) => {
            const isDelivered = order.status === "ENTREGADO";
            const isNovelty = order.status === "NOVEDAD";
            const isInTransit = order.status === "EN_TRANSITO" || order.status === "GUIA_GENERADA";

            return (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/70 p-3 transition hover:border-neutral-700"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">
                      {order.clientName}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                      <span>{order.canton}, {order.province}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-neutral-500">{order.trackingNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">
                    +${order.sellerCommission.toFixed(2)}
                  </div>
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                      isDelivered
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : isNovelty
                        ? "bg-amber-950 text-amber-300 border border-amber-800"
                        : isInTransit
                        ? "bg-blue-950 text-blue-300 border border-blue-800"
                        : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Productos con Mayor Ganancia */}
      <div className="space-y-2.5 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Productos Top para Vender</h2>
          <Link href="/catalogo" className="text-xs text-emerald-400 hover:underline">
            Explorar catálogo
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {products.slice(0, 2).map((prod) => (
            <Link
              key={prod.id}
              href={`/pedidos/nuevo?productId=${prod.id}`}
              className="group rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5 transition hover:border-emerald-500/50 hover:bg-neutral-900"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-800">
                <img
                  src={prod.images[0]}
                  alt={prod.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute top-1.5 left-1.5 rounded-md bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-black text-black">
                  Ganas ${prod.fixedCommission.toFixed(2)}
                </span>
              </div>
              <h3 className="mt-2 line-clamp-1 text-xs font-semibold text-white">
                {prod.title}
              </h3>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-neutral-400">PVP: ${prod.suggestedRetailPrice}</span>
                <span className="font-bold text-emerald-400">Stock: {prod.stock}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
