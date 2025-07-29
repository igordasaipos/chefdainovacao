-- Drop the existing status constraint
ALTER TABLE public.ideias DROP CONSTRAINT IF EXISTS ideias_status_check;

-- Add new constraint that includes 'backlog'
ALTER TABLE public.ideias 
ADD CONSTRAINT ideias_status_check 
CHECK (status IN ('caixinha', 'votacao', 'desenvolvimento', 'finalizado', 'backlog'));