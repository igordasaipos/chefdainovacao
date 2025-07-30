import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Voto {
  id: string;
  ideia_id: string;
  telefone_votante: string;
  nome_restaurante_votante: string;
  whatsapp_votante: string;
  nome_votante: string;
  eh_cliente: boolean;
  created_at: string;
}

export const useVotos = (ideiaId?: string) => {
  return useQuery({
    queryKey: ['votos', ideiaId],
    queryFn: async () => {
      let query = supabase.from('votos').select('*');
      
      if (ideiaId) {
        query = query.eq('ideia_id', ideiaId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Voto[];
    },
  });
};

// Hook para verificar se o usuário já votou em uma ideia específica
export const useHasVoted = (ideiaId: string, whatsappVotante?: string) => {
  return useQuery({
    queryKey: ['hasVoted', ideiaId, whatsappVotante],
    queryFn: async () => {
      if (!whatsappVotante) return false;
      
      const { data, error } = await supabase
        .from('votos')
        .select('id')
        .eq('ideia_id', ideiaId)
        .eq('whatsapp_votante', whatsappVotante)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!whatsappVotante,
  });
};

export const useCreateVoto = (onReset?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (voto: Omit<Voto, 'id' | 'created_at'>) => {
      // Primeiro insere o voto
      const { data: votoData, error: votoError } = await supabase
        .from('votos')
        .insert([voto])
        .select()
        .single();
      
      if (votoError) throw votoError;
      
      // Atualiza o contador de votos na ideia
      const { data: ideiaData } = await supabase
        .from('ideias')
        .select('votos')
        .eq('id', voto.ideia_id)
        .single();
      
      if (ideiaData) {
        await supabase
          .from('ideias')
          .update({ votos: ideiaData.votos + 1 })
          .eq('id', voto.ideia_id);
      }
      
      return votoData;
    },
    onSuccess: () => {
      // Invalidate all vote-related queries
      queryClient.invalidateQueries({ queryKey: ['votos'] });
      queryClient.invalidateQueries({ queryKey: ['votos', undefined] });
      queryClient.invalidateQueries({ queryKey: ['hasVoted'] });
      queryClient.invalidateQueries({ queryKey: ['ideias'] });
      queryClient.invalidateQueries({ queryKey: ['ideias-votacao'] });
      
      // Force refetch of all votes
      queryClient.refetchQueries({ queryKey: ['votos'] });
      
      toast({
        title: "Voto registrado",
        description: "Seu voto foi registrado com sucesso!",
      });
      
      // Reset form after successful vote
      onReset?.();
    },
    onError: (error: any) => {
      console.error('Erro ao votar:', error);
      
      if (error.message?.includes('duplicate') || 
          error.message?.includes('unique') || 
          error.code === '23505') {
        toast({
          title: "Voto já registrado",
          description: "Você já votou nesta ideia!",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao votar",
          description: error.message || "Ocorreu um erro inesperado",
          variant: "destructive",
        });
      }
      
      // Reset form after error
      onReset?.();
    },
  });
};