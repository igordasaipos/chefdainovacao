
-- Remover as políticas atuais que requerem autenticação
DROP POLICY IF EXISTS "Authenticated users can insert ideias" ON public.ideias;
DROP POLICY IF EXISTS "Authenticated users can update ideias" ON public.ideias;
DROP POLICY IF EXISTS "Authenticated users can delete ideias" ON public.ideias;

-- Criar novas políticas que permitem operações públicas
CREATE POLICY "Anyone can insert ideias" ON public.ideias
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update ideias" ON public.ideias
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete ideias" ON public.ideias
  FOR DELETE USING (true);
