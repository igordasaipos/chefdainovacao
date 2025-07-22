-- Remover a política atual que requer autenticação
DROP POLICY IF EXISTS "Authenticated users can view admins" ON public.admins;

-- Criar nova política que permite leitura pública da tabela admins
CREATE POLICY "Anyone can view admins" ON public.admins
  FOR SELECT USING (true);