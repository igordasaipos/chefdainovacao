
-- Criar tabela para controle de acesso administrativo
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela principal para ideias
CREATE TABLE public.ideias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  complexidade TEXT NOT NULL CHECK (complexidade IN ('1h30', '3h', '1turno', 'complexa')),
  status TEXT NOT NULL DEFAULT 'caixinha' CHECK (status IN ('caixinha', 'votacao', 'desenvolvimento', 'finalizada')),
  votos INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  criado_por TEXT NOT NULL,
  desenvolvedor TEXT,
  nome_restaurante TEXT,
  whatsapp_criador TEXT,
  observacao TEXT
);

-- Criar tabela para controle de votos únicos
CREATE TABLE public.votos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ideia_id UUID NOT NULL REFERENCES public.ideias(id) ON DELETE CASCADE,
  telefone_votante TEXT NOT NULL,
  nome_restaurante_votante TEXT NOT NULL,
  whatsapp_votante TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ideia_id, telefone_votante)
);

-- Habilitar Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admins (apenas usuários autenticados podem ver)
CREATE POLICY "Authenticated users can view admins" ON public.admins
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Políticas RLS para ideias
CREATE POLICY "Anyone can view ideias" ON public.ideias
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert ideias" ON public.ideias
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ideias" ON public.ideias
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete ideias" ON public.ideias
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas RLS para votos
CREATE POLICY "Anyone can view votos" ON public.votos
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert votos" ON public.votos
  FOR INSERT WITH CHECK (true);

-- Habilitar realtime para as tabelas
ALTER TABLE public.ideias REPLICA IDENTITY FULL;
ALTER TABLE public.votos REPLICA IDENTITY FULL;

-- Adicionar tabelas ao realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ideias;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votos;

-- Inserir alguns admins de exemplo (substitua pelos emails reais)
INSERT INTO public.admins (email) VALUES 
  ('admin@ifood.com.br'),
  ('move@ifood.com.br');
