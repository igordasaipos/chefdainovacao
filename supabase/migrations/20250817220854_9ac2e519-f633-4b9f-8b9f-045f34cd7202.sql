-- Criar sistema de permissões baseado em roles

-- Criar tabela de roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de permissões
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de relacionamento role_permissions
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- Adicionar role_id na tabela admins
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id);

-- Inserir roles padrão
INSERT INTO public.roles (name, description) VALUES
    ('super_admin', 'Acesso total ao sistema'),
    ('admin', 'Administrador com permissões limitadas'),
    ('editor', 'Pode editar apenas suas próprias ideias'),
    ('viewer', 'Apenas visualização')
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões padrão
INSERT INTO public.permissions (name, description) VALUES
    ('delete_any_idea', 'Deletar qualquer ideia'),
    ('edit_any_idea', 'Editar qualquer ideia'),
    ('create_idea', 'Criar novas ideias'),
    ('edit_own_idea', 'Editar próprias ideias'),
    ('view_ideas', 'Visualizar ideias'),
    ('view_stats', 'Visualizar estatísticas'),
    ('manage_users', 'Gerenciar usuários e permissões'),
    ('manage_events', 'Gerenciar eventos')
ON CONFLICT (name) DO NOTHING;

-- Configurar permissões por role
-- Super Admin - todas as permissões
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin - todas exceto manage_users
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin' AND p.name != 'manage_users'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Editor - criar e editar próprias ideias, visualizar
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'editor' AND p.name IN ('create_idea', 'edit_own_idea', 'view_ideas', 'view_stats')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer - apenas visualizar
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'viewer' AND p.name IN ('view_ideas', 'view_stats')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Atualizar todos os admins existentes para super_admin por padrão
UPDATE public.admins 
SET role_id = (SELECT id FROM public.roles WHERE name = 'super_admin')
WHERE role_id IS NULL;

-- Tornar role_id obrigatório
ALTER TABLE public.admins ALTER COLUMN role_id SET NOT NULL;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas para visualização pública das roles e permissões
CREATE POLICY "Roles são visíveis para todos" ON public.roles
    FOR SELECT USING (true);

CREATE POLICY "Permissões são visíveis para todos" ON public.permissions
    FOR SELECT USING (true);

CREATE POLICY "Role permissions são visíveis para todos" ON public.role_permissions
    FOR SELECT USING (true);

-- Políticas para gerenciamento apenas por super admins
CREATE POLICY "Apenas super admins podem gerenciar roles" ON public.roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins a
            JOIN public.roles r ON a.role_id = r.id
            WHERE a.nome = auth.jwt() ->> 'email'
            AND r.name = 'super_admin'
        )
    );

-- Função para verificar se usuário tem permissão específica
CREATE OR REPLACE FUNCTION public.user_has_permission(user_email TEXT, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admins a
        JOIN public.roles r ON a.role_id = r.id
        JOIN public.role_permissions rp ON r.id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE a.nome = user_email
        AND p.name = permission_name
    );
$$;

-- Função para obter permissões do usuário
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_email TEXT)
RETURNS TABLE (permission_name TEXT)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT p.name
    FROM public.admins a
    JOIN public.roles r ON a.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE a.nome = user_email;
$$;

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(user_email TEXT)
RETURNS TABLE (role_name TEXT, role_description TEXT)
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT r.name, r.description
    FROM public.admins a
    JOIN public.roles r ON a.role_id = r.id
    WHERE a.nome = user_email;
$$;

-- Trigger para updated_at nas novas tabelas
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar políticas de ideias para usar permissões
DROP POLICY IF EXISTS "Anyone can delete ideias" ON public.ideias;
CREATE POLICY "Apenas usuários com permissão podem deletar ideias" ON public.ideias
    FOR DELETE USING (
        public.user_has_permission(auth.jwt() ->> 'email', 'delete_any_idea')
        OR (
            public.user_has_permission(auth.jwt() ->> 'email', 'edit_own_idea')
            AND admin_criador = auth.jwt() ->> 'email'
        )
    );

DROP POLICY IF EXISTS "Anyone can update ideias" ON public.ideias;
CREATE POLICY "Apenas usuários com permissão podem editar ideias" ON public.ideias
    FOR UPDATE USING (
        public.user_has_permission(auth.jwt() ->> 'email', 'edit_any_idea')
        OR (
            public.user_has_permission(auth.jwt() ->> 'email', 'edit_own_idea')
            AND admin_criador = auth.jwt() ->> 'email'
        )
    );