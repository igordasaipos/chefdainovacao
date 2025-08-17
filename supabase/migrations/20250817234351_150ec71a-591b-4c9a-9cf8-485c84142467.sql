-- Criar função security definer para verificar se usuário é super admin
-- Isso evita recursão infinita na política RLS da tabela roles
CREATE OR REPLACE FUNCTION public.is_super_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admins a
        JOIN public.roles r ON a.role_id = r.id
        WHERE a.nome = user_email
        AND r.name = 'super_admin'
    );
$$;

-- Remover política problemática que causa recursão infinita
DROP POLICY IF EXISTS "Apenas super admins podem modificar roles" ON public.roles;

-- Criar nova política usando a função security definer
CREATE POLICY "Apenas super admins podem modificar roles"
ON public.roles
FOR ALL
USING (public.is_super_admin(auth.jwt() ->> 'email'));

-- Garantir que a política de SELECT continue funcionando
DROP POLICY IF EXISTS "Permitir visualização de roles para usuários autenticados" ON public.roles;

CREATE POLICY "Roles são visíveis para todos"
ON public.roles
FOR SELECT
USING (true);