import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { sendTelegramPayoutAlert } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sellerId,
      amount,
      bankName,
      accountType,
      accountNumber,
      accountHolderName,
      accountHolderCedula,
      sellerName,
    } = body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 20.0) {
      return NextResponse.json(
        { error: "El monto mínimo de retiro en Ecuador es de $20.00 USD." },
        { status: 400 }
      );
    }

    if (bankName !== "BANCO_PICHINCHA" && bankName !== "DEUNA") {
      return NextResponse.json(
        { error: "Método de pago inválido. Solo se admite Banco Pichincha o DeUna." },
        { status: 400 }
      );
    }

    const cleanAccountOrPhone = String(accountNumber || "").replace(/\D/g, "");

    if (cleanAccountOrPhone.length !== 10) {
      return NextResponse.json(
        {
          error:
            bankName === "DEUNA"
              ? "El número celular DeUna debe tener exactamente 10 dígitos (ej: 0983741834)."
              : "El número de cuenta de Banco Pichincha debe tener exactamente 10 dígitos.",
        },
        { status: 400 }
      );
    }

    if (bankName === "DEUNA" && !cleanAccountOrPhone.startsWith("09")) {
      return NextResponse.json(
        { error: "El número celular DeUna debe comenzar con 09." },
        { status: 400 }
      );
    }

    if (!accountHolderName || typeof accountHolderName !== "string" || accountHolderName.trim().length < 3) {
      return NextResponse.json(
        { error: "Ingresa el nombre completo del titular de la cuenta (mínimo 3 caracteres)." },
        { status: 400 }
      );
    }

    const cleanCedula = String(accountHolderCedula || "").replace(/\D/g, "");
    if (cleanCedula.length !== 10) {
      return NextResponse.json(
        { error: "La cédula de identidad debe tener exactamente 10 dígitos numéricos." },
        { status: 400 }
      );
    }

    const methodName = bankName === "DEUNA" ? "DeUna" : "Banco Pichincha";

    // 1. Guardar en Supabase si está disponible
    const supabaseAdmin = getSupabaseAdminClient();
    if (supabaseAdmin && sellerId) {
      const { error: dbError } = await supabaseAdmin.from("payouts").insert({
        seller_id: sellerId,
        amount: numAmount,
        status: "SOLICITADO",
        bank_details: {
          bankName,
          accountType: bankName === "DEUNA" ? "DEUNA" : accountType,
          accountNumber: cleanAccountOrPhone,
          accountHolderName: accountHolderName.trim(),
          accountHolderCedula: cleanCedula,
        },
      });

      if (dbError) {
        console.warn("[Payout API] Advertencia al registrar en Supabase:", dbError.message);
      }
    }

    // 2. Notificación en Telegram (formato exacto solicitado)
    // 💸 Solicitud de Retiro: $[monto] USD | Método: [Banco Pichincha / DeUna] | Destino: [número de cuenta o celular DeUna] | Titular: [Nombre] (CI: [Cédula])
    await sendTelegramPayoutAlert({
      amount: numAmount,
      method: methodName,
      destination: cleanAccountOrPhone,
      accountHolderName: accountHolderName.trim(),
      accountHolderCedula: cleanCedula,
      accountType: bankName === "BANCO_PICHINCHA" ? accountType : undefined,
      sellerName: sellerName || "Vendedor",
    });

    return NextResponse.json({
      success: true,
      message: "Solicitud de retiro registrada y notificada a Telegram.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al procesar solicitud de retiro";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
