// ==============================================================================
// GESTOR DE ESTADO REACTIVO Y SERVICIOS - MICRO-DROPI ECUADOR
// ==============================================================================
import { Product, Order, OrderStatus, SellerProfile, PayoutRequest } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Mini Licuadora Portátil USB Recargable Fresh Juice",
    description: "Licuadora inalámbrica de 350ml con 4 cuchillas de acero inoxidable 304. Batería de 1400mAh, recarga magnética rápida.",
    sku: "PROD-BLENDER-01",
    category: "Hogar y Cocina",
    supplierCost: 7.50,
    suggestedRetailPrice: 24.99,
    fixedCommission: 13.99, // 24.99 - 7.50 - 3.50 flete = 13.99
    stock: 140,
    images: [
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop"
    ],
    marketingCopy: `🍓 ¡Prepara tus batidos favoritos DONDE SEA en solo 30 segundos! 🚀

Olvídate de las licuadoras pesadas y cables molestos. Con la Mini Licuadora Fresh Juice:
✅ Inalámbrica y recargable por USB (¡te dura hasta 15 batidos!)
✅ Cuchillas de acero que trituran hielo y fruta congelada
✅ Diseño estético y ultra ligero para llevar en el bolso

🚚 ¡PAGO CONTRA ENTREGA A TODO EL ECUADOR! No pagas nada hasta que llegue a tu puerta con Servientrega o Laar Courier.
👉 ¡Pídela ahora con envío express haciendo clic en el enlace!`,
    promoMaterialUrl: "https://drive.google.com/drive/folders/ejemplo-fresh-juice-ecuador",
    isActive: true
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Cepillo Secador y Voluminizador One-Step 3 en 1",
    description: "Seca, alisa y da volumen en un solo paso con tecnología de iones y revestimiento cerámico para evitar daños por calor.",
    sku: "PROD-HAIR-02",
    category: "Belleza y Cuidado",
    supplierCost: 6.80,
    suggestedRetailPrice: 22.50,
    fixedCommission: 12.20,
    stock: 85,
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop"
    ],
    marketingCopy: `💇‍♀️ ¿Cabello de peluquería en casa y en solo 10 minutos? ¡Sí es posible! ✨

El Cepillo One-Step 3 en 1 seca, alisa y da volumen sin maltratar tu cabello:
💖 Tecnología de iones que elimina el frizz al instante
💖 3 niveles de temperatura ajustables
💖 Ahorra horas de secado y planchado

🇪🇨 ENVÍO GRATIS Y PAGO CONTRA ENTREGA en todo el país. Pídelo hoy y paga en efectivo al recibir.`,
    promoMaterialUrl: "https://drive.google.com/drive/folders/ejemplo-cepillo-onestep-ec",
    isActive: true
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "Foco Cámara de Seguridad 360° WiFi Panorámica HD",
    description: "Cámara espía y vigilancia en rosca convencional E27. Conexión WiFi, visión nocturna infrarroja y audio de 2 vías.",
    sku: "PROD-CAM-03",
    category: "Seguridad y Tecnología",
    supplierCost: 8.20,
    suggestedRetailPrice: 26.00,
    fixedCommission: 14.30,
    stock: 210,
    images: [
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop"
    ],
    marketingCopy: `🚨 PROTEGE TU CASA O NEGOCIO SIN INSTALACIONES COSTOSAS 📹

Se enrosca tan fácil como un foco normal y te da control total desde tu celular:
🔒 Giro 360° panorámico en alta definición
🔒 Visión nocturna a color y micrófono para escuchar y hablar
🔒 Alerta de movimiento inmediata a tu WhatsApp/App

📦 Cobertura total en Guayaquil, Quito, Cuenca y todas las provincias de Ecuador.
💵 ¡Pagas cuando el repartidor te entregue el producto en mano!`,
    promoMaterialUrl: "https://drive.google.com/drive/folders/ejemplo-foco-camara-ec",
    isActive: true
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Kit Restaurador y Limpiador de Faros Automotriz NanoTech",
    description: "Polímero de restauración óptica. Remueve el amarillamiento por sol, oxidación y rayones superficiales en policarbonato.",
    sku: "PROD-AUTO-04",
    category: "Accesorios de Auto",
    supplierCost: 5.00,
    suggestedRetailPrice: 19.99,
    fixedCommission: 11.49,
    stock: 95,
    images: [
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop"
    ],
    marketingCopy: `🚗 ¡Devuélvele el brillo original a los faros de tu vehículo en 5 minutos! 💡

Olvídate de pagar pulidas caras en talleres. Con NanoTech:
⚡ Elimina el color amarillo opaco y la niebla del faro
⚡ Mejora la iluminación y seguridad de conducción nocturna
⚡ Fácil de aplicar por cualquier persona

🚚 Envíos seguros con Servientrega y Laar Courier. Pagas en efectivo al recibir tu paquete.`,
    promoMaterialUrl: "https://drive.google.com/drive/folders/ejemplo-nanotech-faros-ec",
    isActive: true
  }
];

