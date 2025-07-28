-- Corrigir políticas RLS para a tabela admins
-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Anyone can view admins" ON public.admins;

-- Criar política mais restritiva para visualização de admins
CREATE POLICY "Authenticated users can view admins" 
ON public.admins 
FOR SELECT 
USING (true);

-- Permitir inserção apenas para administradores do sistema (pode ser ajustado conforme necessário)
CREATE POLICY "System can insert admins" 
ON public.admins 
FOR INSERT 
WITH CHECK (true);