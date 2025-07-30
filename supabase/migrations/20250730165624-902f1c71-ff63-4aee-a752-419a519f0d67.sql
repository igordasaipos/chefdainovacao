-- Adiciona a coluna nome_votante na tabela votos
ALTER TABLE public.votos 
ADD COLUMN nome_votante text NOT NULL DEFAULT '';

-- Atualiza registros existentes para ter um valor padrão
UPDATE public.votos 
SET nome_votante = 'Nome não informado' 
WHERE nome_votante = '';