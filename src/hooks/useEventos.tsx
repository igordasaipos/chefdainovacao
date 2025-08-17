import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Evento {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  configuracao: Record<string, any>;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useEventos = () => {
  return useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      // Using dynamic query since eventos table doesn't exist in types yet
      const { data, error } = await supabase
        .from('eventos' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as any) as Evento[];
    },
  });
};

export const useEventoAtivo = () => {
  return useQuery({
    queryKey: ['evento-ativo'],
    queryFn: async () => {
      // Using dynamic query since eventos table doesn't exist in types yet
      const { data, error } = await supabase
        .from('eventos' as any)
        .select('*')
        .eq('ativo', true)
        .maybeSingle();
      
      if (error) throw error;
      return (data as any) as Evento | null;
    },
  });
};

export const useCreateEvento = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => {
      // Using dynamic query since eventos table doesn't exist in types yet
      const { data, error } = await supabase
        .from('eventos' as any)
        .insert([evento])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento-ativo'] });
      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar evento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateEvento = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Evento> }) => {
      // Using dynamic query since eventos table doesn't exist in types yet
      const { data, error } = await supabase
        .from('eventos' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento-ativo'] });
      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar evento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteEvento = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar se há ideias associadas ao evento (temporariamente desabilitado)
      // const { data: ideias, error: ideiasError } = await supabase
      //   .from('ideias')
      //   .select('id')
      //   .eq('evento_id', id)
      //   .limit(1);
      
      // if (ideiasError) throw ideiasError;
      
      // if (ideias && ideias.length > 0) {
      //   throw new Error('Não é possível excluir um evento que possui ideias associadas');
      // }
      
      // Using dynamic query since eventos table doesn't exist in types yet
      const { error } = await supabase
        .from('eventos' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento-ativo'] });
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir evento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};