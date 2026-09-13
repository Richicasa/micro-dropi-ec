"use server";

import { z } from "zod";
import { store } from "@/lib/store";
import {
  ECUADOR_PROVINCES,
  validateEcuadorianCedula,
  validateEcuadorianPhone
} from "@/lib/ecuador";
import { sendTelegramDispatchAlert } from "@/lib/telegram";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// 1. ESQUEMA DE VALIDACIÓN ZOD PARA PEDIDOS COD EN ECUADOR
const CreateOrderSchema = z.object({
  productId: z.string().min(1, "El producto es obligatorio"),
  quantity: z.coerce.number().int().min(1, "La cantidad mínima es 1"),
  courier: z.string().default("laar"),
  courierName: z.string().default("Laar Courier"),
  clientName: z.string().min(3, "El nombre del cliente debe tener al menos 3 caracteres"),
  clientCedula: z
    .string()
    .trim()
    .refine((val) => validateEcuadorianCedula(val).isValid, {
      message: "Cédula de identidad ecuatoriana inválida (Módulo 10 no verificado)"
    }),
  clientPhone: z
    .string()
    .trim()
    .refine((val) => validateEcuadorianPhone(val).isValid, {
      message: "Número celular inválido para Ecuador (debe iniciar con 09 o +593)"
    }),
  province: z.string().min(2, "Selecciona una provincia de Ecuador"),
  canton: z.string().min(2, "Selecciona un cantón válido"),
  clientAddress: z.string().min(5, "Ingresa una dirección de entrega completa"),
  deliveryReference: z.string().optional()
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  trackingNumber?: string;
  error?: string;
  details?: Record<string, string[]>;
}

/**
 * SERVER ACTION: createOrderAction
 * Registra un pedido COD con validaciones oficiales de Ecuador,
 * actualiza el balance pendiente del vendedor y notifica inmediatamente a la bodega por Telegram.
 */
export async function createOrderAction(
  formDataOrObject: FormData | CreateOrderInput
): Promise<CreateOrderResult> {
  try {
    // 1. Parsear datos desde FormData u Objeto
    let rawData: Record<string, unknown> = {};

    if (formDataOrObject instanceof FormData) {
      formDataOrObject.forEach((value, key) => {
        rawData[key] = value;
      });
    } else {
      rawData = { ...formDataOrObject };
    }

    // 2. Validación con Zod y reglas de Ecuador
    const parsed = CreateOrderSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors)[0]?.[0] || "Datos del formulario inválidos";
      return {
        success: false,
        error: firstErrorMessage,
        details: fieldErrors as Record<string, string[]>
      };
    }

    const {
      productId,
      quantity,
      courier,
      courierName: rawCourierName,
      clientName,
      clientCedula,
      clientPhone,
      province,
      canton,
      clientAddress,
      deliveryReference
    } = parsed.data;

    const courierName = rawCourierName || (courier === "laar" ? "Laar Courier" : "Laar Courier");

    // 3. Normalizar formato E.164 del teléfono móvil de Ecuador (+5939xxxxxxxx)
    const phoneNorm = validateEcuadorianPhone(clientPhone);
    const normalizedPhone = phoneNorm.formatted;

    // 4. Validar provincia y cantón contra el registro geográfico oficial de Ecuador
    const matchedProvince = ECUADOR_PROVINCES.find(
      (p) =>
        p.name.toLowerCase() === province.toLowerCase() ||
        p.id.toLowerCase() === province.toLowerCase()
    );

    if (!matchedProvince) {
      return {
        success: false,
        error: `La provincia "${province}" no es una provincia válida de Ecuador.`
      };
    }

    const matchedCanton = matchedProvince.cantons.find(
      (c) => c.toLowerCase() === canton.toLowerCase()
    );

    if (!matchedCanton) {
      return {
        success: false,
        error: `El cantón "${canton}" no pertenece a la provincia de ${matchedProvince.name}.`
      };
    }

    // 5. Obtener producto y calcular desglose financiero COD (en USD)
    const product = store.getProductById(productId);
    if (!product) {
      return { success: false, error: "El producto seleccionado no existe o está inactivo." };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: `Stock insuficiente en bodega. Quedan ${product.stock} unidades disponibles.`
      };
    }

    const deliveryCost = 3.50; // Tarifa estándar de courier nacional en Ecuador
    const totalToCollect = Number((product.suggestedRetailPrice * quantity).toFixed(2));
    const totalSupplierCost = Number((product.supplierCost * quantity).toFixed(2));
    const sellerCommission = Number(
      (totalToCollect - totalSupplierCost - deliveryCost).toFixed(2)
    );

    const seller = store.getSeller();

    // 6. Persistencia en Base de Datos (Supabase si está configurado, con respaldo en store)
    let finalOrderId = "";
    let finalTracking = "";

    if (isSupabaseConfigured && supabase) {
      const generatedTracking = `LAAR-EC-${Math.floor(100000 + Math.random() * 900000)}`;

      const { data: dbOrder, error: dbError } = await supabase
        .from("orders")
        .insert({
          seller_id: seller.id,
          product_id: product.id,
          quantity,
          courier_name: courierName,
          tracking_number: generatedTracking,
          client_name: clientName,
          client_cedula: clientCedula,
          client_phone: normalizedPhone,
          client_address: clientAddress,
          province: matchedProvince.name,
          canton: matchedCanton,
          delivery_reference: deliveryReference || null,
          total_to_collect: totalToCollect,
          supplier_cost: totalSupplierCost,
          delivery_cost: deliveryCost,
          seller_commission: sellerCommission,
          status: "PENDIENTE"
        })
        .select("id, tracking_number")
        .single();

      if (dbError) {
        console.error("Error insertando orden en Supabase:", dbError);
        // Fallback a store local si falla la conexión remota
        const localOrder = store.createOrder({
          productId: product.id,
          quantity,
          courierName,
          clientName,
          clientCedula,
          clientPhone: normalizedPhone,
          clientAddress,
          province: matchedProvince.name,
          canton: matchedCanton,
          deliveryReference: deliveryReference || undefined,
          totalToCollect,
          supplierCost: totalSupplierCost,
          deliveryCost,
          sellerCommission
        });
        finalOrderId = localOrder.id;
        finalTracking = localOrder.trackingNumber;
      } else {
        finalOrderId = dbOrder.id;
        finalTracking = dbOrder.tracking_number;
      }
    } else {
      // Almacenamiento directo en el motor COD local
      const localOrder = store.createOrder({
        productId: product.id,
        quantity,
        courierName,
        clientName,
        clientCedula,
        clientPhone: normalizedPhone,
        clientAddress,
        province: matchedProvince.name,
        canton: matchedCanton,
        deliveryReference: deliveryReference || undefined,
        totalToCollect,
        supplierCost: totalSupplierCost,
        deliveryCost,
        sellerCommission
      });
      finalOrderId = localOrder.id;
      finalTracking = localOrder.trackingNumber;
    }

    // 7. Disparo Inmediato de Notificación a Telegram (Despacho de Bodega)
    await sendTelegramDispatchAlert({
      orderId: finalOrderId,
      trackingNumber: finalTracking,
      sellerId: seller.id,
      sellerName: seller.fullName,
      productTitle: product.title,
      quantity,
      clientName,
      clientCedula,
      clientPhone: normalizedPhone,
      clientAddress,
      province: matchedProvince.name,
      canton: matchedCanton,
      deliveryReference: deliveryReference || undefined,
      totalToCollect,
      sellerCommission,
      courierName
    });

    return {
      success: true,
      orderId: finalOrderId,
      trackingNumber: finalTracking
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error inesperado procesando el pedido";
    return { success: false, error: errorMsg };
  }
}