export const INITIAL_SELLER: SellerProfile = {
  id: "seller-ecuador-01",
  fullName: "Carlos Mendoza (Comisionista)",
  phoneWhatsapp: "+593998765432",
  cedula: "1723456789",
  role: "seller",
  bankName: "BANCO_PICHINCHA",
  accountType: "AHORROS",
  accountNumber: "2201948572",
  accountHolderName: "Carlos Mendoza",
  accountHolderCedula: "1723456789",
  balancePending: 28.29,
  balanceAvailable: 54.80,
  balanceWithdrawn: 120.00,
  createdAt: "2026-09-01T10:00:00Z"
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: "ord-ec-101",
    sellerId: "seller-ecuador-01",
    productId: "11111111-1111-1111-1111-111111111111",
    product: INITIAL_PRODUCTS[0],
    quantity: 1,
    trackingNumber: "LAAR-EC-982143",
    courierName: "Laar Courier",
    status: "EN_TRANSITO",
    clientName: "Valeria Morales",
    clientCedula: "0923485712",
    clientPhone: "+593984112233",
    clientAddress: "Av. 9 de Octubre y Malecón, Edificio El Rosado Piso 4",
    province: "Guayas",
    canton: "Guayaquil",
    deliveryReference: "Junto a la farmacia Fybeca",
    totalToCollect: 24.99,
    supplierCost: 7.50,
    deliveryCost: 3.50,
    sellerCommission: 13.99,
    courierStatusDetail: "Paquete en móvil de reparto - Guayaquil Norte",
    createdAt: "2026-09-11T14:30:00Z"
  },
  {
    id: "ord-ec-102",
    sellerId: "seller-ecuador-01",
    productId: "33333333-3333-3333-3333-333333333333",
    product: INITIAL_PRODUCTS[2],
    quantity: 1,
    trackingNumber: "SRV-EC-554219",
    courierName: "Servientrega",
    status: "NOVEDAD",
    clientName: "David Zambrano",
    clientCedula: "1719847261",
    clientPhone: "+593992348877",
    clientAddress: "Calle Los Pinos N45-12 y Av. América",
    province: "Pichincha",
    canton: "Quito",
    deliveryReference: "Portón blanco frente al parque",
    totalToCollect: 26.00,
    supplierCost: 8.20,
    deliveryCost: 3.50,
    sellerCommission: 14.30,
    courierStatusDetail: "Dirección incompleta / Cliente no contesta llamadas",
    createdAt: "2026-09-10T09:15:00Z"
  },
  {
    id: "ord-ec-103",
    sellerId: "seller-ecuador-01",
    productId: "22222222-2222-2222-2222-222222222222",
    product: INITIAL_PRODUCTS[1],
    quantity: 1,
    trackingNumber: "LAAR-EC-772910",
    courierName: "Laar Courier",
    status: "ENTREGADO",
    clientName: "Andrea Cárdenas",
    clientCedula: "0104829102",
    clientPhone: "+593987119944",
    clientAddress: "Calle Larga y Huayna Cápac, Casa 3",
    province: "Azuay",
    canton: "Cuenca",
    deliveryReference: "A una cuadra de la iglesia",
    totalToCollect: 22.50,
    supplierCost: 6.80,
    deliveryCost: 3.50,
    sellerCommission: 12.20,
    courierStatusDetail: "Entregado y cobrado en efectivo $22.50",
    createdAt: "2026-09-08T11:20:00Z",
    deliveredAt: "2026-09-10T16:45:00Z"
  }
];

export const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: "pay-ec-01",
    sellerId: "seller-ecuador-01",
    amount: 120.00,
    status: "PAGADO",
    bankDetails: {
      bankName: "BANCO_PICHINCHA",
      accountType: "AHORROS",
      accountNumber: "2201948572",
      accountHolderName: "Carlos Mendoza",
      accountHolderCedula: "1723456789"
    },
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop",
    createdAt: "2026-09-05T10:00:00Z",
    processedAt: "2026-09-05T14:30:00Z"
  }
];

