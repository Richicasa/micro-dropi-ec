-- ==============================================================================
-- PROYECTO: Micro-Dropi Ecuador (Motor de Social Commerce y Comisiones COD)
-- ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE (POSTGRESQL)
-- ==============================================================================

-- 1. HABILITACIÓN DE EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUM PERSONALIZADOS
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
        'PENDIENTE',        -- Pedido recién creado por el comisionista en la PWA
        'GUIA_GENERADA',    -- Guía logística emitida con Laar Courier / Servientrega vía n8n
        'EN_TRANSITO',      -- Courier recolectó el paquete en bodega y va hacia el cliente
        'NOVEDAD',          -- Dirección incorrecta, cliente no atiende o reprogramó entrega
        'ENTREGADO',        -- Cobrado en efectivo en destino -> DISPARA LIQUIDACIÓN DE COMISIÓN
        'DEVUELTO',         -- No se concretó entrega -> retorno a bodega y anulación de comisión
        'CANCELADO'         -- Cancelado antes de despacho
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM (
        'SOLICITADO',       -- Solicitud de retiro ingresada por el vendedor
        'EN_PROCESO',       -- En revisión administrativa de tesorería
        'PAGADO',           -- Transferencia bancaria o DeUna! efectuada con comprobante
        'RECHAZADO'         -- Datos bancarios erróneos o rechazo justificado
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bank_ecuador AS ENUM (
        'BANCO_PICHINCHA',
        'BANCO_GUAYAQUIL',
        'PRODUBANCO',
        'BANCO_PACIFICO',
        'BANCO_BOLIVARIANO',
        'BANCO_INTERNACIONAL',
        'COOPERATIVA_JEP',
        'DEUNA_PICHINCHA',
        'OTRO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE seller_rank AS ENUM ('NOVATO', 'VERIFICADO', 'ELITE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLA: PROFILES (VENDEDORES COMISIONISTAS / BODEGAS / ADMINS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_whatsapp TEXT NOT NULL,
    cedula VARCHAR(10),
    role TEXT NOT NULL DEFAULT 'seller' CHECK (role IN ('seller', 'warehouse', 'admin')),
    
    -- Información bancaria para liquidación de retiros en Ecuador
    bank_name bank_ecuador DEFAULT 'BANCO_PICHINCHA',
    account_type TEXT DEFAULT 'AHORROS' CHECK (account_type IN ('AHORROS', 'CORRIENTE', 'DEUNA')),
    account_number TEXT,
    account_holder_name TEXT,
    account_holder_cedula VARCHAR(10),
    
    -- Balances Financieros (en USD)
    balance_pending NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (balance_pending >= 0),
    balance_available NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (balance_available >= 0),
    balance_withdrawn NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (balance_withdrawn >= 0),

    -- Retención Psicológica, Gamificación y Referidos
    referral_code VARCHAR(12) UNIQUE,
    referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    streak_count INTEGER NOT NULL DEFAULT 0 CHECK (streak_count >= 0),
    last_order_date DATE,
    welcome_bonus_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    seller_rank seller_rank NOT NULL DEFAULT 'NOVATO',
    total_referral_earnings NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_referral_earnings >= 0),
    referred_count INTEGER NOT NULL DEFAULT 0 CHECK (referred_count >= 0),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA: PRODUCTS (CATÁLOGO DE PRODUCTOS EN BODEGA LOCAL)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    
    -- Estructura de precios en USD
    supplier_cost NUMERIC(10,2) NOT NULL CHECK (supplier_cost >= 0),
    suggested_retail_price NUMERIC(10,2) NOT NULL CHECK (suggested_retail_price >= supplier_cost),
    fixed_commission NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (fixed_commission >= 0),
    
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    images TEXT[] NOT NULL DEFAULT '{}',
    
    -- Material de venta rápida para vendedores de redes sociales
    marketing_copy TEXT NOT NULL,
    promo_material_url TEXT,
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA: ORDERS (PEDIDOS COD Y LIQUIDACIÓN LOGÍSTICA)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    
    -- Datos logísticos
    tracking_number TEXT UNIQUE,
    courier_name TEXT NOT NULL DEFAULT 'Laar Courier',
    status order_status NOT NULL DEFAULT 'PENDIENTE',
    
    -- Datos de entrega en Ecuador
    client_name TEXT NOT NULL,
    client_cedula VARCHAR(10) NOT NULL,
    client_phone TEXT NOT NULL,
    client_address TEXT NOT NULL,
    province TEXT NOT NULL,
    canton TEXT NOT NULL,
    delivery_reference TEXT,
    
    -- Desglose Financiero COD (en USD)
    total_to_collect NUMERIC(10,2) NOT NULL CHECK (total_to_collect > 0), -- Cobro final en efectivo
    supplier_cost NUMERIC(10,2) NOT NULL CHECK (supplier_cost >= 0),     -- Liquidación para bodega
    delivery_cost NUMERIC(10,2) NOT NULL DEFAULT 3.50,                   -- Flete courier Ecuador
    seller_commission NUMERIC(10,2) NOT NULL CHECK (seller_commission >= 0), -- Ganancia neta vendedor
    
    -- Metadatos para n8n
    n8n_event_id TEXT,
    courier_status_detail TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    guia_generated_at TIMESTAMPTZ,
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABLA: PAYOUTS (SOLICITUDES Y LIQUIDACIÓN DE RETIRO DE COMISIONES)
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 20.00), -- Mínimo de retiro $20 USD
    status payout_status NOT NULL DEFAULT 'SOLICITADO',
    
    -- Snapshot bancario al momento de solicitar
    bank_details JSONB NOT NULL,
    proof_url TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABLA: ORDER_STATUS_HISTORY (LOG AUDITABLE DE CAMBIOS DE ESTADO)
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    previous_status order_status,
    new_status order_status NOT NULL,
    notes TEXT,
    source TEXT DEFAULT 'n8n_webhook',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. FUNCIONES Y TRIGGERS DE AUTOMATIZACIÓN FINANCIERA (MOTOR COD)
-- ==============================================================================

-- A) AUTO-CREAR PERFIL AL REGISTRARSE EN AUTH.USERS (CON BONO DE BIENVENIDA $5 Y CÓDIGO REFERIDO)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_referral_code VARCHAR(12);
    v_sponsor_id UUID := NULL;
    v_incoming_ref TEXT;
