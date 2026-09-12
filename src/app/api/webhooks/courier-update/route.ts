import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { OrderStatus } from "@/lib/types";

/**
 * CONTRATO DE API: WEBHOOK DE ENTRADA (n8n -> Micro-Dropi Ecuador)
 * 
 * Endpoint: POST /api/webhooks/courier-update
 * Headers requeridos:
 *   - x-webhook-secret: <WEBHOOK_SECRET>
 * 
 * Body JSON:
 * {
 *   "tracking_number": "LAAR-EC-982143",
 *   "status": "ENTREGADO" | "NOVEDAD" | "DEVUELTO" | "EN_TRANSITO",
 *   "courier_detail": "Entregado y cobrado en efectivo al cliente",
 *   "notes": "Ruta Guayaquil"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Validar autenticación con Secreto de Webhook
    const incomingSecret = req.headers.get("x-webhook-secret");
    const configuredSecret = process.env.WEBHOOK_SECRET || "dropi_ecuador_secret_2026";

    if (incomingSecret !== configuredSecret) {
      return NextResponse.json(
        { error: "No autorizado: x-webhook-secret inválido o ausente" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { tracking_number, order_id, status, courier_detail, notes } = body;

    const identifier = tracking_number || order_id;
    if (!identifier || !status) {
      return NextResponse.json(
        { error: "Payload inválido: tracking_number (u order_id) y status son obligatorios" },
        { status: 400 }
      );
    }

    const validStatuses: OrderStatus[] = [
      "PENDIENTE",
      "GUIA_GENERADA",
      "EN_TRANSITO",
      "NOVEDAD",
      "ENTREGADO",
      "DEVUELTO",
      "CANCELADO"
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Estado inválido "${status}". Estados permitidos: ${validStatuses.join(", ")}`
        },
        { status: 400 }
      );
    }

    // 2. Ejecutar Liquidación y Actualización de Estado (Motor COD)
    const updatedOrder = store.updateOrderStatus(identifier, status, courier_detail);
    const seller = store.getSeller();

    return NextResponse.json({
      success: true,
      message: `Guía ${updatedOrder.trackingNumber} actualizada a estado ${status}`,
      liquidation_summary: {
        status: updatedOrder.status,
        seller_commission: updatedOrder.sellerCommission,
        commission_released_to_available: status === "ENTREGADO",
        new_balance_available: seller.balanceAvailable,
        new_balance_pending: seller.balancePending
      },
      order: updatedOrder
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error procesando webhook de courier";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