// Helper local para persistir en memoria / localStorage
class MemoryStore {
  private products: Product[] = INITIAL_PRODUCTS;
  private seller: SellerProfile = INITIAL_SELLER;
  private orders: Order[] = INITIAL_ORDERS;
  private payouts: PayoutRequest[] = INITIAL_PAYOUTS;
  private isInitialized = false;

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    if (this.isInitialized) return;
    try {
      const storedSeller = localStorage.getItem("microdropi_seller");
      const storedOrders = localStorage.getItem("microdropi_orders");
      const storedPayouts = localStorage.getItem("microdropi_payouts");
      const storedProducts = localStorage.getItem("microdropi_products");

      if (storedSeller) this.seller = JSON.parse(storedSeller);
      if (storedOrders) this.orders = JSON.parse(storedOrders);
      if (storedPayouts) this.payouts = JSON.parse(storedPayouts);
      if (storedProducts) this.products = JSON.parse(storedProducts);
      this.isInitialized = true;
    } catch {
      // Ignorar errores de localStorage
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("microdropi_seller", JSON.stringify(this.seller));
      localStorage.setItem("microdropi_orders", JSON.stringify(this.orders));
      localStorage.setItem("microdropi_payouts", JSON.stringify(this.payouts));
      localStorage.setItem("microdropi_products", JSON.stringify(this.products));
    } catch {
      // Ignorar
    }
  }

  getProducts(): Product[] {
    this.loadFromStorage();
    return [...this.products];
  }

  getProductById(id: string): Product | undefined {
    this.loadFromStorage();
    return this.products.find((p) => p.id === id);
  }

  getSeller(): SellerProfile {
    this.loadFromStorage();
    return { ...this.seller };
  }

  getOrders(): Order[] {
    this.loadFromStorage();
    return [...this.orders];
  }

  getPayouts(): PayoutRequest[] {
    this.loadFromStorage();
    return [...this.payouts];
  }

  createOrder(orderData: Omit<Order, "id" | "sellerId" | "trackingNumber" | "createdAt" | "status">): Order {
    this.loadFromStorage();
    const product = this.getProductById(orderData.productId);
    if (!product) throw new Error("Producto no encontrado");
    if (product.stock < orderData.quantity) throw new Error("Stock insuficiente");

    // Descontar inventario
    product.stock -= orderData.quantity;

    // Generar tracking provisional
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const tracking = `LAAR-EC-${randomDigits}`;

    const newOrder: Order = {
      ...orderData,
      id: `ord-ec-${Date.now()}`,
      sellerId: this.seller.id,
      trackingNumber: tracking,
      status: "PENDIENTE",
      product,
      createdAt: new Date().toISOString()
    };

    // Agregar a la lista
    this.orders.unshift(newOrder);

    // Motor COD: Sumar comisión a balance_pending
    this.seller.balancePending = Number((this.seller.balancePending + newOrder.sellerCommission).toFixed(2));

    this.saveToStorage();
    return newOrder;
  }

  updateOrderStatus(trackingOrId: string, newStatus: OrderStatus, courierDetail?: string): Order {
    this.loadFromStorage();
    const order = this.orders.find(
      (o) => o.id === trackingOrId || o.trackingNumber === trackingOrId
    );
    if (!order) throw new Error(`Orden no encontrada con id o tracking: ${trackingOrId}`);

    const oldStatus = order.status;
    if (oldStatus === newStatus) return order;

    order.status = newStatus;
    if (courierDetail) order.courierStatusDetail = courierDetail;

    // MOTOR FINANCIERO COD (Equivalente al Trigger PL/pgSQL de Supabase)
    if (newStatus === "ENTREGADO" && oldStatus !== "ENTREGADO") {
      order.deliveredAt = new Date().toISOString();
      // Mover de pendiente a disponible
      this.seller.balancePending = Math.max(0, Number((this.seller.balancePending - order.sellerCommission).toFixed(2)));
      this.seller.balanceAvailable = Number((this.seller.balanceAvailable + order.sellerCommission).toFixed(2));
    } else if (newStatus === "DEVUELTO" && oldStatus !== "DEVUELTO") {
      order.returnedAt = new Date().toISOString();
      // Eliminar de pendiente y devolver stock
      this.seller.balancePending = Math.max(0, Number((this.seller.balancePending - order.sellerCommission).toFixed(2)));
      const prod = this.getProductById(order.productId);
      if (prod) prod.stock += order.quantity;
    } else if (newStatus === "CANCELADO" && oldStatus !== "CANCELADO") {
      if (oldStatus !== "ENTREGADO") {
        this.seller.balancePending = Math.max(0, Number((this.seller.balancePending - order.sellerCommission).toFixed(2)));
        const prod = this.getProductById(order.productId);
        if (prod) prod.stock += order.quantity;
      }
    }

    this.saveToStorage();
    return order;
  }

  requestPayout(amount: number): PayoutRequest {
    this.loadFromStorage();
    if (amount <= 0) throw new Error("El monto de retiro debe ser mayor a cero");
    if (amount < 5.0) throw new Error("El retiro mínimo en Ecuador es de $5.00 USD");
    if (amount > this.seller.balanceAvailable) {
      throw new Error(`Saldo disponible insuficiente. Tienes $${this.seller.balanceAvailable.toFixed(2)} USD`);
    }

    // Deducir del disponible
    this.seller.balanceAvailable = Number((this.seller.balanceAvailable - amount).toFixed(2));

    const payout: PayoutRequest = {
      id: `pay-ec-${Date.now()}`,
      sellerId: this.seller.id,
      amount,
      status: "SOLICITADO",
      bankDetails: {
        bankName: this.seller.bankName,
        accountType: this.seller.accountType,
        accountNumber: this.seller.accountNumber,
        accountHolderName: this.seller.accountHolderName,
        accountHolderCedula: this.seller.accountHolderCedula
      },
      createdAt: new Date().toISOString()
    };

    this.payouts.unshift(payout);
    this.saveToStorage();
    return payout;
  }
}

export const store = new MemoryStore();
