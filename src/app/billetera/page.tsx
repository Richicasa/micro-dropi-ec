"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  CreditCard,
  Lock,
  Users,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { store } from "@/lib/store";
import { SellerProfile, PayoutRequest, BankEcuador, Order } from "@/lib/types";
import { showToast } from "@/components/Toast";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import WeeklyChallengeCard from "@/components/WeeklyChallengeCard";
import LossAversionBanner from "@/components/LossAversionBanner";
import StreakBadge from "@/components/StreakBadge";

export default function BilleteraPage() {
  const [seller, setSeller] = useState<SellerProfile>(store.getSeller());
  const [payouts, setPayouts] = useState<PayoutRequest[]>(store.getPayouts());
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const [isLoading, setIsLoading] = useState(true);

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
  const [isPayoutSuccess, setIsPayoutSuccess] = useState(false);
  const [lastSubmittedAmount, setLastSubmittedAmount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadDynamicUserData() {
      try {
        const supabase = getSupabaseBrowserClient();
        if (supabase && isSupabaseConfigured) {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // 1. Obtener fila del comisionista en profiles
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profile && isMounted) {
              const mappedSeller: SellerProfile = {
                id: profile.id,
                fullName: profile.full_name,
                phoneWhatsapp: profile.phone_whatsapp,
                cedula: profile.cedula || "",
                role: profile.role || "seller",
                bankName: profile.bank_name || "BANCO_PICHINCHA",
                accountType: profile.account_type || "AHORROS",
                accountNumber: profile.account_number || "",
                accountHolderName: profile.account_holder_name || profile.full_name,
                accountHolderCedula: profile.account_holder_cedula || profile.cedula || "",
                balancePending: Number(profile.balance_pending ?? 0),
                balanceAvailable: Number(profile.balance_available ?? 5.00),
                balanceWithdrawn: Number(profile.balance_withdrawn ?? 0),
                createdAt: profile.created_at,
                referralCode: profile.referral_code || "DROPI-EC",
                streakCount: profile.streak_count ?? 0,
                welcomeBonusAwarded: profile.welcome_bonus_awarded ?? true,
                sellerRank: profile.seller_rank || "NOVATO",
                totalReferralEarnings: Number(profile.total_referral_earnings ?? 0),
                referredCount: Number(profile.referred_count ?? 0),
              };
              setSeller(mappedSeller);
              setBankName(mappedSeller.bankName);
              setAccountNumber(mappedSeller.accountNumber);
              setHolderName(mappedSeller.accountHolderName);
              setHolderCedula(mappedSeller.accountHolderCedula);
            }

            // 2. Obtener órdenes reales del vendedor
            const { data: dbOrders } = await supabase
              .from("orders")
              .select("*, product:products(*)")
              .eq("seller_id", user.id)
              .order("created_at", { ascending: false });

            if (dbOrders && isMounted) {
              const mappedOrders: Order[] = dbOrders.map((o: any) => ({
                id: o.id,
                sellerId: o.seller_id,
                productId: o.product_id,
                product: o.product,
                quantity: o.quantity,
                trackingNumber: o.tracking_number,
                courierName: o.courier_name,
                status: o.status,
                clientName: o.client_name,
                clientCedula: o.client_cedula,
                clientPhone: o.client_phone,
                clientAddress: o.client_address,
                province: o.province,
                canton: o.canton,
                deliveryReference: o.delivery_reference,
                totalToCollect: Number(o.total_to_collect),
                supplierCost: Number(o.supplier_cost),
                deliveryCost: Number(o.delivery_cost),
                sellerCommission: Number(o.seller_commission),
                courierStatusDetail: o.courier_status_detail,
                internalNotes: o.internal_notes,
                createdAt: o.created_at,
                deliveredAt: o.delivered_at,
              }));
              setOrders(mappedOrders);
            }

            // 3. Obtener solicitudes de retiro
            const { data: dbPayouts } = await supabase
              .from("payouts")
              .select("*")
              .eq("seller_id", user.id)
              .order("created_at", { ascending: false });

            if (dbPayouts && isMounted) {
              const mappedPayouts: PayoutRequest[] = dbPayouts.map((p: any) => ({
                id: p.id,
                sellerId: p.seller_id,
                amount: Number(p.amount),
                status: p.status,
                bankDetails: p.bank_details,
                proofUrl: p.proof_url,
                rejectionReason: p.rejection_reason,
                createdAt: p.created_at,
                processedAt: p.processed_at,
              }));
              setPayouts(mappedPayouts);
            }

            if (isMounted) setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error cargando datos de Supabase:", err);
      }

      // Fallback limpio al store
      if (isMounted) {
        const s = store.getSeller();
        setSeller(s);
        setPayouts(store.getPayouts());
        setOrders(store.getOrders());
        setBankName(s.bankName);
        setAccountNumber(s.accountNumber);
        setHolderName(s.accountHolderName);
        setHolderCedula(s.accountHolderCedula);
        setIsLoading(false);
      }
    }

    loadDynamicUserData();

    const refresh = () => {
      loadDynamicUserData();
    };

    window.addEventListener("storage", refresh);
    window.addEventListener("microdropi_update", refresh);
    window.addEventListener("microdropi_auth_change", refresh);
    return () => {
      isMounted = false;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("microdropi_update", refresh);
      window.removeEventListener("microdropi_auth_change", refresh);
    };
  }, []);

  const MIN_WITHDRAWAL = 20.0;
  const canWithdraw = seller.balanceAvailable >= MIN_WITHDRAWAL;
  const missingAmount = Math.max(0, Number((MIN_WITHDRAWAL - seller.balanceAvailable).toFixed(2)));
  const progressPercent = Math.min(100, Math.round((seller.balanceAvailable / MIN_WITHDRAWAL) * 100));

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      showToast("Ingresa un monto válido a retirar", "error");
      return;
    }

    if (amount < 20.0) {
      showToast("El monto mínimo de retiro en Ecuador es $20.00 USD", "error");
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
      const supabase = getSupabaseBrowserClient();
      if (supabase && isSupabaseConfigured) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error: payoutError } = await supabase.from("payouts").insert({
            seller_id: user.id,
            amount: amount,
            status: "SOLICITADO",
            bank_details: {
              bankName,
              accountType,
              accountNumber,
              accountHolderName: holderName,
              accountHolderCedula: holderCedula
            }
          });

          if (payoutError) throw payoutError;
        }
      }

      // También registrar en store local para actualización reactiva inmediata
      store.requestPayout(amount);

      setLastSubmittedAmount(amount);
      setIsPayoutSuccess(true);
      showToast(
        "¡Solicitud registrada con éxito! Tu saldo entrará en el corte de transferencias del próximo lunes. Te notificaremos por WhatsApp con el comprobante bancario.",
        "success"
      );
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
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Mi Billetera & Comisiones</span>
            <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              USD Ecuador 🇪🇨
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gestiona tus ganancias acumuladas por ventas contra entrega y retiros.
          </p>
        </div>
        <StreakBadge
          streakCount={seller.streakCount || 0}
          sellerRank={seller.sellerRank || "NOVATO"}
        />
      </div>

      {/* Banner Psicológico de Aversión a la Pérdida */}
      <LossAversionBanner orders={orders} />

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

        {/* Candado de Retiro Mínimo $20 USD */}
        {!canWithdraw ? (
          <div className="mt-4 space-y-2 rounded-xl border border-amber-500/30 bg-neutral-900/90 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                Mínimo de Retiro: $20.00 USD
              </span>
              <span className="font-bold text-amber-400">
                ${seller.balanceAvailable.toFixed(2)} / $20.00
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-200/90">
                Te faltan <strong className="font-bold text-amber-300">${missingAmount.toFixed(2)} USD</strong> para retirar
              </span>
              <span className="text-neutral-500 font-medium">{progressPercent}%</span>
            </div>

            <button
              disabled
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-800/60 py-2.5 text-xs font-bold text-neutral-400 cursor-not-allowed"
            >
              <Lock className="h-4 w-4" />
              <span>Faltan ${missingAmount.toFixed(2)} USD para Retirar</span>
            </button>
            <p className="mt-2 text-center text-[11px] text-neutral-400">
              🗓️ Transferencias bancarias y DeUna procesadas los días lunes (Monto mín. $20.00 USD).
            </p>
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setIsPayoutSuccess(false);
                setIsModalOpen(true);
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:opacity-95 active:scale-[0.98]"
            >
              <ArrowDownLeft className="h-5 w-5" />
              <span>Solicitar Retiro para Corte Semanal</span>
            </button>
            <p className="mt-2 text-center text-[11px] text-neutral-400">
              🗓️ Transferencias bancarias y DeUna procesadas los días lunes (Monto mín. $20.00 USD).
            </p>
          </div>
        )}
      </div>

      {/* Widget Red de Referidos */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-neutral-900 to-neutral-950 p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Gana +$5.00 USD por cada amigo</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] text-indigo-300 font-bold">Bono Red</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Código: <strong className="text-emerald-400 font-mono">{seller.referralCode}</strong> &bull; {seller.referredCount || 0} amigos
            </p>
          </div>
        </div>
        <Link
          href="/equipo"
          className="flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-bold text-white transition active:scale-95"
        >
          <span>Invitar</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
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
            {isPayoutSuccess ? (
              // VISTA DE ÉXITO TRAS SOLICITAR RETIRO
              <div className="text-center py-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-3">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <h3 className="text-base font-bold text-white">
                  ¡Solicitud Registrada con Éxito!
                </h3>

                <p className="mt-2.5 text-xs text-neutral-300 leading-relaxed px-1">
                  ¡Solicitud registrada con éxito! Tu saldo entrará en el corte de transferencias del próximo lunes. Te notificaremos por WhatsApp con el comprobante bancario.
                </p>

                <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/70 p-3 text-xs text-neutral-300 space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Monto solicitado:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      ${lastSubmittedAmount.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Corte de pago:</span>
                    <span className="font-semibold text-white">Próximo Lunes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Notificación:</span>
                    <span className="text-emerald-400 font-medium">WhatsApp con comprobante</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsPayoutSuccess(false);
                  }}
                  className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:opacity-95 transition active:scale-[0.98]"
                >
                  Entendido
                </button>
              </div>
            ) : (
              // FORMULARIO DE SOLICITUD DE RETIRO
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  <span>Solicitar Retiro para Corte Semanal</span>
                </h3>
                <p className="mt-1 text-xs text-neutral-400">
                  Saldo disponible: <strong className="text-emerald-400">${seller.balanceAvailable.toFixed(2)} USD</strong> (Monto mín. $20.00 USD)
                </p>

                <div className="mt-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 p-2.5 text-[11px] text-neutral-400 flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>🗓️ Transferencias bancarias y DeUna procesadas los días lunes (Monto mín. $20.00 USD).</span>
                </div>

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
                        min="20.00"
                        max={seller.balanceAvailable}
                        required
                        placeholder="20.00"
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
