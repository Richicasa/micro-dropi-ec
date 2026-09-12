-- ==============================================================================
-- SCRIPT SQL: CREACIÓN DE USUARIO ADMINISTRADOR Y COMISIONISTA MAESTRO
-- Ejecutar en Supabase SQL Editor
-- ==============================================================================

-- 1. Habilitar extensión pgcrypto para encriptación de contraseñas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    user_email TEXT := 'richi@microdropi.ec';
    user_password TEXT := 'Ecuador2026*';
    existing_id UUID;
BEGIN
    SELECT id INTO existing_id FROM auth.users WHERE email = user_email;

    IF existing_id IS NULL THEN
        -- Insertar en auth.users con hash bcrypt nativo
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            user_email,
            crypt(user_password, gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"Richi Casa","phone_whatsapp":"+593983741834","role":"admin"}',
            now(),
            now()
        );

        -- Insertar perfil en public.profiles
        INSERT INTO public.profiles (
            id,
            full_name,
            phone_whatsapp,
            role,
            referral_code,
            balance_available,
            balance_pending,
            balance_withdrawn,
            welcome_bonus_awarded,
            seller_rank
        ) VALUES (
            new_user_id,
            'Richi Casa',
            '+593983741834',
            'admin',
            'DROPI-RICHI',
            5.00,
            0.00,
            0.00,
            TRUE,
            'VERIFICADO'
        ) ON CONFLICT (id) DO UPDATE
        SET 
            full_name = 'Richi Casa',
            phone_whatsapp = '+593983741834',
            referral_code = 'DROPI-RICHI',
            seller_rank = 'VERIFICADO';

        RAISE NOTICE 'Usuario creado con éxito: % (ID: %)', user_email, new_user_id;
    ELSE
        -- Actualizar contraseña y datos si ya existía
        UPDATE auth.users 
        SET encrypted_password = crypt(user_password, gen_salt('bf')),
            raw_user_meta_data = '{"full_name":"Richi Casa","phone_whatsapp":"+593983741834","role":"admin"}',
            updated_at = now()
        WHERE id = existing_id;

        INSERT INTO public.profiles (
            id,
            full_name,
            phone_whatsapp,
            role,
            referral_code,
            balance_available,
            welcome_bonus_awarded,
            seller_rank
        ) VALUES (
            existing_id,
            'Richi Casa',
            '+593983741834',
            'admin',
            'DROPI-RICHI',
            5.00,
            TRUE,
            'VERIFICADO'
        ) ON CONFLICT (id) DO UPDATE
        SET 
            full_name = 'Richi Casa',
            phone_whatsapp = '+593983741834',
            referral_code = 'DROPI-RICHI',
            seller_rank = 'VERIFICADO';

        RAISE NOTICE 'Usuario existente actualizado con éxito: % (ID: %)', user_email, existing_id;
    END IF;
END $$;
