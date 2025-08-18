import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { sendIdeiaToZapier } from '@/lib/zapier';
import { useEventoContext } from '@/contexts/EventoContext';

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
  evento_id: string;
}

export const useIdeias = (eventoId?: string) => {
  const { eventoAtivo } = useEventoContext();
  const targetEventoId = eventoId || eventoAtivo?.id;

  return useQuery({
    queryKey: ['ideias', targetEventoId],
    queryFn: async () => {
      let query = supabase
        .from('ideias')
        .select('*');
      
      if (targetEventoId) {
        query = query.eq('evento_id', targetEventoId);
      }
      
      const { data, error } = await query.order('criado_em', { ascending: false });
      
      if (error) throw error;
      return data as Ideia[];
    },
  });
};

export const useIdeiasVotacao = (eventoId?: string) => {
  const { eventoAtivo } = useEventoContext();
  const targetEventoId = eventoId || eventoAtivo?.id;

  return useQuery({
    queryKey: ['ideias-votacao', targetEventoId],
    queryFn: async () => {
      let query = supabase
        .from('ideias')
        .select('*')
        .eq('status', 'votacao');
      
      if (targetEventoId) {
        query = query.eq('evento_id', targetEventoId);
      }
      
      const { data, error } = await query.order('votos', { ascending: false });
      
      if (error) throw error;
      return data as Ideia[];
    },
  });
};

export const useCreateIdeia = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { eventoAtivo } = useEventoContext();

  return useMutation({
    mutationFn: async (ideia: Omit<Ideia, 'id' | 'criado_em' | 'votos' | 'evento_id'>) => {
      if (!eventoAtivo?.id) {
        throw new Error('Nenhum evento ativo encontrado');
      }

      const { data, error } = await supabase
        .from('ideias')
        .insert([{
          ...ideia,
          evento_id: eventoAtivo.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ideias'] });
      queryClient.invalidateQueries({ queryKey: ['ideias-votacao'] });
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
      console.log(`[DELETE] Tentando excluir ideia com ID: ${id}`);
      
      const { data, error, count } = await supabase
        .from('ideias')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('[DELETE] Erro do Supabase:', error);
        throw error;
      }
      
      console.log('[DELETE] Resultado:', { data, count });
      
      if (!data) {
        console.warn('[DELETE] Nenhuma linha foi afetada - possível problema de permissão');
        throw new Error('Não foi possível excluir a ideia. Verifique suas permissões.');
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('[DELETE] Sucesso - Ideia excluída:', data.id);
      queryClient.invalidateQueries({ queryKey: ['ideias'] });
      toast({
        title: "Ideia excluída",
        description: "A ideia foi excluída com sucesso!",
      });
    },
    onError: (error) => {
      console.error('[DELETE] Erro na mutation:', error);
      toast({
        title: "Erro ao excluir ideia",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useTotaisGerais = (eventoId?: string) => {
  const { eventoAtivo } = useEventoContext();
  const targetEventoId = eventoId || eventoAtivo?.id;

  return useQuery({
    queryKey: ['totais-gerais', targetEventoId],
    queryFn: async () => {
      let query = supabase
        .from('ideias')
        .select('votos');
      
      if (targetEventoId) {
        query = query.eq('evento_id', targetEventoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const totalIdeias = data?.length || 0;
      const totalVotos = data?.reduce((sum, ideia) => sum + (ideia.votos || 0), 0) || 0;
      
      return {
        totalIdeias,
        totalVotos
      };
    },
  });
};

export const useTotaisPorStatus = (eventoId?: string) => {
  const { eventoAtivo } = useEventoContext();
  const targetEventoId = eventoId || eventoAtivo?.id;

  return useQuery({
    queryKey: ['totais-por-status', targetEventoId],
    queryFn: async () => {
      let query = supabase
        .from('ideias')
        .select('status, votos');
      
      if (targetEventoId) {
        query = query.eq('evento_id', targetEventoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const totalIdeias = data?.length || 0;
      const totalVotos = data?.reduce((sum, ideia) => sum + (ideia.votos || 0), 0) || 0;
      const finalizadas = data?.filter(ideia => ideia.status === 'finalizado').length || 0;
      const desenvolvimento = data?.filter(ideia => ideia.status === 'desenvolvimento').length || 0;
      
      return {
        totalIdeias,
        totalVotos,
        finalizadas,
        desenvolvimento
      };
    },
  });
};