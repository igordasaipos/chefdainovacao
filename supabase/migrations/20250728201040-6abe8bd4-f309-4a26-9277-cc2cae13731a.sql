-- Adicionar coluna para indicar se o votante é cliente
ALTER TABLE public.votos 
ADD COLUMN eh_cliente BOOLEAN NOT NULL DEFAULT true;

-- Criar índice único para evitar votos duplicados por usuário na mesma ideia
CREATE UNIQUE INDEX idx_votos_unique_user_idea 
ON public.votos (whatsapp_votante, ideia_id);