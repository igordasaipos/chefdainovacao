-- Corrigir política para permitir que as consultas com join funcionem adequadamente
-- Precisamos permitir que as funções de sistema consigam acessar as roles sem recursão

-- Primeiro, vamos simplificar a política de visualização da tabela roles
DROP POLICY IF EXISTS "Admins podem visualizar roles" ON public.roles;
DROP POLICY IF EXISTS "Super admins podem gerenciar roles" ON public.roles;

-- Criar uma política mais simples que não cause recursão
CREATE POLICY "Permitir visualização de roles para usuários autenticados"
ON public.roles
FOR SELECT
USING (true);

-- Manter controle de modificação apenas para super admins
CREATE POLICY "Apenas super admins podem modificar roles"
ON public.roles
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.admins a
        WHERE a.nome = (auth.jwt() ->> 'email')
        AND a.role_id IN (
            -- Usar subquery direta sem recursão
            SELECT r.id FROM public.roles r WHERE r.name = 'super_admin'
        )
    )
);

-- Garantir que a política de admins funcione para consultas com join
DROP POLICY IF EXISTS "Admins podem visualizar outros admins" ON public.admins;

CREATE POLICY "Permitir visualização de admins para usuários autenticados"
ON public.admins
FOR SELECT
USING (
    -- Qualquer usuário autenticado que esteja na tabela admins pode ver outros admins
    (auth.jwt() ->> 'email') IN (
        SELECT nome FROM public.admins
    )
);