BEGIN
    -- 1. Generar código de referido único (ej: DROPI-A1B2)
    v_referral_code := 'DROPI-' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || clock_timestamp()::TEXT) FROM 1 FOR 4));

    -- 2. Verificar si viene referido por alguien
    v_incoming_ref := NEW.raw_user_meta_data->>'referral_code';
    IF v_incoming_ref IS NOT NULL AND TRIM(v_incoming_ref) != '' THEN
        SELECT id INTO v_sponsor_id FROM public.profiles WHERE referral_code = UPPER(TRIM(v_incoming_ref)) LIMIT 1;
        IF v_sponsor_id IS NOT NULL THEN
            UPDATE public.profiles 
            SET referred_count = referred_count + 1, updated_at = now()
            WHERE id = v_sponsor_id;
        END IF;
    END IF;

    -- 3. Crear perfil con Bono de Bienvenida ($5.00 USD retenidos hasta alcanzar el retiro mínimo de $20)
    INSERT INTO public.profiles (
        id, 
        full_name, 
        phone_whatsapp, 
        role, 
        referral_code, 
        referred_by, 
        balance_available, 
        welcome_bonus_awarded,
        seller_rank
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Vendedor Micro-Dropi'),
        COALESCE(NEW.raw_user_meta_data->>'phone_whatsapp', '+593900000000'),
        'seller',
        v_referral_code,
        v_sponsor_id,
        5.00,
        TRUE,
        'NOVATO'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_after_auth_user_created ON auth.users;
CREATE TRIGGER trg_after_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- B) GESTIÓN DE STOCK Y BALANCE PENDIENTE AL CREAR ORDEN
CREATE OR REPLACE FUNCTION public.handle_order_creation()
RETURNS TRIGGER AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- 1. Validar y descontar stock disponible
    SELECT stock INTO current_stock FROM public.products WHERE id = NEW.product_id FOR UPDATE;
    IF current_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Stock insuficiente para el producto seleccionado. Stock actual: %', current_stock;
    END IF;

    UPDATE public.products 
    SET stock = stock - NEW.quantity, updated_at = now()
    WHERE id = NEW.product_id;

    -- 2. Sumar la comisión a balance_pending del vendedor
    UPDATE public.profiles
    SET balance_pending = balance_pending + NEW.seller_commission,
        updated_at = now()
    WHERE id = NEW.seller_id;

    -- 3. Registrar en historial
    INSERT INTO public.order_status_history (order_id, previous_status, new_status, notes, source)
    VALUES (NEW.id, NULL, NEW.status, 'Creación de pedido en PWA', 'pwa_seller');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_after_order_created ON public.orders;
