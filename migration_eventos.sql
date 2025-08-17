-- MIGRAÇÃO PARA SUPORTE A MÚLTIPLOS EVENTOS
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Criar tabela eventos
CREATE TABLE IF NOT EXISTS eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMPTZ,
    data_fim TIMESTAMPTZ,
    configuracao JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_eventos_slug ON eventos(slug);
CREATE INDEX IF NOT EXISTS idx_eventos_ativo ON eventos(ativo) WHERE ativo = true;

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_eventos_updated_at 
    BEFORE UPDATE ON eventos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Adicionar coluna evento_id na tabela ideias
ALTER TABLE ideias ADD COLUMN IF NOT EXISTS evento_id UUID REFERENCES eventos(id);

-- Criar índice na nova coluna
CREATE INDEX IF NOT EXISTS idx_ideias_evento_id ON ideias(evento_id);

-- Inserir evento padrão
INSERT INTO eventos (nome, slug, descricao, data_inicio, data_fim, ativo, configuracao)
VALUES (
    'iFood Move 2025',
    'ifood-move-2025',
    'Evento de inovação e tecnologia do iFood',
    '2025-01-01 00:00:00+00',
    '2025-12-31 23:59:59+00',
    true,
    '{"permite_votacao": true, "permite_criacao_ideias": true}'
)
ON CONFLICT (slug) DO NOTHING;

-- Migrar todas as ideias existentes para o evento padrão
UPDATE ideias 
SET evento_id = (SELECT id FROM eventos WHERE slug = 'ifood-move-2025')
WHERE evento_id IS NULL;

-- Tornar evento_id obrigatório após migração
ALTER TABLE ideias ALTER COLUMN evento_id SET NOT NULL;

-- Configurar RLS para eventos
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública dos eventos
CREATE POLICY "Eventos são visíveis para todos" ON eventos
    FOR SELECT USING (true);

-- Política para inserção/atualização por usuários autenticados (admin)
CREATE POLICY "Apenas admins podem gerenciar eventos" ON eventos
    FOR ALL USING (auth.role() = 'authenticated');

-- Habilitar realtime para eventos
ALTER PUBLICATION supabase_realtime ADD TABLE eventos;

-- Função para garantir apenas um evento ativo
CREATE OR REPLACE FUNCTION ensure_single_active_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Se estamos ativando um evento, desativar todos os outros
    IF NEW.ativo = true AND (OLD IS NULL OR OLD.ativo = false) THEN
        UPDATE eventos SET ativo = false WHERE id != NEW.id AND ativo = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_active_event
    BEFORE UPDATE ON eventos
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_active_event();