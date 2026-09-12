import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";

function normalizeEcuadorPhone(rawPhone: string): string {
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("593")) {
    digits = "0" + digits.slice(3);
  }
  if (digits.length === 9 && digits.startsWith("9")) {
    digits = "0" + digits;
  }
  return digits;
}

function generateSellerPassword(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EC-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, city } = body;

    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 3) {
      return NextResponse.json(
        { error: "Por favor ingresa tu nombre y apellido completo (mínimo 3 caracteres)." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Por favor ingresa tu número de WhatsApp de Ecuador." },
        { status: 400 }
      );
    }

    const cleanPhone = normalizeEcuadorPhone(phone);
    if (cleanPhone.length !== 10 || !cleanPhone.startsWith("09")) {
      return NextResponse.json(
        { error: "El número de WhatsApp debe tener 10 dígitos y empezar con 09 (ejemplo: 0983741834)." },
        { status: 400 }
      );
    }

    const validCity = (typeof city === "string" && city.trim().length > 0)
      ? city.trim()
      : "Ecuador";

    // Formato normalizado de correo para Supabase Auth
    const email = `${cleanPhone}@microdropi.ec`;
    const password = generateSellerPassword();
    const referralCode = `DROPI-${cleanPhone.slice(-4).toUpperCase()}`;

    const supabaseAdmin = getSupabaseAdminClient();

    if (supabaseAdmin) {
      // 1. Crear usuario en Supabase Auth con privilegios de administrador
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
          phone_whatsapp: cleanPhone,
          city: validCity,
        },
      });

      if (authError) {
        if (
          authError.message.toLowerCase().includes("already") ||
          authError.message.toLowerCase().includes("registered") ||
          authError.status === 422
        ) {
          return NextResponse.json(
            {
              error: `El número de WhatsApp ${cleanPhone} ya se encuentra registrado. Inicia sesión directamente con tu contraseña.`,
            },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: `Error creando usuario en Supabase: ${authError.message}` },
          { status: 400 }
        );
      }

      const userId = authData.user?.id;
      if (userId) {
        // 2. Asegurar que el perfil quede aprovisionado en public.profiles
        const profilePayload: Record<string, any> = {
          id: userId,
          full_name: fullName.trim(),
          phone_whatsapp: cleanPhone,
          role: "seller",
          balance_available: 5.00,
          balance_pending: 0.00,
          balance_withdrawn: 0.00,
          welcome_bonus_awarded: true,
          streak_count: 0,
          seller_rank: "NOVATO",
          referral_code: referralCode,
        };

        const { error: profileError } = await supabaseAdmin
          .from("profiles")
          .upsert(profilePayload, { onConflict: "id" });

        if (profileError) {
          console.warn("[RegisterSeller] Warning al guardar perfil:", profileError.message);
        }
      }
    }

    // Retorno exitoso
    return NextResponse.json(
      {
        success: true,
        phone: cleanPhone,
        password,
        fullName: fullName.trim(),
        city: validCity,
        referralCode,
        balanceAvailable: 5.00,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al registrar vendedor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