CREATE TRIGGER trg_after_order_created
    AFTER INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_creation();


-- C) MOTOR DE LIQUIDACIÓN COD CUANDO EL COURIER ACTUALIZA EL ESTADO
CREATE OR REPLACE FUNCTION public.handle_order_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo proceder si hubo cambio efectivo de estado
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    NEW.updated_at = now();

    -- Registrar en historial de auditoría
    INSERT INTO public.order_status_history (
        order_id, previous_status, new_status, notes, source
    ) VALUES (
        NEW.id, OLD.status, NEW.status, NEW.courier_status_detail, 'n8n_courier_webhook'
    );

    -- 1. CASO: ENTREGADO (EL CLIENTE PAGÓ AL COURIER EN EFECTIVO)
    -- Se libera la comisión: pasa de pendiente a disponible
    IF NEW.status = 'ENTREGADO' AND OLD.status != 'ENTREGADO' THEN
        NEW.delivered_at = now();

        UPDATE public.profiles
        SET balance_pending = GREATEST(0.00, balance_pending - NEW.seller_commission),
            balance_available = balance_available + NEW.seller_commission,
            updated_at = now()
        WHERE id = NEW.seller_id;

    -- 2. CASO: DEVUELTO (NO SE CONCRETÓ EL PAGO EN DESTINO)
    -- Se elimina la comisión pendiente y se regresa el stock físico a la bodega
    ELSIF NEW.status = 'DEVUELTO' AND OLD.status != 'DEVUELTO' THEN
        NEW.returned_at = now();

        -- Restar del pendiente
        UPDATE public.profiles
        SET balance_pending = GREATEST(0.00, balance_pending - NEW.seller_commission),
            updated_at = now()
        WHERE id = NEW.seller_id;

        -- Regresar inventario a bodega
        UPDATE public.products
        SET stock = stock + NEW.quantity,
            updated_at = now()
        WHERE id = NEW.product_id;

    -- 3. CASO: CANCELADO (ANTES DE SALIR A RUTA)
    ELSIF NEW.status = 'CANCELADO' AND OLD.status != 'CANCELADO' THEN
        IF OLD.status != 'ENTREGADO' THEN
            UPDATE public.profiles
            SET balance_pending = GREATEST(0.00, balance_pending - NEW.seller_commission),
                updated_at = now()
            WHERE id = NEW.seller_id;

            UPDATE public.products
            SET stock = stock + NEW.quantity,
                updated_at = now()
            WHERE id = NEW.product_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_before_order_status_updated ON public.orders;
CREATE TRIGGER trg_before_order_status_updated
    BEFORE UPDATE OF status ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_update();

