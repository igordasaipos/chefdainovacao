import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

export const useIdeias = () => {
  return useQuery({
    queryKey: ['ideias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideias')
        .select('*')
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
        .select('*')
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideias'] });
      toast({
        title: "Ideia criada",
        description: "A ideia foi criada com sucesso!",
      });
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