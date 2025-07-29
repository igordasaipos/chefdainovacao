-- Atualizar políticas RLS para garantir que os novos campos funcionem corretamente
-- As políticas já existentes permitem todas as operações, então não precisamos mudá-las
-- Apenas vamos confirmar que estão funcionando corretamente

-- Verificar se há algum problema com as políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'ideias';