-- C.1) FUNCIÓN RPC PARA LIQUIDACIÓN ATÓMICA DESDE ROUTE HANDLERS
-- Incluye: Acreditación de comisión, Bono de $5.00 al Patrocinador en 1era entrega, Cálculo de Rango y Racha
CREATE OR REPLACE FUNCTION public.credit_seller_commission(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
    target_order RECORD;
    v_seller RECORD;
    v_sponsor_id UUID;
    v_delivered_orders_count INTEGER;
    v_is_first_delivery BOOLEAN := FALSE;
    v_referral_bonus NUMERIC(10,2) := 5.00;
    v_new_rank seller_rank;
    v_current_streak INTEGER;
    v_last_order_date DATE;
BEGIN
    SELECT * INTO target_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Orden % no encontrada', p_order_id;
    END IF;

    IF target_order.status = 'ENTREGADO' THEN
        RETURN jsonb_build_object('success', true, 'already_credited', true);
    END IF;

    -- Actualizar estado a ENTREGADO (el trigger trg_before_order_status_updated maneja histórico y balance comisionista)
    UPDATE public.orders
    SET status = 'ENTREGADO',
        delivered_at = now(),
        updated_at = now()
    WHERE id = p_order_id;

    -- Obtener perfil del comisionista
    SELECT * INTO v_seller FROM public.profiles WHERE id = target_order.seller_id FOR UPDATE;

    -- 1. Contar total de pedidos entregados acumulados del comisionista
    SELECT COUNT(*) INTO v_delivered_orders_count 
    FROM public.orders 
    WHERE seller_id = target_order.seller_id AND status = 'ENTREGADO';

    -- 2. Bono de Referido (+$5 USD al patrocinador en la PRIMERA entrega del referido)
    IF v_delivered_orders_count = 1 AND v_seller.referred_by IS NOT NULL THEN
        v_is_first_delivery := TRUE;
        v_sponsor_id := v_seller.referred_by;

        -- Acreditar $5 al patrocinador
        UPDATE public.profiles
        SET balance_available = balance_available + v_referral_bonus,
            total_referral_earnings = total_referral_earnings + v_referral_bonus,
            updated_at = now()
        WHERE id = v_sponsor_id;
    END IF;

    -- 3. Calcular y actualizar Rango de Vendedor
    -- 0-4: NOVATO | 5-19: VERIFICADO (Despacho prioritario) | 20+: ELITE (Catálogo VIP)
    IF v_delivered_orders_count >= 20 THEN
        v_new_rank := 'ELITE';
    ELSIF v_delivered_orders_count >= 5 THEN
        v_new_rank := 'VERIFICADO';
    ELSE
        v_new_rank := 'NOVATO';
    END IF;

    -- 4. Cálculo de Racha Diaria (Streak)
    v_last_order_date := v_seller.last_order_date;
    v_current_streak := COALESCE(v_seller.streak_count, 0);

    IF v_last_order_date IS NULL THEN
        v_current_streak := 1;
    ELSIF v_last_order_date = CURRENT_DATE THEN
        -- Ya entregó hoy, mantener racha
        NULL;
    ELSIF v_last_order_date = CURRENT_DATE - 1 THEN
        -- Entrega consecutiva del día siguiente
        v_current_streak := v_current_streak + 1;
    ELSE
        -- Se rompió la racha anterior, reiniciar a 1
        v_current_streak := 1;
    END IF;

    -- Actualizar perfil del vendedor con nuevo rango y racha
    UPDATE public.profiles
    SET seller_rank = v_new_rank,
        streak_count = v_current_streak,
        last_order_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = target_order.seller_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', p_order_id,
        'seller_id', target_order.seller_id,
        'commission_credited', target_order.seller_commission,
        'new_rank', v_new_rank,
        'streak_count', v_current_streak,
        'sponsor_bonus_credited', v_is_first_delivery
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- D) BLOQUEO Y LIQUIDACIÓN DE RETIROS (PAYOUTS)
CREATE OR REPLACE FUNCTION public.handle_payout_request()
RETURNS TRIGGER AS $$
DECLARE
    available_funds NUMERIC(12,2);
BEGIN
    -- Candado de retiro mínimo de $20.00 USD
    IF NEW.amount < 20.00 THEN
        RAISE EXCEPTION 'El monto mínimo de retiro en Ecuador es de $20.00 USD. Solicitaste: $% USD', NEW.amount;
    END IF;

    SELECT balance_available INTO available_funds 
    FROM public.profiles WHERE id = NEW.seller_id FOR UPDATE;

    IF available_funds < NEW.amount THEN
        RAISE EXCEPTION 'Saldo disponible insuficiente para solicitar retiro de $% USD. Saldo disponible: $% USD', 
            NEW.amount, available_funds;
    END IF;

    -- Deducir inmediatamente del balance disponible para evitar doble gasto
    UPDATE public.profiles
    SET balance_available = balance_available - NEW.amount,
        updated_at = now()
    WHERE id = NEW.seller_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_before_payout_inserted ON public.payouts;
