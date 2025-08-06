-- Criar tabela para inscrições de newsletter
CREATE TABLE public.inscricoes_newsletter (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.inscricoes_newsletter ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública
CREATE POLICY "Anyone can insert newsletter subscriptions" 
ON public.inscricoes_newsletter 
FOR INSERT 
WITH CHECK (true);

-- Política para permitir visualização pública (para admins)
CREATE POLICY "Anyone can view newsletter subscriptions" 
ON public.inscricoes_newsletter 
FOR SELECT 
USING (true);