-- Corrigir problemas de segurança
-- 1. Corrigir função com search_path
CREATE OR REPLACE FUNCTION public.create_admin_user(email text, password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
  encrypted_pw text;
BEGIN
  -- Gerar ID para o usuário
  user_id := gen_random_uuid();
  
  -- Inserir usuário no auth.users (simplificado para desenvolvimento)
  INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role
  ) VALUES (
    user_id,
    email,
    now(),
    now(),
    now(),
    'authenticated',
    'authenticated'
  );
  
  RETURN user_id;
END;
$$;