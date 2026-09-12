// ==============================================================================
// DEFINICIONES DE TIPOS - MICRO-DROPI ECUADOR
// ==============================================================================

export type OrderStatus =
  | "PENDIENTE"
  | "GUIA_GENERADA"
  | "EN_TRANSITO"
  | "NOVEDAD"
  | "ENTREGADO"
  | "DEVUELTO"
  | "CANCELADO";

export type PayoutStatus = "SOLICITADO" | "EN_PROCESO" | "PAGADO" | "RECHAZADO";

export type BankEcuador =
  | "BANCO_PICHINCHA"
  | "BANCO_GUAYAQUIL"
  | "PRODUBANCO"
  | "BANCO_PACIFICO"
  | "BANCO_BOLIVARIANO"
  | "BANCO_INTERNACIONAL"
  | "COOPERATIVA_JEP"
  | "DEUNA_PICHINCHA"
  | "OTRO";

export type SellerRank = "NOVATO" | "VERIFICADO" | "ELITE";

export interface SellerProfile {
  id: string;
  fullName: string;
  phoneWhatsapp: string;
  cedula?: string;
  role: "seller" | "warehouse" | "admin";
  bankName: BankEcuador;
  accountType: "AHORROS" | "CORRIENTE" | "DEUNA";
  accountNumber: string;
  accountHolderName: string;
  accountHolderCedula: string;
  balancePending: number;
  balanceAvailable: number;
  balanceWithdrawn: number;
  createdAt: string;

  // Gamificación, Rango y Referidos
  referralCode: string;
  referredBy?: string;
  streakCount: number;
  lastOrderDate?: string;
  welcomeBonusAwarded: boolean;
  sellerRank: SellerRank;
  totalReferralEarnings: number;
  referredCount: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  sku: string;
  category: string;
  supplierCost: number; // Costo que se liquida a bodega
  suggestedRetailPrice: number; // PVP sugerido al cliente
  fixedCommission: number; // Margen garantizado
  stock: number;
  images: string[];
  marketingCopy: string; // Copy persuasivo con emojis listo para copiar
  promoMaterialUrl: string; // Enlace Drive / Telegram
  isActive: boolean;
}

export interface Order {
  id: string;
  sellerId: string;
  productId: string;
  product?: Product;
  quantity: number;
  trackingNumber: string;
  courierName: string;
  status: OrderStatus;
  
  // Cliente final
  clientName: string;
  clientCedula: string;
  clientPhone: string;
  clientAddress: string;
  province: string;
  canton: string;
  deliveryReference?: string;
  
  // Desglose financiero COD (USD)
  totalToCollect: number; // Cobro en efectivo
  supplierCost: number;
  deliveryCost: number; // Costo de envío ($3.50 base)
  sellerCommission: number; // Ganancia comisionista
  
  // Seguimiento courier
  courierStatusDetail?: string;
  internalNotes?: string;
  createdAt: string;
  guiaGeneratedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  returnedAt?: string;
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  amount: number;
  status: PayoutStatus;
  bankDetails: {
    bankName: string;
    accountType: string;
    accountNumber: string;
    accountHolderName: string;
    accountHolderCedula: string;
  };
  proofUrl?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
}

export interface ReferralFriend {
  id: string;
  name: string;
  joinedDate: string;
  firstOrderDelivered: boolean;
  bonusEarned: number;
}
