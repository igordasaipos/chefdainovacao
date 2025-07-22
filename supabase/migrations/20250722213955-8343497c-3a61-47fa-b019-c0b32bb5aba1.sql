-- Remover a constraint atual
ALTER TABLE public.ideias DROP CONSTRAINT ideias_status_check;

-- Criar nova constraint sem o status 'avaliar'
ALTER TABLE public.ideias ADD CONSTRAINT ideias_status_check 
  CHECK (status IN ('caixinha', 'votacao', 'desenvolvimento', 'finalizado'));