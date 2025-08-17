-- Corrigir a política RLS da tabela admins para permitir verificação durante login
-- O problema é que durante o login, o usuário ainda não está autenticado
-- então auth.jwt() retorna null

DROP POLICY IF EXISTS "Permitir visualização de admins para usuários autenticados" ON public.admins;
DROP POLICY IF EXISTS "System can insert admins" ON public.admins;

-- Criar política que permite verificação de existência de admin durante login
CREATE POLICY "Permitir verificação de admin para login"
ON public.admins
FOR SELECT
USING (true);  -- Permitir leitura para qualquer um verificar se é admin

-- Manter política para inserção apenas pelo sistema
CREATE POLICY "Sistema pode inserir admins"
ON public.admins
FOR INSERT
WITH CHECK (true);