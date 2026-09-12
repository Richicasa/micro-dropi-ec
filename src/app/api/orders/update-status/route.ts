import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { OrderStatus } from "@/lib/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendTelegramDeliveredAlert } from "@/lib/telegram";

/**
 * ROUTE HANDLER: /api/orders/update-status
 * 
 * Endpoint seguro para actualizar el estado de los pedidos COD.
 * Protegido mediante la cabecera x-webhook-secret.
 * 
 * Payload:
 * {
 *   "orderId": "ord-ec-101" | UUID,
 *   "newStatus": "ENTREGADO" | "NOVEDAD" | "DEVUELTO",
 *   "notes": "Cliente recibió y pagó en efectivo"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Validar autenticación con INTERNAL_WEBHOOK_SECRET
    const incomingSecret = req.headers.get("x-webhook-secret");
    const configuredSecret =
      process.env.INTERNAL_WEBHOOK_SECRET || "dropi_ecuador_secret_2026";

    if (incomingSecret !== configuredSecret) {
      return NextResponse.json(
        { error: "No autorizado: x-webhook-secret inválido o ausente." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, newStatus, notes } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json(
        { error: "Payload incompleto: orderId y newStatus son obligatorios." },
        { status: 400 }
      );
    }

    const allowedStatuses: OrderStatus[] = ["ENTREGADO", "NOVEDAD", "DEVUELTO", "EN_TRANSITO"];
    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Estado inválido "${newStatus}". Permitidos: ${allowedStatuses.join(", ")}`
        },
        { status: 400 }
      );
    }

    let updatedOrder = null;

    // 2. Operación con Supabase RPC si está configurado
    if (isSupabaseConfigured && supabase) {
      if (newStatus === "ENTREGADO") {
        // Invocar la función RPC atómica
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          "credit_seller_commission",
          { p_order_id: orderId }
        );

        if (rpcError) {
          console.error("Error ejecutando RPC credit_seller_commission:", rpcError);
          // Fallback a actualización directa en store
          updatedOrder = store.updateOrderStatus(orderId, newStatus, notes);
        } else {
          // Obtener orden actualizada
          const { data: ord } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();
          updatedOrder = ord;
        }
      } else if (newStatus === "DEVUELTO") {
        // Revertir comisión en balance_pending y devolver stock
        const { data: ord } = await supabase
          .from("orders")
          .update({
            status: "DEVUELTO",
            returned_at: new Date().toISOString(),
            courier_status_detail: notes || "Devolución registrada"
          })
          .eq("id", orderId)
          .select()
          .single();

        updatedOrder = ord || store.updateOrderStatus(orderId, newStatus, notes);
      } else {
        // NOVEDAD / EN_TRANSITO
        const { data: ord } = await supabase
          .from("orders")
          .update({
            status: newStatus,
            courier_status_detail: notes || undefined
          })
          .eq("id", orderId)
          .select()
          .single();

        updatedOrder = ord || store.updateOrderStatus(orderId, newStatus, notes);
      }
    } else {
      // 3. Ejecución directa en el motor COD local (paridad completa)
      updatedOrder = store.updateOrderStatus(orderId, newStatus, notes);
    }

    // 4. Si el pedido pasa a ENTREGADO, enviar alerta a Telegram de Venta Liquidada
    if (newStatus === "ENTREGADO" && updatedOrder) {
      const ordId = updatedOrder.id || orderId;
      const tracking = updatedOrder.trackingNumber || updatedOrder.tracking_number || "S/T";
      const totalCollected = updatedOrder.totalToCollect || updatedOrder.total_to_collect || 0;
      const commission = updatedOrder.sellerCommission || updatedOrder.seller_commission || 0;
      const clientName = updatedOrder.clientName || updatedOrder.client_name || "Cliente";

      await sendTelegramDeliveredAlert(
        ordId,
        tracking,
        totalCollected,
        commission,
        clientName
      );
    }

    const seller = store.getSeller();

    return NextResponse.json({
      success: true,
      message: `Pedido ${orderId} actualizado exitosamente a ${newStatus}`,
      newStatus,
      liquidation: {
        orderId,
        newStatus,
        balanceAvailable: seller.balanceAvailable,
        balancePending: seller.balancePending
      },
      order: updatedOrder
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error actualizando estado del pedido";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
