-- Implementar políticas RLS alternativas que funcionem sem autenticação real
-- Como o sistema usa localStorage em vez de auth real, vamos criar políticas mais permissivas

-- Remover políticas atuais que dependem de auth.email()
DROP POLICY IF EXISTS "Usuários com permissão podem atualizar admins" ON public.admins;
DROP POLICY IF EXISTS "Usuários com permissão podem deletar admins" ON public.admins;

-- Criar políticas temporárias mais permissivas para UPDATE e DELETE
-- Essas políticas permitem operações para qualquer usuário autenticado ou até mesmo não autenticado
CREATE POLICY "Permitir UPDATE em admins para desenvolvimento"
ON public.admins
FOR UPDATE
USING (true);

CREATE POLICY "Permitir DELETE em admins para desenvolvimento"  
ON public.admins
FOR DELETE
USING (true);

-- Nota: Essas políticas são temporárias e devem ser substituídas 
-- quando implementarmos autenticação real do Supabase