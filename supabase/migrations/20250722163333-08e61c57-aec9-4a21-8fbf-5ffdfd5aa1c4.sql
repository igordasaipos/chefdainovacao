-- Criar usuários admin com credenciais específicas
-- Primeiro, vamos criar usuários na tabela auth.users através de uma function
CREATE OR REPLACE FUNCTION create_admin_user(email text, password text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Atualizar os emails dos admins para incluir credenciais específicas da Saipos
DELETE FROM public.admins;

INSERT INTO public.admins (email) VALUES 
  ('admin.saipos@ifoodmove.com'),
  ('tech.saipos@ifoodmove.com'),
  ('manager.saipos@ifoodmove.com');