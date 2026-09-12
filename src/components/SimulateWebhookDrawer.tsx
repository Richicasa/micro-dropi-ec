"use client";

import { useState } from "react";
import { Sliders, CheckCircle, AlertTriangle, RotateCcw, X, Send } from "lucide-react";
import { store } from "@/lib/store";
import { OrderStatus } from "@/lib/types";
import { showToast } from "./Toast";

export default function SimulateWebhookDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("ENTREGADO");
  const [detail, setDetail] = useState("Entrega completada exitosamente en efectivo");
  const [isLoading, setIsLoading] = useState(false);

  const orders = store.getOrders();

  const handleSimulate = async () => {
    if (!selectedTracking && orders.length > 0) {
      setSelectedTracking(orders[0].trackingNumber);
    }

    const trackingToUse = selectedTracking || (orders[0]?.trackingNumber ?? "");
    if (!trackingToUse) {
      showToast("No hay órdenes registradas para simular", "error");
      return;
    }

    setIsLoading(true);
    try {
      const orderObj = orders.find(
        (o) => o.trackingNumber === trackingToUse || o.id === trackingToUse
      );
      const orderIdToUse = orderObj ? orderObj.id : trackingToUse;

      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret":
            process.env.NEXT_PUBLIC_INTERNAL_WEBHOOK_SECRET || "clave_secreta_dropi_ec_9988"
        },
        body: JSON.stringify({
          orderId: orderIdToUse,
          newStatus: selectedStatus,
          notes: detail
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al invocar API de actualización");
      }

      showToast(`Pedido actualizado: ${selectedStatus}. Saldo liquidado.`, "success");
      
      // Notificar a la app para refrescar estado
      window.dispatchEvent(new Event("microdropi_update"));
      setIsOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error simulando webhook";
      showToast(msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante para pruebas */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900/90 px-3 py-2 text-xs font-semibold text-neutral-200 shadow-xl backdrop-blur-md transition hover:border-emerald-500 hover:text-emerald-400 active:scale-95"
        title="Simulador de Webhooks de n8n / Courier"
      >
        <Sliders className="h-4 w-4 text-emerald-400" />
        <span className="hidden sm:inline">Simular Courier COD</span>
        <span className="sm:hidden">Courier Test</span>
      </button>

      {/* Modal / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Simulador de Entrega Courier COD
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-xs text-neutral-400">
              Prueba la respuesta automática de la API interna cuando Laar Courier o Servientrega reportan entrega y cobro en efectivo.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              {/* Seleccionar Guía / Orden */}
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Guía / Pedido a actualizar:
                </label>
                <select
                  value={selectedTracking}
                  onChange={(e) => setSelectedTracking(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  {orders.map((ord) => (
                    <option key={ord.id} value={ord.trackingNumber}>
                      {ord.trackingNumber} - {ord.clientName} ({ord.status} - ${ord.sellerCommission} com.)
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleccionar Nuevo Estado */}
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Nuevo Estado de Entrega:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus("ENTREGADO");
                      setDetail("Entregado con éxito y cobrado en efectivo al cliente");
                    }}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition ${
                      selectedStatus === "ENTREGADO"
                        ? "border-emerald-500 bg-emerald-950/40 text-emerald-400 font-bold"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 mb-1" />
                    <span>ENTREGADO</span>
                    <span className="text-[9px] text-neutral-500 font-normal">Libera saldo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus("NOVEDAD");
                      setDetail("Dirección no encontrada / Teléfono no contesta");
                    }}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition ${
                      selectedStatus === "NOVEDAD"
                        ? "border-amber-500 bg-amber-950/40 text-amber-400 font-bold"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 mb-1" />
                    <span>NOVEDAD</span>
                    <span className="text-[9px] text-neutral-500 font-normal">Requiere gestión</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStatus("DEVUELTO");
                      setDetail("Cliente rechazó el producto / Tiempo límite superado");
                    }}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition ${
                      selectedStatus === "DEVUELTO"
                        ? "border-rose-500 bg-rose-950/40 text-rose-400 font-bold"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    <RotateCcw className="h-4 w-4 mb-1" />
                    <span>DEVUELTO</span>
                    <span className="text-[9px] text-neutral-500 font-normal">Cancela comisión</span>
                  </button>
                </div>
              </div>

              {/* Detalle Courier */}
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Mensaje del Courier:
                </label>
                <input
                  type="text"
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Acción */}
              <button
                type="button"
                onClick={handleSimulate}
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-2.5 font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>{isLoading ? "Actualizando..." : "Actualizar Estado (Simular Courier)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
