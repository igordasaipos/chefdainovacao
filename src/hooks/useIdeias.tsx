import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendIdeiaToZapier } from '@/lib/zapier';

export interface Ideia {
  id: string;
  titulo: string;
  descricao: string | null;
  complexidade: '1h30' | '3h' | '1turno' | 'complexa';
  status: 'caixinha' | 'votacao' | 'desenvolvimento' | 'finalizado' | 'backlog';
  votos: number;
  criado_em: string;
  criado_por: string;
  desenvolvedor: string | null;
  nome_restaurante: string | null;
  whatsapp_criador: string | null;
  observacao: string | null;
  tipo_cliente: 'cliente' | 'nao_cliente' | null;
  nome_cliente: string | null;
  admin_criador: string | null;
  jira: string | null;
}

export const useIdeias = () => {
  return useQuery({
    queryKey: ['ideias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideias')
        .select('id, titulo, descricao, complexidade, status, votos, criado_em, criado_por, desenvolvedor, nome_restaurante, whatsapp_criador, observacao, tipo_cliente, nome_cliente, jira, admin_criador')
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      return data as Ideia[];
    },
  });
};

export const useIdeiasVotacao = () => {
  return useQuery({
    queryKey: ['ideias-votacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideias')
        .select('id, titulo, descricao, complexidade, status, votos, criado_em, criado_por, desenvolvedor, nome_restaurante, whatsapp_criador, observacao, tipo_cliente, nome_cliente, jira, admin_criador')
        .eq('status', 'votacao')
        .order('votos', { ascending: false });
      
      if (error) throw error;
      return data as Ideia[];
    },
  });
};

export const useCreateIdeia = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ideia: Omit<Ideia, 'id' | 'criado_em' | 'votos'>) => {
      const { data, error } = await supabase
        .from('ideias')
        .insert([ideia])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ideias'] });
      toast({
        title: "Ideia criada",
        description: "A ideia foi criada com sucesso!",
      });
      
      // Enviar para Zapier quando nova ideia é criada
      sendIdeiaToZapier(data);
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar ideia",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateIdeia = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Ideia> }) => {
      const { data, error } = await supabase
        .from('ideias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideias'] });
      queryClient.invalidateQueries({ queryKey: ['ideias-votacao'] });
      toast({
        title: "Ideia atualizada",
        description: "A ideia foi atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar ideia",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteIdeia = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ideias')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideias'] });
      toast({
        title: "Ideia excluída",
        description: "A ideia foi excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir ideia",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useTotaisGerais = () => {
  return useQuery({
    queryKey: ['totais-gerais'],
    queryFn: async () => {
      // Buscar todas as ideias
      const { data: todasIdeias, error: ideiasError } = await supabase
        .from('ideias')
        .select('id, votos');
      
      if (ideiasError) throw ideiasError;
      
      // Buscar todos os votos
      const { data: todosVotos, error: votosError } = await supabase
        .from('votos')
        .select('id');
      
      if (votosError) throw votosError;
      
      return {
        totalIdeias: todasIdeias?.length || 0,
        totalVotos: todosVotos?.length || 0
      };
    },
  });
};

export const useTotaisPorStatus = () => {
  return useQuery({
    queryKey: ['totais-por-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideias')
        .select('status, votos');
      
      if (error) throw error;
      
      const totais = {
        votacao: 0,
        desenvolvimento: 0,
        finalizado: 0,
        totalVotos: 0
      };
      
      data?.forEach(ideia => {
        totais.totalVotos += ideia.votos;
        if (ideia.status === 'votacao') totais.votacao++;
        if (ideia.status === 'desenvolvimento') totais.desenvolvimento++;
        if (ideia.status === 'finalizado') totais.finalizado++;
      });
      
      return totais;
    },
  });
};