CREATE TRIGGER trg_before_payout_inserted
    BEFORE INSERT ON public.payouts
    FOR EACH ROW EXECUTE FUNCTION public.handle_payout_request();


-- E) PROCESAMIENTO DE RETIRO (PAGADO O RECHAZADO)
CREATE OR REPLACE FUNCTION public.handle_payout_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    NEW.updated_at = now();

    -- Si se pagó con éxito, registrar en saldo total retirado
    IF NEW.status = 'PAGADO' AND OLD.status != 'PAGADO' THEN
        NEW.processed_at = now();
        UPDATE public.profiles
        SET balance_withdrawn = balance_withdrawn + NEW.amount,
            updated_at = now()
        WHERE id = NEW.seller_id;

    -- Si se rechazó (ej. cuenta bancaria incorrecta), reponer saldo a balance disponible
    ELSIF NEW.status = 'RECHAZADO' AND OLD.status != 'RECHAZADO' THEN
        NEW.processed_at = now();
        UPDATE public.profiles
        SET balance_available = balance_available + NEW.amount,
            updated_at = now()
        WHERE id = NEW.seller_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_before_payout_status_updated ON public.payouts;
CREATE TRIGGER trg_before_payout_status_updated
    BEFORE UPDATE OF status ON public.payouts
    FOR EACH ROW EXECUTE FUNCTION public.handle_payout_status_change();


-- ==============================================================================
-- 9. SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PROFILES
CREATE POLICY "Los usuarios pueden ver su propio perfil o service_role" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Los usuarios pueden actualizar sus datos de cobro" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id OR auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.uid() = id OR auth.jwt()->>'role' = 'service_role');

