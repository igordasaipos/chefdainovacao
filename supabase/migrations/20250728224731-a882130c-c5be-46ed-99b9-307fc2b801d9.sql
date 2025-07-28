-- Alterar a tabela admins para usar 'nome' ao invés de 'email'
ALTER TABLE public.admins 
RENAME COLUMN email TO nome;

-- Alterar o tipo do campo para text se necessário (já é text, mas garantindo)
ALTER TABLE public.admins 
ALTER COLUMN nome TYPE text;