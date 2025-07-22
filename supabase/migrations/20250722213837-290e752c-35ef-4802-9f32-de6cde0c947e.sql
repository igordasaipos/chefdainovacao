
-- Primeiro, atualizar todos os registros com status 'finalizada' para 'finalizado'
UPDATE public.ideias 
SET status = 'finalizado' 
WHERE status = 'finalizada';

-- Remover completamente a constraint atual (forçar remoção)
ALTER TABLE public.ideias DROP CONSTRAINT ideias_status_check;

-- Criar nova constraint com todos os status corretos
ALTER TABLE public.ideias ADD CONSTRAINT ideias_status_check 
  CHECK (status IN ('avaliar', 'caixinha', 'votacao', 'desenvolvimento', 'finalizado'));
