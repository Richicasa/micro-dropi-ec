# 🇪🇨 Micro-Dropi Ecuador: Motor de Social Commerce y Comisiones COD

Plataforma privada de dropshipping y social commerce optimizada para el mercado ecuatoriano, enfocada en ventas con **Pago Contra Entrega (Cash On Delivery - COD)** en dólares estadounidenses (USD).

Conecta a vendedores independientes y comisionistas con bodegas físicas e importadores, gestionando el ciclo completo de despacho, trazabilidad de couriers (Laar Courier, Servientrega, Speed) y liquidación financiera automática de comisiones.

---

## 🚀 Características Principales

1. **Mobile-First PWA:** Diseñada para comisionistas que operan 100% desde su celular (WhatsApp Business, TikTok Ads, Facebook Marketplace).
2. **Validaciones Geográficas y de Identidad Ecuatoriana:**
   - **Algoritmo Módulo 10:** Validación algorítmica en tiempo real de cédulas de identidad ecuatorianas de 10 dígitos.
   - **Diccionario Territorial Oficial:** Cobertura de las 24 provincias de Ecuador y sus cantones con selectores en cascada.
   - **Normalización Telefónica E.164:** Formato móvil local (+593 9xxxxxxxx / 09xxxxxxxx).
3. **Motor Financiero COD Transaccional (Supabase / PostgreSQL):**
   - Retención automática de comisiones en `balance_pendiente` al crear el pedido.
   - Transferencia atómica a `balance_disponible` únicamente cuando el courier reporta el paquete como `ENTREGADO` y cobra el dinero en efectivo.
   - Reversión de saldo pendiente y devolución automática de stock a bodega en caso de devolución (`DEVUELTO`).
   - Bloqueo de saldo disponible y registro en `payouts` para retiros a Banco Pichincha, Banco Guayaquil o DeUna!.
4. **Despacho Inmediato vía Telegram Bot:**
   - Cada orden registrada genera instantáneamente una tarjeta de despacho en Telegram para el equipo de empaque con datos del cliente y enlace directo a WhatsApp.
   - Al confirmarse la entrega, se notifica la liquidación contable del pedido.
5. **Catálogo con Material de Venta 1-Clic:** Copys persuasivos listos para copiar con emojis, ganchos y llamados a la acción, además de enlaces a creativos publicitarios en Google Drive.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React.
- **Backend & Orquestación:** Server Actions (`actions/orders.ts`) y Route Handlers (`app/api/orders/update-status/route.ts`).
- **Base de Datos & Seguridad:** Supabase (PostgreSQL) con Row Level Security (RLS) y funciones RPC (`credit_seller_commission`).
- **Notificaciones:** Telegram Bot API nativo con formateo HTML.
- **Validación:** Zod.

---

## 📁 Estructura del Proyecto

```
micro-dropi-ec/
├── src/
│   ├── actions/
│   │   └── orders.ts                # Server Action: validaciones Zod + Módulo 10 + Telegram
│   ├── app/
│   │   ├── api/
│   │   │   ├── orders/
│   │   │   │   ├── route.ts         # REST API de órdenes
│   │   │   │   └── update-status/   # Route Handler seguro (cambio de estado y liquidación)
│   │   │   └── products/route.ts    # REST API de catálogo
│   │   ├── billetera/page.tsx       # Billetera, saldos y retiros bancarios (Pichincha, DeUna)
│   │   ├── catalogo/page.tsx        # Catálogo con material de venta 1-clic
│   │   ├── pedidos/
│   │   │   ├── nuevo/page.tsx       # Formulario express COD con validaciones locales
│   │   │   └── page.tsx             # Panel "Mis Ventas" y seguimiento de courier
│   │   ├── layout.tsx               # Shell PWA con Bottom Navigation fija
│   │   └── page.tsx                 # Dashboard comisionista
│   ├── components/
│   │   ├── BottomNav.tsx            # Barra inferior móvil
│   │   ├── Header.tsx               # Encabezado con balances en vivo
│   │   ├── SimulateWebhookDrawer.tsx# Simulador de entrega de courier para pruebas
│   │   └── Toast.tsx                # Notificaciones toast
│   └── lib/
│       ├── ecuador.ts               # Algoritmo Módulo 10 y diccionario de 24 provincias
│       ├── store.ts                 # Motor de paridad local para desarrollo sin backend remoto
│       ├── supabase.ts              # Cliente Supabase
│       ├── telegram.ts              # Servicio de alertas Telegram para bodega
│       └── types.ts                 # Definición de tipos TypeScript
├── supabase/
│   └── schema.sql                   # Migración SQL completa con DDL, Triggers, RLS y Seeds
├── .env.example                     # Plantilla de variables de entorno
└── package.json
```

---

## ⚙️ Configuración y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias:
```bash
git clone https://github.com/Richicasa/micro-dropi-ec.git
cd micro-dropi-ec
npm install
```

### 2. Configurar variables de entorno:
Copia el archivo `.env.example` a `.env.local` y asigna tus credenciales:
```env
NEXT_PUBLIC_DEFAULT_CURRENCY=USD
NEXT_PUBLIC_BASE_SHIPPING_COST=3.50

# Telegram Bot
TELEGRAM_BOT_TOKEN="tu_token_de_botfather"
TELEGRAM_CHAT_ID_DISPATCH="tu_chat_id"

# Secreto de Autenticación
INTERNAL_WEBHOOK_SECRET="tu_clave_secreta"
NEXT_PUBLIC_INTERNAL_WEBHOOK_SECRET="tu_clave_secreta"

# Supabase (Opcional en desarrollo local)
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
```

### 3. Migración de Base de Datos en Supabase:
Copia el contenido del archivo [`supabase/schema.sql`](./supabase/schema.sql) y ejecútalo en el **SQL Editor** de tu panel de Supabase.

### 4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador. Activa la vista de dispositivo móvil (`F12` -> `Ctrl+Shift+M`) para la mejor experiencia PWA.

---

## 🔒 Seguridad (RLS)
- Cada vendedor autenticado únicamente tiene acceso a sus pedidos, retiros y saldo.
- La liquidación de pedidos y modificaciones administrativas están restringidas exclusivamente al rol `service_role`.
