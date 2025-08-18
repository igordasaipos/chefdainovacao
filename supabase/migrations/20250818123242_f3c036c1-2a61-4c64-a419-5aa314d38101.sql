-- Criar política temporária mais permissiva para DELETE em ideias
-- Substituir a política restritiva atual por uma mais permissiva

DROP POLICY IF EXISTS "Apenas usuários com permissão podem deletar ideias" ON ideias;

-- Política temporária que permite DELETE para usuários logados
CREATE POLICY "Permitir DELETE em ideias para desenvolvimento" ON ideias
    FOR DELETE 
    USING (true);

-- Comentário sobre a mudança
COMMENT ON POLICY "Permitir DELETE em ideias para desenvolvimento" ON ideias IS 
'Política temporária para permitir DELETE enquanto o sistema de autenticação não está totalmente implementado';