-- POLÍTICAS PRODUCTS
CREATE POLICY "Catálogo activo visible para usuarios autenticados" 
    ON public.products FOR SELECT 
    USING (is_active = true OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Administradores y service_role gestionan catálogo" 
    ON public.products FOR ALL 
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- POLÍTICAS ORDERS
CREATE POLICY "Vendedores solo ven sus propios pedidos" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = seller_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Vendedores pueden crear pedidos asignados a sí mismos" 
    ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = seller_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Modificación de pedidos por service_role o admin" 
    ON public.orders FOR UPDATE 
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- POLÍTICAS PAYOUTS
CREATE POLICY "Vendedores ven sus solicitudes de retiro" 
    ON public.payouts FOR SELECT 
    USING (auth.uid() = seller_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Vendedores pueden solicitar retiros para sí mismos" 
    ON public.payouts FOR INSERT 
    WITH CHECK (auth.uid() = seller_id OR auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Gestión de retiros por tesorería y service_role" 
    ON public.payouts FOR UPDATE 
    USING (auth.jwt()->>'role' = 'service_role')
    WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- POLÍTICAS HISTORIAL
CREATE POLICY "Vendedores pueden ver historial de sus órdenes" 
    ON public.order_status_history FOR SELECT 
    USING (
        auth.jwt()->>'role' = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_status_history.order_id 
              AND orders.seller_id = auth.uid()
        )
    );

-- ÍNDICES PARA OPTIMIZAR CONSULTAS EN TIEMPO REAL Y WEBHOOKS DE COURIERS
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_seller_status ON public.orders(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- ==============================================================================
-- 10. SEED DATA (PRODUCTOS GANADORES LISTOS PARA SOCIAL COMMERCE EN ECUADOR)
-- ==============================================================================
INSERT INTO public.products (
    id, title, description, sku, category, supplier_cost, suggested_retail_price, 
    fixed_commission, stock, images, marketing_copy, promo_material_url
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Mini Licuadora Portátil USB Recargable Fresh Juice',
    'Licuadora personal inalámbrica de 350ml con 4 cuchillas de acero inoxidable. Ideal para batidos proteicos y smoothies en la oficina o gimnasio.',
    'PROD-BLENDER-01',
    'Hogar y Cocina',
    7.50,
    24.99,
    13.99,
    140,
    ARRAY['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop'],
    '🍓 ¡Prepara tus batidos favoritos DONDE SEA en solo 30 segundos! 🚀

Olvídate de las licuadoras pesadas y cables molestos. Con la Mini Licuadora Fresh Juice:
✅ Inalámbrica y recargable por USB (¡te dura hasta 15 batidos!)
✅ Cuchillas de acero que trituran hielo y fruta congelada
✅ Diseño estético y ultra ligero para llevar en el bolso

🚚 ¡PAGO CONTRA ENTREGA A TODO EL ECUADOR! No pagas nada hasta que llegue a tu puerta.
👉 Haz tu pedido respondiendo a este mensaje.',
    'https://drive.google.com/drive/folders/ejemplo-fresh-juice-ecuador'
),
(
    '22222222-2222-2222-2222-222222222222',
    'Cepillo Secador y Voluminizador One-Step 3 en 1',
    'Seca, peina y da volumen en un solo paso. Tecnología de iones negativos para eliminar el frizz y proteger las puntas.',
    'PROD-HAIR-02',
    'Belleza y Cuidado',
    6.80,
    22.50,
    12.20,
    85,
    ARRAY['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop'],
    '💇‍♀️ ¿Cabello de peluquería en casa y en solo 10 minutos? ¡Sí es posible! ✨

El Cepillo One-Step 3 en 1 seca, alisa y da volumen sin quemar tu cabello:
💖 Tecnología de iones que elimina el frizz al instante
💖 3 niveles de temperatura ajustables
💖 Ahorra horas de secado y planchado

🇪🇨 ENVÍO GRATIS Y PAGO CONTRA ENTREGA en todo el país. Pídelo hoy y paga en efectivo al recibir.',
    'https://drive.google.com/drive/folders/ejemplo-cepillo-onestep-ec'
),
(
    '33333333-3333-3333-3333-333333333333',
    'Foco Cámara de Seguridad 360° WiFi Panorámica HD',
    'Cámara espía y de vigilancia en forma de foco convencional E27. Visión nocturna, audio bidireccional y alerta de movimiento al celular.',
    'PROD-CAM-03',
    'Seguridad y Tecnología',
    8.20,
    26.00,
    14.30,
    210,
    ARRAY['https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop'],
    '🚨 PROTEGE TU CASA O NEGOCIO SIN INSTALACIONES COSTOSAS 📹

Se enrosca tan fácil como un foco normal y te da control total desde tu celular:
🔒 Giro 360° panorámico en alta definición
🔒 Visión nocturna a color y micrófono para escuchar y hablar
🔒 Alerta de movimiento inmediata a tu WhatsApp/App

📦 Cobertura total en Guayaquil, Quito, Cuenca y todas las provincias de Ecuador.
💵 ¡Pagas cuando el repartidor te entregue el producto en mano!',
    'https://drive.google.com/drive/folders/ejemplo-foco-camara-ec'
),
(
    '44444444-4444-4444-4444-444444444444',
    'Kit Restaurador y Limpiador de Faros Automotriz NanoTech',
    'Fórmula de polímero restaurador que elimina la opacidad, rayas amarillentas y oxidación en faros de autos y motos al instante.',
    'PROD-AUTO-04',
    'Accesorios de Auto',
    5.00,
    19.99,
    11.49,
    95,
    ARRAY['https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop'],
    '🚗 ¡Devuélvele el brillo original a los faros de tu vehículo en 5 minutos! 💡

Olvídate de pagar pulidas caras en talleres. Con NanoTech:
⚡ Elimina el color amarillo opaco y la niebla del faro
⚡ Mejora la iluminación y seguridad de conducción nocturna
⚡ Fácil de aplicar por cualquier persona

🚚 Envíos seguros con Servientrega y Laar Courier. Pagas en efectivo al recibir tu paquete.',
    'https://drive.google.com/drive/folders/ejemplo-nanotech-faros-ec'
)
ON CONFLICT (sku) DO NOTHING;
