import { NextRequest, NextResponse } from "next/server";

/**
 * ENDPOINT: /api/webhooks/order-created
 * 
 * Se invoca cuando un comisionista registra un pedido COD en la PWA.
 * Transmite el evento hacia n8n para que genere la guía física en la API
 * de Laar Courier, Servientrega o Speed.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { order_id, tracking_number, courier, client, cod_amount_to_collect, seller_id } = body;

    if (!order_id || !client) {
      return NextResponse.json(
        { error: "Payload incompleto: order_id y client son requeridos" },
        { status: 400 }
      );
    }

    const n8nWebhookUrl = process.env.N8N_ORDER_WEBHOOK_URL;
    let n8nResponse = null;

    if (n8nWebhookUrl && !n8nWebhookUrl.includes("tu-instancia-n8n")) {
      try {
        const res = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-webhook-secret": process.env.WEBHOOK_SECRET || "dropi_ecuador_secret_2026",
            "User-Agent": "MicroDropi-Ecuador-Core/1.0"
          },
          body: JSON.stringify({
            event: "ORDER_CREATED_COD",
            country: "EC",
            order_id,
            tracking_number,
            courier,
            client,
            cod_amount_to_collect,
            seller_id,
            timestamp: new Date().toISOString()
          })
        });
        n8nResponse = { status: res.status, ok: res.ok };
      } catch (err) {
        console.error("Error contactando endpoint remoto de n8n:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Evento emitido para n8n con éxito. Guía logística en cola de generación.",
      order_id,
      tracking_number,
      n8n_dispatched: Boolean(n8nWebhookUrl),
      n8nResponse
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
