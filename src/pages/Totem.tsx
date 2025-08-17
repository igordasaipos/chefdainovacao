import { useState, useEffect, useMemo } from "react";
import { useIdeiasVotacao, useTotaisGerais } from "@/hooks/useIdeias";
import { useQueryClient } from "@tanstack/react-query";
import { useEventoContext } from "@/contexts/EventoContext";
import { IdeaCard } from "@/components/IdeaCard";
import { Navbar } from "@/components/Navbar";
import { VoteModal } from "@/components/VoteModal";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStableSort } from "@/hooks/useStableSort";
import { Layers, Heart } from "lucide-react";

export default function Totem() {
  const { eventoSelecionado } = useEventoContext();
  const { data: ideias = [], refetch } = useIdeiasVotacao(eventoSelecionado?.id);
  const { data: totais = { totalIdeias: 0, totalVotos: 0 } } = useTotaisGerais(eventoSelecionado?.id);
  const queryClient = useQueryClient();
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'mais-votadas' | 'recentes'>('mais-votadas');
  const [recentlyVotedIds, setRecentlyVotedIds] = useState<string[]>([]);
  const [votingIds, setVotingIds] = useState<string[]>([]);
  const { stableSortedIdeias, updateSortSnapshot } = useStableSort(ideias, filterType);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    
    const debouncedRefetch = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        console.log('Executando refetch após debounce...');
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ['ideias-votacao'] }),
          queryClient.refetchQueries({ queryKey: ['votos'] })
        ]);
      }, 500);
    };

    const channel = supabase
      .channel('ideias-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideias' }, 
        (payload) => {
          console.log('Mudança nas ideias:', payload);
          
          // Force immediate refetch for better reliability
          debouncedRefetch();
          
          // Update sort when new ideas are added/removed or status changes
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE' || 
              (payload.eventType === 'UPDATE' && payload.new?.status === 'votacao')) {
            updateSortSnapshot();
          }
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votos' }, 
        (payload) => {
          console.log('Mudança nos votos:', payload);
          
          // Force immediate refetch for vote updates
          debouncedRefetch();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [queryClient, updateSortSnapshot]);

  const handleVote = (idea: any) => {
    setSelectedIdea(idea);
    setIsVoteModalOpen(true);
  };

  const handleModalClose = () => {
    setIsVoteModalOpen(false);
    setSelectedIdea(null);
    refetch();
  };

  const handleVoteStart = (ideaId: string) => {
    setVotingIds(prev => [...prev, ideaId]);
  };

  const handleVoteSuccess = (ideaId: string) => {
    setVotingIds(prev => prev.filter(id => id !== ideaId));
    setRecentlyVotedIds(prev => [...prev, ideaId]);
    
    setTimeout(() => {
      setRecentlyVotedIds(prev => prev.filter(id => id !== ideaId));
    }, 3000);
  };

  const totalIdeias = ideias?.length || 0;
  const totalVotos = ideias?.reduce((sum, idea) => sum + idea.votos, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      {/* Banner Section */}
      <div className="bg-white border-b">
        <img 
          src="/lovable-uploads/chefedainovacao.webp" 
          alt="Chef da Inovação - Caixinha de Ideias" 
          className="w-full h-auto object-contain max-h-48"
          loading="eager"
          decoding="async"
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros e Estatísticas */}
        <div className="flex flex-col items-center justify-center gap-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Select value={filterType} onValueChange={(value: 'mais-votadas' | 'recentes') => setFilterType(value)}>
              <SelectTrigger className="w-48 h-12 text-base rounded-xl border-2 hover:border-primary/50 transition-all">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mais-votadas">Mais Votadas</SelectItem>
                <SelectItem value="recentes">Mais Recentes</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span className="bg-muted/50 px-3 py-2 rounded-lg flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <strong className="text-foreground">{totais.totalIdeias}</strong> funcionalidades
              </span>
              <span className="bg-muted/50 px-3 py-2 rounded-lg flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <strong className="text-foreground">{totais.totalVotos}</strong> votos totais
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Ideias */}
        {stableSortedIdeias?.length > 0 ? (
          <div className="max-w-4xl mx-auto space-y-4">
            {stableSortedIdeias.map((idea, index) => (
              <IdeaCard
                key={idea.id}
                ideia={idea}
                onVote={() => handleVote(idea)}
                showVoteButton={true}
                showPosition={filterType === 'mais-votadas'}
                position={filterType === 'mais-votadas' ? index + 1 : undefined}
                hasVotedRecently={recentlyVotedIds.includes(idea.id)}
                isVoting={votingIds.includes(idea.id)}
                hasVoted={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <span className="text-4xl">💡</span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">
                Nenhuma ideia encontrada
              </h3>
              <p className="text-muted-foreground text-lg">
                Ainda não há ideias disponíveis para votação.
              </p>
            </div>
          </div>
        )}
      </div>

      <VoteModal
        open={isVoteModalOpen}
        onOpenChange={handleModalClose}
        ideia={selectedIdea}
        onVoteStart={handleVoteStart}
        onVoteSuccess={handleVoteSuccess}
        persistUserData={false}
      />
    </div>
  );
}