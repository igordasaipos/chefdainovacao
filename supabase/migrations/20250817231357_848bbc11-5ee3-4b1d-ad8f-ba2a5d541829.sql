-- Corrigir política RLS da tabela roles que está causando recursão infinita
-- Remover a política problemática atual
DROP POLICY IF EXISTS "Apenas super admins podem gerenciar roles" ON public.roles;

-- Criar nova política sem recursão para visualização de roles
CREATE POLICY "Admins podem visualizar roles"
ON public.roles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM public.admins 
        WHERE nome = (auth.jwt() ->> 'email')
    )
);

-- Criar política separada para gerenciar roles (apenas super admins)
CREATE POLICY "Super admins podem gerenciar roles"
ON public.roles
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.admins a
        WHERE a.nome = (auth.jwt() ->> 'email')
        AND a.role_id = (
            SELECT id FROM public.roles WHERE name = 'super_admin'
        )
    )
);

-- Garantir que a tabela admins tenha uma política adequada para a consulta com join
DROP POLICY IF EXISTS "Authenticated users can view admins" ON public.admins;

CREATE POLICY "Admins podem visualizar outros admins"
ON public.admins
FOR SELECT
USING (
    EXISTS (
        SELECT 1 
        FROM public.admins admin_check
        WHERE admin_check.nome = (auth.jwt() ->> 'email')
    )
);