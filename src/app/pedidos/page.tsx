"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/navigation";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  MessageCircle,
  ExternalLink,
  MapPin,
  DollarSign
} from "lucide-react";
import { store } from "@/lib/store";
import { Order, OrderStatus } from "@/lib/types";

function PedidosContent() {
  const searchParams = useSearchParams();
  const filterQuery = searchParams.get("filter") as OrderStatus | null;

  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [activeFilter, setActiveFilter] = useState<string>(filterQuery || "TODOS");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const refresh = () => setOrders(store.getOrders());
    window.addEventListener("storage", refresh);
    window.addEventListener("microdropi_update", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("microdropi_update", refresh);
    };
  }, []);

  const filterTabs = [
    { label: "Todos", value: "TODOS", count: orders.length },
    {
      label: "En Ruta",
      value: "EN_TRANSITO",
      count: orders.filter((o) => o.status === "EN_TRANSITO" || o.status === "GUIA_GENERADA").length
    },
    {
      label: "Novedad",
      value: "NOVEDAD",
      count: orders.filter((o) => o.status === "NOVEDAD").length
    },
    {
      label: "Entregados",
      value: "ENTREGADO",
      count: orders.filter((o) => o.status === "ENTREGADO").length
    },
    {
      label: "Devueltos",
      value: "DEVUELTO",
      count: orders.filter((o) => o.status === "DEVUELTO").length
    }
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.canton.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientPhone.includes(searchTerm);

    if (activeFilter === "TODOS") return matchesSearch;
    if (activeFilter === "EN_TRANSITO") {
      return matchesSearch && (order.status === "EN_TRANSITO" || order.status === "GUIA_GENERADA");
    }
    return matchesSearch && order.status === activeFilter;
  });

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 sm:max-w-xl md:max-w-2xl">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Mis Ventas y Envíos COD</span>
          <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">
            {orders.length} pedidos
          </span>
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Monitorea el estado logístico de tus paquetes en Servientrega y Laar Courier en tiempo real.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          placeholder="Buscar por cliente, tracking o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Filtros rápidos por estado */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === tab.value
                ? "bg-emerald-500 text-black"
                : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeFilter === tab.value
                  ? "bg-black/20 text-black font-black"
                  : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const isDelivered = order.status === "ENTREGADO";
          const isNovelty = order.status === "NOVEDAD";
          const isInTransit = order.status === "EN_TRANSITO" || order.status === "GUIA_GENERADA";
          const isReturned = order.status === "DEVUELTO";

          // Enlace directo para contactar al cliente por WhatsApp en caso de novedad o seguimiento
          const cleanPhone = order.clientPhone.replace(/\D/g, "");
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Hola ${order.clientName}, te saluda tu asesor de compras. Te escribo respecto a tu pedido de "${order.product?.title || "producto"}" con guía ${order.trackingNumber}. ¿Podrías confirmarme tu disponibilidad para recibirlo hoy?`
          )}`;

          return (
            <div
              key={order.id}
              className={`rounded-2xl border p-4 shadow-lg transition ${
                isNovelty
                  ? "border-amber-500/50 bg-amber-950/20"
                  : isDelivered
                  ? "border-emerald-500/30 bg-neutral-900/80"
                  : "border-neutral-800 bg-neutral-900/60"
              }`}
            >
              {/* Encabezado de la Tarjeta */}
              <div className="flex items-start justify-between gap-2 border-b border-neutral-800/80 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">
                      {order.trackingNumber}
                    </span>
                    <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400 font-medium">
                      {order.courierName}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-neutral-500 shrink-0" />
                    <span>{order.canton}, {order.province}</span>
                  </div>
                </div>

                {/* Badge de Estado */}
                <div className="text-right">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isDelivered
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : isNovelty
                        ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                        : isInTransit
                        ? "bg-blue-950 text-blue-300 border border-blue-500/40"
                        : isReturned
                        ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                        : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {isDelivered && <CheckCircle2 className="h-3 w-3" />}
                    {isNovelty && <AlertTriangle className="h-3 w-3" />}
                    {isInTransit && <Truck className="h-3 w-3" />}
                    {isReturned && <RotateCcw className="h-3 w-3" />}
                    <span>{order.status}</span>
                  </span>
                </div>
              </div>

              {/* Contenido de la Orden */}
              <div className="mt-3 space-y-2 text-xs">
                {/* Cliente */}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Cliente:</span>
                  <span className="font-semibold text-white">{order.clientName} ({order.clientCedula})</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Dirección:</span>
                  <span className="text-neutral-300 text-right max-w-[220px] line-clamp-1">
                    {order.clientAddress}
                  </span>
                </div>

                {order.deliveryReference && (
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-neutral-500">Referencia:</span>
                    <span className="text-neutral-400 italic text-right max-w-[220px] line-clamp-1">
                      {order.deliveryReference}
                    </span>
                  </div>
                )}

                {/* Novedad de Courier */}
                {order.courierStatusDetail && (
                  <div
                    className={`mt-2 rounded-xl p-2.5 text-[11px] ${
                      isNovelty
                        ? "bg-amber-950/60 border border-amber-500/30 text-amber-200"
                        : "bg-neutral-950 text-neutral-300"
                    }`}
                  >
                    <span className="font-bold block mb-0.5">Último Reporte del Courier:</span>
                    <span>{order.courierStatusDetail}</span>
                  </div>
                )}

                {/* Desglose Financiero */}
                <div className="mt-3 flex items-center justify-between border-t border-neutral-800/80 pt-2.5">
                  <div>
                    <span className="block text-[9px] text-neutral-500">COBRO EN EFECTIVO</span>
                    <span className="text-xs font-bold text-white">
                      ${order.totalToCollect.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[9px] text-emerald-400 font-medium">
                      {isDelivered ? "COMISIÓN ACREDITADA" : "COMISIÓN EN TRÁNSITO"}
                    </span>
                    <span
                      className={`text-sm font-black ${
                        isDelivered
                          ? "text-emerald-400"
                          : isReturned
                          ? "text-neutral-500 line-through"
                          : "text-amber-400"
                      }`}
                    >
                      +${order.sellerCommission.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Botón WhatsApp si hay Novedad o Seguimiento */}
                <div className="mt-2.5 pt-2 flex gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 py-2 px-3 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-950/60"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-400" />
                    <span>Contactar Cliente (WhatsApp)</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-800 p-8 text-center">
            <Package className="mx-auto h-8 w-8 text-neutral-600" />
            <p className="mt-2 text-xs text-neutral-400">
              No tienes pedidos en la categoría &quot;{activeFilter}&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PedidosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Cargando pedidos...</div>}>
      <PedidosContent />
    </Suspense>
  );
}
