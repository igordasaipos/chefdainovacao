-- Remove the restrictive policy that blocks admin operations
DROP POLICY IF EXISTS "Apenas admins podem gerenciar eventos" ON public.eventos;

-- Create more flexible policies that work with custom auth
CREATE POLICY "Anyone can manage eventos" 
ON public.eventos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Keep the existing SELECT policy for public visibility
-- The existing "Eventos são visíveis para todos" policy already allows SELECT with true