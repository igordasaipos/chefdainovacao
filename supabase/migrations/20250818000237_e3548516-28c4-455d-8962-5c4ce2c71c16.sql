-- Verificar se a política UPDATE está funcionando corretamente
-- O problema pode estar na extração do email do JWT

-- Primeira, vamos verificar se a função is_super_admin está funcionando
-- Vamos testar com o email do usuário atual
SELECT is_super_admin('igor.nascimento@saipos.com') as is_super_admin_test;

-- Verificar se a função user_has_permission está funcionando
SELECT user_has_permission('igor.nascimento@saipos.com', 'manage_users') as has_manage_users;

-- Vamos atualizar as políticas para usar auth.email() em vez de auth.jwt() ->> 'email'
-- Isso pode resolver o problema de extração do email

-- Primeiro, remover as políticas atuais
DROP POLICY IF EXISTS "Usuários com permissão podem atualizar admins" ON public.admins;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar admins" ON public.admins;

-- Recriar com auth.email()
CREATE POLICY "Usuários com permissão podem atualizar admins"
ON public.admins
FOR UPDATE
USING (
    user_has_permission(auth.email(), 'manage_users') 
    OR is_super_admin(auth.email())
);

CREATE POLICY "Usuários com permissão podem deletar admins"  
ON public.admins
FOR DELETE
USING (
    user_has_permission(auth.email(), 'manage_users') 
    OR is_super_admin(auth.email())
);