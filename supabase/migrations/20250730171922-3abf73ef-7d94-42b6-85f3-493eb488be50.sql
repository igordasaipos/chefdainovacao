-- Remover constraint existente que pode estar causando conflito
DROP CONSTRAINT IF EXISTS votos_ideia_id_telefone_votante_key CASCADE;

-- Adicionar constraint única usando whatsapp_votante em vez de telefone_votante
ALTER TABLE public.votos 
ADD CONSTRAINT votos_ideia_id_whatsapp_votante_unique 
UNIQUE (ideia_id, whatsapp_votante);