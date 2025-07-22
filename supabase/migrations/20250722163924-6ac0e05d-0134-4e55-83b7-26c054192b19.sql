
-- Primeiro, vamos criar uma função que funciona corretamente para criar usuários admin
-- com hash de senha adequado

-- Criar usuários admin diretamente no auth.users com senha hash
DO $$
DECLARE
    admin_user_id uuid;
    tech_user_id uuid;
    manager_user_id uuid;
BEGIN
    -- Criar usuário admin.saipos@ifoodmove.com
    admin_user_id := gen_random_uuid();
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        aud,
        role,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        'admin.saipos@ifoodmove.com',
        crypt('saipos2024', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO NOTHING;

    -- Criar usuário tech.saipos@ifoodmove.com
    tech_user_id := gen_random_uuid();
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        aud,
        role,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        tech_user_id,
        '00000000-0000-0000-0000-000000000000',
        'tech.saipos@ifoodmove.com',
        crypt('saipos2024', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO NOTHING;

    -- Criar usuário manager.saipos@ifoodmove.com
    manager_user_id := gen_random_uuid();
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        aud,
        role,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        manager_user_id,
        '00000000-0000-0000-0000-000000000000',
        'manager.saipos@ifoodmove.com',
        crypt('saipos2024', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO NOTHING;

    -- Verificar se os admins já existem na tabela public.admins, se não existirem, criar
    INSERT INTO public.admins (email) VALUES ('admin.saipos@ifoodmove.com') ON CONFLICT (email) DO NOTHING;
    INSERT INTO public.admins (email) VALUES ('tech.saipos@ifoodmove.com') ON CONFLICT (email) DO NOTHING;
    INSERT INTO public.admins (email) VALUES ('manager.saipos@ifoodmove.com') ON CONFLICT (email) DO NOTHING;
END $$;

-- Remover a função create_admin_user que não estava funcionando corretamente
DROP FUNCTION IF EXISTS public.create_admin_user(text, text);
