"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Clock,
  TrendingUp,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  ExternalLink,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { store } from "@/lib/store";
import { SellerProfile, PayoutRequest, BankEcuador } from "@/lib/types";
import { showToast } from "@/components/Toast";
import WeeklyChallengeCard from "@/components/WeeklyChallengeCard";

export default function BilleteraPage() {
  const [seller, setSeller] = useState<SellerProfile>(store.getSeller());
  const [payouts, setPayouts] = useState<PayoutRequest[]>(store.getPayouts());
  const [orders, setOrders] = useState(store.getOrders());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankName, setBankName] = useState<BankEcuador>(seller.bankName || "BANCO_PICHINCHA");
  const [accountType, setAccountType] = useState<"AHORROS" | "CORRIENTE" | "DEUNA">(
    seller.accountType || "AHORROS"
  );
  const [accountNumber, setAccountNumber] = useState(seller.accountNumber || "");
  const [holderName, setHolderName] = useState(seller.accountHolderName || "");
  const [holderCedula, setHolderCedula] = useState(seller.accountHolderCedula || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const s = store.getSeller();
      setSeller(s);
      setPayouts(store.getPayouts());
      setOrders(store.getOrders());
      setBankName(s.bankName);
      setAccountNumber(s.accountNumber);
      setHolderName(s.accountHolderName);
      setHolderCedula(s.accountHolderCedula);
    };

    window.addEventListener("storage", refresh);
    window.addEventListener("microdropi_update", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("microdropi_update", refresh);
    };
  }, []);

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      showToast("Ingresa un monto válido a retirar", "error");
      return;
    }

    if (amount < 5.0) {
      showToast("El monto mínimo de retiro en Ecuador es $5.00 USD", "error");
      return;
    }

    if (amount > seller.balanceAvailable) {
      showToast(`Saldo insuficiente. Tu saldo disponible es $${seller.balanceAvailable.toFixed(2)} USD`, "error");
      return;
    }

    if (!accountNumber.trim()) {
      showToast("Ingresa tu número de cuenta o teléfono DeUna!", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      store.requestPayout(amount);
      showToast(`¡Solicitud de retiro por $${amount.toFixed(2)} USD enviada a tesorería!`, "success");
      setIsModalOpen(false);
      setWithdrawAmount("");
      
      // Notificar cambio
      window.dispatchEvent(new Event("microdropi_update"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar el retiro";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 sm:max-w-xl md:max-w-2xl">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Mi Billetera & Comisiones</span>
          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            USD Ecuador 🇪🇨
          </span>
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Gestiona tus ganancias acumuladas por ventas contra entrega y solicita transferencias directas a tu banco.
        </p>
      </div>

      {/* Tarjetas de Balance */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-neutral-900/90 to-neutral-950 p-5 shadow-xl shadow-emerald-950/20">
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span>DISPONIBLE PARA RETIRO</span>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            Liquidado
          </span>
        </div>

        <div className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-white">
          ${seller.balanceAvailable.toFixed(2)}{" "}
          <span className="text-xs font-medium text-neutral-400">USD</span>
        </div>

        <p className="mt-1 text-xs text-neutral-400">
          Comisiones confirmadas tras la entrega del courier a tus clientes.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={seller.balanceAvailable < 5.0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:opacity-95 active:scale-[0.98] disabled:opacity-40"
        >
          <ArrowDownLeft className="h-5 w-5" />
          <span>Solicitar Retiro</span>
        </button>
      </div>

      {/* Sub-Balances: Pendiente y Retirado */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pendiente de Entrega */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
            <Clock className="h-4 w-4" />
            <span>Pendiente de Entrega</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-white">
            ${seller.balancePending.toFixed(2)}
          </div>
          <p className="mt-1 text-[10px] text-neutral-400 leading-tight">
            Comisiones en tránsito COD. Se liberan al marcarse &quot;ENTREGADO&quot;.
          </p>
        </div>

        {/* Retirado Histórico */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-400">
            <TrendingUp className="h-4 w-4" />
            <span>Total Retirado</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-white">
            ${seller.balanceWithdrawn.toFixed(2)}
          </div>
          <p className="mt-1 text-[10px] text-neutral-400 leading-tight">
            Monto acumulado pagado a tu cuenta bancaria.
          </p>
        </div>
      </div>

      {/* Desafío Semanal y Gamificación */}
      <WeeklyChallengeCard orders={orders} />

      {/* Explicación Reglas COD Ecuador */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3.5 text-xs text-neutral-400 space-y-1.5">
        <div className="flex items-center gap-2 text-white font-semibold">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Reglas del Modelo Contra Entrega (COD)</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          1. Al registrar tu pedido, tu comisión entra en <strong className="text-amber-300">Pendiente de Entrega</strong>.<br />
          2. Servientrega o Laar Courier recolecta el paquete y cobra el valor en efectivo al cliente.<br />
          3. Al confirmarse la entrega, la comisión se transfiere inmediatamente a tu <strong className="text-emerald-300">Disponible para Retiro</strong>.<br />
          4. Retiros procesados en menos de 24 horas por Banco Pichincha, Guayaquil o DeUna!.
        </p>
      </div>

      {/* Historial de Pedidos y Chips de Estado COD */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Historial de Pedidos y Comisiones</h2>
          <span className="text-[11px] text-neutral-400">{orders.length} pedidos</span>
        </div>

        <div className="space-y-2">
          {orders.slice(0, 5).map((order) => {
            const isDelivered = order.status === "ENTREGADO";
            const isInTransit = order.status === "EN_TRANSITO" || order.status === "GUIA_GENERADA";
            const isReturned = order.status === "DEVUELTO";

            const chipLabel = isInTransit
              ? "EN_CAMINO"
              : isDelivered
              ? "ENTREGADO"
              : isReturned
              ? "DEVUELTO"
              : "PENDIENTE";

            return (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/70 p-3"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{order.clientName}</div>
                  <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-neutral-500">{order.trackingNumber}</span>
                    <span>&bull;</span>
                    <span>{order.canton}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">
                    +${order.sellerCommission.toFixed(2)} USD
                  </div>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      isDelivered
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : isInTransit
                        ? "bg-blue-950 text-blue-300 border border-blue-500/40"
                        : isReturned
                        ? "bg-rose-950 text-rose-300 border border-rose-500/40"
                        : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                    }`}
                  >
                    {chipLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial de Retiros */}
      <div className="space-y-2.5 pt-2">
        <h2 className="text-sm font-bold text-white">Historial de Solicitudes de Retiro</h2>

        <div className="space-y-2">
          {payouts.map((payout) => {
            const isPaid = payout.status === "PAGADO";
            const isRequested = payout.status === "SOLICITADO";

            return (
              <div
                key={payout.id}
                className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/70 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-300">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      ${payout.amount.toFixed(2)} USD
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {payout.bankDetails.bankName.replace("_", " ")} &bull; {payout.bankDetails.accountNumber}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      isPaid
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : isRequested
                        ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {payout.status}
                  </span>

                  {payout.proofUrl && (
                    <a
                      href={payout.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center justify-end gap-1 text-[10px] text-emerald-400 hover:underline"
                    >
                      <span>Comprobante</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {payouts.length === 0 && (
            <div className="rounded-xl border border-dashed border-neutral-800 p-6 text-center text-xs text-neutral-500">
              Aún no has solicitado retiros de comisión.
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE SOLICITUD DE RETIRO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              <span>Solicitar Retiro de Comisiones</span>
            </h3>
            <p className="mt-1 text-xs text-neutral-400">
              Saldo disponible: <strong className="text-emerald-400">${seller.balanceAvailable.toFixed(2)} USD</strong> (Mínimo de retiro: $5.00)
            </p>

            <form onSubmit={handleWithdrawSubmit} className="mt-4 space-y-3 text-xs">
              {/* Monto */}
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Monto a Retirar (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="5.00"
                    max={seller.balanceAvailable}
                    required
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 pl-8 pr-3 text-sm font-bold text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Banco de Ecuador */}
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Banco o Billetera en Ecuador *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value as BankEcuador)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="BANCO_PICHINCHA">Banco Pichincha</option>
                  <option value="DEUNA_PICHINCHA">DeUna! Pichincha (Inmediato)</option>
                  <option value="BANCO_GUAYAQUIL">Banco Guayaquil</option>
                  <option value="PRODUBANCO">Produbanco</option>
                  <option value="BANCO_PACIFICO">Banco del Pacífico</option>
                  <option value="BANCO_BOLIVARIANO">Banco Bolivariano</option>
                  <option value="COOPERATIVA_JEP">Cooperativa JEP</option>
                  <option value="OTRO">Otro Banco / Cooperativa</option>
                </select>
              </div>

              {/* Tipo de Cuenta */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Tipo de Cuenta
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as "AHORROS" | "CORRIENTE" | "DEUNA")}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="AHORROS">Ahorros</option>
                    <option value="CORRIENTE">Corriente</option>
                    <option value="DEUNA">Billetera Móvil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Número de Cuenta / Celular *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2201948572"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Titular y Cédula */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Nombre del Titular *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Carlos Mendoza"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    Cédula del Titular *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="1723456789"
                    value={holderCedula}
                    onChange={(e) => setHolderCedula(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Botonera */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 rounded-xl border border-neutral-800 bg-neutral-900 py-2.5 font-semibold text-neutral-300 hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-2.5 font-bold text-black shadow-lg shadow-emerald-500/20 hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Procesando..." : "Confirmar Retiro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
