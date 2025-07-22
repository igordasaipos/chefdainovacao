
-- Remover a constraint atual que está causando o erro
ALTER TABLE public.ideias DROP CONSTRAINT IF EXISTS ideias_status_check;

-- Criar nova constraint com todos os status corretos
ALTER TABLE public.ideias ADD CONSTRAINT ideias_status_check 
  CHECK (status IN ('avaliar', 'caixinha', 'votacao', 'desenvolvimento', 'finalizado'));
