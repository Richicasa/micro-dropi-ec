// ==============================================================================
// SERVICIO DE NOTIFICACIONES TELEGRAM BOT - MICRO-DROPI ECUADOR
// ==============================================================================

export interface TelegramDispatchData {
  orderId: string;
  trackingNumber: string;
  sellerId: string;
  sellerName?: string;
  productTitle: string;
  quantity: number;
  clientName: string;
  clientCedula: string;
  clientPhone: string;
  clientAddress: string;
  province: string;
  canton: string;
  deliveryReference?: string;
  totalToCollect: number;
  sellerCommission: number;
  courierName: string;
}

/**
 * Envía una alerta estructurada de despacho a la bodega física y administradores en Telegram.
 */
export async function sendTelegramDispatchAlert(
  data: TelegramDispatchData
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID_DISPATCH;

  if (!botToken || !chatId) {
    console.info(
      "[TELEGRAM BOT] Tokens no configurados en .env.local (TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID_DISPATCH). Se omite el envío a Telegram."
    );
    return { success: false, error: "Telegram bot no configurado" };
  }

  // Enlace directo de WhatsApp sin caracteres especiales (+5939...)
  const cleanPhone = data.clientPhone.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanPhone}`;

  // Formato HTML enriquecido para Telegram
  const htmlMessage = `
📦 <b>¡NUEVO PEDIDO COD PARA DESPACHO!</b> 🇪🇨
━━━━━━━━━━━━━━━━━━
🆔 <b>Pedido:</b> <code>#${data.orderId.slice(-8)}</code>
🏷️ <b>Guía / Tracking:</b> <code>${data.trackingNumber}</code>
🚚 <b>Courier:</b> ${data.courierName}
👤 <b>Vendedor:</b> ${data.sellerName || data.sellerId}

🛍️ <b>PRODUCTO A PREPARAR:</b>
• <b>${data.productTitle}</b>
• <b>Cantidad:</b> ${data.quantity} unidad(es)

📍 <b>DATOS DE ENTREGA DEL CLIENTE:</b>
• <b>Nombre:</b> ${data.clientName}
• <b>Cédula:</b> <code>${data.clientCedula}</code>
• <b>Teléfono:</b> <a href="${waUrl}">${data.clientPhone} (WhatsApp)</a>
• <b>Provincia:</b> ${data.province}
• <b>Cantón:</b> ${data.canton}
• <b>Dirección:</b> ${data.clientAddress}
${data.deliveryReference ? `• <b>Referencia:</b> <i>${data.deliveryReference}</i>\n` : ""}
💵 <b>VALOR A COBRAR EN EFECTIVO (COD):</b>
• <b>Total en Destino:</b> <b>$${data.totalToCollect.toFixed(2)} USD</b>
• <b>Comisión del Vendedor:</b> <b>+$${data.sellerCommission.toFixed(2)} USD</b>
━━━━━━━━━━━━━━━━━━
⚠️ <i>Bodega: Imprimir etiqueta y alistar paquete para recolección de ${data.courierName}.</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlMessage,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    const result = await response.json();
    if (!result.ok) {
      console.error("[TELEGRAM BOT ERROR]:", result.description);
      return { success: false, error: result.description };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error enviando alerta Telegram";
    console.error("[TELEGRAM BOT EXCEPTION]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Notifica a Telegram cuando el courier cobró en efectivo y se acreditó la comisión al comisionista.
 */
export async function sendTelegramDeliveredAlert(
  orderId: string,
  trackingNumber: string,
  amount: number,
  sellerCommission: number,
  clientName: string
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID_DISPATCH;

  if (!botToken || !chatId) return { success: false };

  const message = `
💰 <b>¡VENTA LIQUIDADA CON ÉXITO (COD)!</b> 🎉
━━━━━━━━━━━━━━━━━━
🆔 <b>Pedido:</b> <code>#${orderId.slice(-8)}</code>
🏷️ <b>Guía:</b> <code>${trackingNumber}</code>
👤 <b>Cliente:</b> ${clientName}
💵 <b>Monto Cobrado por Courier:</b> $${amount.toFixed(2)} USD
✅ <b>Comisión Liberada al Vendedor:</b> +$${sellerCommission.toFixed(2)} USD

<i>El saldo fue acreditado automáticamente en el balance disponible del vendedor.</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      })
    });
    return { success: true };
  } catch (err) {
    console.error("[TELEGRAM DELIVERED ALERT ERROR]:", err);
    return { success: false };
  }
}

export interface TelegramPayoutAlertData {
  amount: number;
  method: "Banco Pichincha" | "DeUna" | string;
  destination: string; // Número de cuenta o celular DeUna
  accountHolderName: string;
  accountHolderCedula: string;
  accountType?: string;
  sellerName?: string;
}

/**
 * Notifica a Telegram cuando un vendedor ingresa una solicitud de retiro de comisiones.
 */
export async function sendTelegramPayoutAlert(
  data: TelegramPayoutAlertData
): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID_DISPATCH;

  if (!botToken || !chatId) {
    console.info("[TELEGRAM BOT] Bot no configurado para alerta de retiro.");
    return { success: false, error: "Bot no configurado" };
  }

  // Formato requerido:
  // 💸 Solicitud de Retiro: $[monto] USD | Método: [Banco Pichincha / DeUna] | Destino: [número de cuenta o celular DeUna] | Titular: [Nombre] (CI: [Cédula])
  const summaryLine = `💸 Solicitud de Retiro: $${data.amount.toFixed(2)} USD | Método: ${data.method} | Destino: ${data.destination} | Titular: ${data.accountHolderName} (CI: ${data.accountHolderCedula})`;

  const message = `
<b>${summaryLine}</b>
━━━━━━━━━━━━━━━━━━
💰 <b>Monto Solicitado:</b> $${data.amount.toFixed(2)} USD
🏦 <b>Método:</b> ${data.method} ${data.accountType ? `(${data.accountType})` : ""}
📱/💳 <b>Destino:</b> <code>${data.destination}</code>
👤 <b>Titular:</b> ${data.accountHolderName}
🆔 <b>Cédula:</b> <code>${data.accountHolderCedula}</code>
${data.sellerName ? `🏷️ <b>Vendedor:</b> ${data.sellerName}\n` : ""}
🗓️ <i>Entrará en el corte de transferencias del próximo lunes.</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();
    return { success: Boolean(result.ok) };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error enviando alerta de retiro a Telegram";
    console.error("[TELEGRAM PAYOUT ALERT ERROR]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

