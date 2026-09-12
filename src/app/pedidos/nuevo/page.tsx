"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Package,
  Truck,
  DollarSign,
  User,
  CreditCard,
  Phone,
  MapPin,
  HelpCircle,
  Send,
  Sparkles
} from "lucide-react";
import { store } from "@/lib/store";
import { Product } from "@/lib/types";
import {
  ECUADOR_PROVINCES,
  validateEcuadorianCedula,
  validateEcuadorianPhone
} from "@/lib/ecuador";
import { showToast } from "@/components/Toast";
import { createOrderAction } from "@/actions/orders";

function NuevoPedidoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get("productId") || "";

  const products = store.getProducts();

  // Estados del Formulario
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProductId || (products[0]?.id ?? "")
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [courierName, setCourierName] = useState<string>("Laar Courier");

  // Datos del Cliente en Ecuador
  const [clientName, setClientName] = useState("");
  const [clientCedula, setClientCedula] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedProvinceId, setSelectedProvinceId] = useState("pichincha");
  const [selectedCanton, setSelectedCanton] = useState("Quito");
  const [clientAddress, setClientAddress] = useState("");
  const [deliveryReference, setDeliveryReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Producto actual
  const currentProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  // Lista de cantones según la provincia seleccionada
  const activeProvince = useMemo(() => {
    return ECUADOR_PROVINCES.find((p) => p.id === selectedProvinceId) || ECUADOR_PROVINCES[0];
  }, [selectedProvinceId]);

  useEffect(() => {
    if (activeProvince && !activeProvince.cantons.includes(selectedCanton)) {
      setSelectedCanton(activeProvince.cantons[0]);
    }
  }, [selectedProvinceId, activeProvince, selectedCanton]);

  // Desglose Financiero en Vivo (Modelo COD)
  const deliveryCost = 3.50; // Tarifa estándar courier Ecuador
  const unitPrice = currentProduct ? currentProduct.suggestedRetailPrice : 25.0;
  const supplierUnitCost = currentProduct ? currentProduct.supplierCost : 7.5;
  const totalToCollect = Number((unitPrice * quantity).toFixed(2));
  const totalSupplierCost = Number((supplierUnitCost * quantity).toFixed(2));
  const sellerCommission = Number((totalToCollect - totalSupplierCost - deliveryCost).toFixed(2));

  // Validaciones en vivo
  const cedulaValidation = useMemo(() => {
    if (!clientCedula) return null;
    return validateEcuadorianCedula(clientCedula);
  }, [clientCedula]);

  const phoneValidation = useMemo(() => {
    if (!clientPhone) return null;
    return validateEcuadorianPhone(clientPhone);
  }, [clientPhone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      showToast("Ingresa el nombre completo del cliente", "error");
      return;
    }

    if (!cedulaValidation?.isValid) {
      showToast(cedulaValidation?.error || "La cédula ecuatoriana ingresada no es válida", "error");
      return;
    }

    if (!phoneValidation?.isValid) {
      showToast(phoneValidation?.error || "El teléfono ingresado no es válido para Ecuador", "error");
      return;
    }

    if (!clientAddress.trim()) {
      showToast("Ingresa la dirección de entrega detallada", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Invocar Server Action de creación y notificación a Telegram
      const result = await createOrderAction({
        productId: currentProduct.id,
        quantity,
        courierName,
        clientName: clientName.trim(),
        clientCedula: clientCedula.trim(),
        clientPhone: clientPhone.trim(),
        province: activeProvince.name,
        canton: selectedCanton,
        clientAddress: clientAddress.trim(),
        deliveryReference: deliveryReference.trim() || undefined
      });

      if (!result.success) {
        showToast(result.error || "Error al procesar pedido", "error");
        setIsSubmitting(false);
        return;
      }

      showToast(`¡Venta COD registrada con éxito! Guía ${result.trackingNumber} generada y notificada a bodega por Telegram.`, "success");
      
      // Notificar a la app para refrescar balances
      window.dispatchEvent(new Event("microdropi_update"));

      setTimeout(() => {
        router.push("/pedidos");
      }, 800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar pedido";
      showToast(msg, "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 sm:max-w-xl md:max-w-2xl">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Registro Rápido de Venta COD</span>
          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            Ecuador 🇪🇨
          </span>
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Ingresa los datos del cliente para despachar el paquete contra entrega. La guía se genera automáticamente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. SELECCIÓN DE PRODUCTO Y CANTIDAD */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-3">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
            1. Producto a Despachar
          </label>

          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2.5 text-xs font-medium text-white outline-none focus:border-emerald-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - (PVP: ${p.suggestedRetailPrice} | Stock: {p.stock})
              </option>
            ))}
          </select>

          {currentProduct && (
            <div className="flex items-center gap-3 rounded-xl bg-neutral-950 p-2.5 border border-neutral-800/80">
              <img
                src={currentProduct.images[0]}
                alt={currentProduct.title}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="flex-1 text-xs">
                <div className="font-semibold text-white line-clamp-1">{currentProduct.title}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Costo Proveedor: ${currentProduct.supplierCost} &bull; Stock Bodega: {currentProduct.stock} uds.
                </div>
              </div>
            </div>
          )}

          {/* Cantidad y Courier */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Cantidad
              </label>
              <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-950 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 rounded-lg bg-neutral-900 text-neutral-300 font-bold hover:bg-neutral-800 flex items-center justify-center"
                >
                  -
                </button>
                <span className="flex-1 text-center text-xs font-bold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 rounded-lg bg-neutral-900 text-neutral-300 font-bold hover:bg-neutral-800 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Courier Asignado
              </label>
              <select
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-white outline-none focus:border-emerald-500"
              >
                <option value="Laar Courier">Laar Courier (Recomendado)</option>
                <option value="Servientrega">Servientrega Ecuador</option>
                <option value="Speed Courier">Speed Courier Express</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. LIQUIDACIÓN COD EN TIEMPO REAL */}
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-neutral-900/90 to-neutral-950 p-4 shadow-lg shadow-emerald-950/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              Desglose Financiero COD
            </span>
            <span className="text-[10px] text-neutral-400">Pago en destino</span>
          </div>

          <div className="space-y-1.5 text-xs border-t border-neutral-800/80 pt-2">
            <div className="flex justify-between text-neutral-300">
              <span>Total a Cobrar al Cliente en Efectivo:</span>
              <span className="font-bold text-white">${totalToCollect.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>(-) Costo de Bodega ({quantity}x ${supplierUnitCost}):</span>
              <span>-${totalSupplierCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-400 text-[11px]">
              <span>(-) Flete Courier Nacional Ecuador:</span>
              <span>-${deliveryCost.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center border-t border-emerald-500/30 pt-2">
              <span className="font-bold text-xs text-white flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Tu Ganancia Neta:
              </span>
              <span className="text-base font-black text-emerald-400">
                +${sellerCommission.toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* 3. DATOS DEL CLIENTE (VALIDACIONES ECUADOR) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 space-y-3">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
            2. Datos del Cliente (Ecuador)
          </label>

          {/* Nombre */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Nombre y Apellido del Destinatario *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                required
                placeholder="Ej. María Fernanda Morales"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-10 pr-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Cédula de Ecuador con validación Módulo 10 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-neutral-400">
                Cédula de Identidad (10 dígitos) *
              </label>
              {cedulaValidation && (
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                  cedulaValidation.isValid ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {cedulaValidation.isValid ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" /> Cédula válida
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" /> Cédula no válida
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                required
                maxLength={10}
                placeholder="Ej. 1718293845"
                value={clientCedula}
                onChange={(e) => setClientCedula(e.target.value.replace(/\D/g, ""))}
                className={`w-full rounded-xl border bg-neutral-950 py-2 pl-10 pr-3 text-xs text-white placeholder-neutral-500 outline-none ${
                  cedulaValidation?.isValid === false
                    ? "border-rose-500 focus:border-rose-500"
                    : cedulaValidation?.isValid === true
                    ? "border-emerald-500 focus:border-emerald-500"
                    : "border-neutral-800 focus:border-emerald-500"
                }`}
              />
            </div>
            {cedulaValidation?.isValid === false && (
              <p className="mt-1 text-[10px] text-rose-400">
                {cedulaValidation.error}
              </p>
            )}
          </div>

          {/* Teléfono Celular WhatsApp Ecuador */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium text-neutral-400">
                Teléfono WhatsApp (Celular) *
              </label>
              {phoneValidation && (
                <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                  phoneValidation.isValid ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {phoneValidation.isValid ? "Formato Ecuador OK" : "Formato inválido"}
                </span>
              )}
            </div>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="tel"
                required
                placeholder="0987654321 ó +593987654321"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className={`w-full rounded-xl border bg-neutral-950 py-2 pl-10 pr-3 text-xs text-white placeholder-neutral-500 outline-none ${
                  phoneValidation?.isValid === false
                    ? "border-rose-500 focus:border-rose-500"
                    : phoneValidation?.isValid === true
                    ? "border-emerald-500 focus:border-emerald-500"
                    : "border-neutral-800 focus:border-emerald-500"
                }`}
              />
            </div>
            <span className="block text-[10px] text-neutral-500 mt-0.5">
              Esencial para coordinación de entrega del courier.
            </span>
          </div>

          {/* Provincia y Cantón de Ecuador */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Provincia *
              </label>
              <select
                value={selectedProvinceId}
                onChange={(e) => setSelectedProvinceId(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-white outline-none focus:border-emerald-500"
              >
                {ECUADOR_PROVINCES.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                Cantón / Ciudad *
              </label>
              <select
                value={selectedCanton}
                onChange={(e) => setSelectedCanton(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-white outline-none focus:border-emerald-500"
              >
                {activeProvince.cantons.map((canton) => (
                  <option key={canton} value={canton}>
                    {canton}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dirección Exacta */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Dirección de Entrega Exacta *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
              <textarea
                required
                rows={2}
                placeholder="Calle principal, número de casa/depto y calle secundaria..."
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-10 pr-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Referencia de Entrega */}
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 mb-1">
              Referencia del Inmueble (Opcional pero recomendado)
            </label>
            <div className="relative">
              <HelpCircle className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Ej. Frente a la Farmacia SanaSana, portón negro con rejas"
                value={deliveryReference}
                onChange={(e) => setDeliveryReference(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-10 pr-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3.5 font-bold text-black shadow-xl shadow-emerald-500/25 transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
          <span>
            {isSubmitting
              ? "Generando Guía en n8n..."
              : `Confirmar Pedido COD ($${totalToCollect.toFixed(2)} USD)`}
          </span>
        </button>
      </form>
    </div>
  );
}

export default function NuevoPedidoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Cargando formulario...</div>}>
      <NuevoPedidoForm />
    </Suspense>
  );
}
