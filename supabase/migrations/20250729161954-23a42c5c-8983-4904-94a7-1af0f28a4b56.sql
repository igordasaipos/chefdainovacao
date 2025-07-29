-- Adicionar novos campos à tabela ideias
ALTER TABLE public.ideias 
ADD COLUMN tipo_cliente text CHECK (tipo_cliente IN ('cliente', 'nao_cliente')),
ADD COLUMN nome_cliente text,
ADD COLUMN admin_criador text,
ADD COLUMN jira text;

-- Migrar dados existentes
-- Assumindo que criado_por atualmente contém o nome do cliente
UPDATE public.ideias 
SET 
  nome_cliente = criado_por,
  tipo_cliente = 'cliente',
  admin_criador = 'admin@sistema.com';

-- Separar observacao e jira dos dados existentes
-- Se observacao contém tanto observação quanto jira separados por algum delimitador
UPDATE public.ideias 
SET jira = CASE 
  WHEN observacao LIKE '%Jira:%' 
  THEN TRIM(SUBSTRING(observacao FROM 'Jira:(.*)'))
  ELSE NULL
END,
observacao = CASE 
  WHEN observacao LIKE '%Jira:%' 
  THEN TRIM(SUBSTRING(observacao FROM '^(.*?)Jira:'))
  ELSE observacao
END
WHERE observacao IS NOT NULL;