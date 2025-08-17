-- Criar políticas RLS para UPDATE e DELETE na tabela admins
-- Isso permite que usuários com permissão manage_users possam atualizar e deletar outros usuários

-- Política para UPDATE - permite que usuários com permissão manage_users ou super admins atualizem outros usuários
CREATE POLICY "Usuários com permissão podem atualizar admins"
ON public.admins
FOR UPDATE
USING (
    user_has_permission(auth.jwt() ->> 'email', 'manage_users') 
    OR is_super_admin(auth.jwt() ->> 'email')
);

-- Política para DELETE - permite que usuários com permissão manage_users ou super admins deletem outros usuários
CREATE POLICY "Usuários com permissão podem deletar admins"
ON public.admins
FOR DELETE
USING (
    user_has_permission(auth.jwt() ->> 'email', 'manage_users') 
    OR is_super_admin(auth.jwt() ->> 'email')
);