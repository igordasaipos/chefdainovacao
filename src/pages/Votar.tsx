import { useState, useEffect, useMemo } from "react";
import { useIdeias } from "@/hooks/useIdeias";
import { useVotos } from "@/hooks/useVotos";
import { IdeaCard } from "@/components/IdeaCard";
import { Navbar } from "@/components/Navbar";
import { VoteModal } from "@/components/VoteModal";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserPersistence } from "@/hooks/useUserPersistence";
import { useStableSort } from "@/hooks/useStableSort";
import { Layers, Heart, Lightbulb } from "lucide-react";

export default function Votar() {
  const { data: ideias = [], refetch } = useIdeias();
  const { data: votos = [] } = useVotos();
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'mais-votadas' | 'recentes'>('mais-votadas');
  const [recentlyVotedIds, setRecentlyVotedIds] = useState<string[]>([]);
  const [votingIds, setVotingIds] = useState<string[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  const { userData } = useUserPersistence();
  const { stableSortedIdeias, updateSortSnapshot } = useStableSort(ideias, filterType);

  useEffect(() => {
    const channel = supabase
      .channel('ideias-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideias' }, 
        (payload) => {
          console.log('Mudança nas ideias:', payload);
          refetch();
          // Only update sort when new ideas are added/removed, not for vote updates
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            updateSortSnapshot();
          }
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votos' }, 
        (payload) => {
          console.log('Mudança nos votos:', payload);
          refetch(); // This will update vote counts without reordering
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, updateSortSnapshot]);

  // Função para verificar se o usuário já votou em uma ideia
  const hasUserVoted = (ideiaId: string) => {
    if (!userData.whatsappVotante) return false;
    return votos.some(voto => 
      voto.ideia_id === ideiaId && 
      voto.whatsapp_votante === userData.whatsappVotante
    );
  };

  const handleVote = (idea: any) => {
    // Verificar se já votou
    if (hasUserVoted(idea.id)) {
      return; // Não permite votar novamente
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-vote-bg to-background">
      <Navbar />
      
      {/* Banner Section with Communication Image */}
      <div className="bg-white py-4 sm:py-8 mb-6 sm:mb-8 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto relative">
            <img 
              src="/lovable-uploads/chefedainovacao.webp"
              alt="Chef da Inovação - Você faz o pedido, a gente desenvolve a solução"
              className="w-full h-auto rounded-lg shadow-sm"
              loading="eager"
              decoding="async"
            />
            
            {/* Fixed Vertical Help Button */}
            <Button
              onClick={() => setIsHelpModalOpen(true)}
              className="fixed right-0 top-1/2 -translate-y-1/2 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform py-4 px-3 rounded-l-lg rounded-r-none z-50"
              style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}
            >
              <Lightbulb className="h-4 w-4 mb-2" />
              <span className="text-sm font-medium">Como sugerir uma ideia?</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter and Stats Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-8 max-w-4xl mx-auto">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={(value: 'mais-votadas' | 'recentes') => setFilterType(value)}>
              <SelectTrigger className="w-full sm:w-[200px] min-h-[44px]" data-qa="votar-filter-select">
                <SelectValue placeholder="Filtrar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mais-votadas" data-qa="votar-filter-mais-votadas">Ideias mais votadas</SelectItem>
                <SelectItem value="recentes" data-qa="votar-filter-recentes">Mais recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats - Mobile optimized */}
          <div className="flex items-center justify-center sm:justify-end gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-primary">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold text-sm sm:text-base">{totalIdeias} funcionalidades</span>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold text-sm sm:text-base">{totalVotos} votos</span>
            </div>
          </div>
        </div>

        {/* Ideas List - Single Column Centered */}
        {stableSortedIdeias && stableSortedIdeias.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {stableSortedIdeias.map((idea, index) => (
              <IdeaCard
                key={idea.id}
                ideia={idea}
                position={index + 1}
                onVote={() => handleVote(idea)}
                showVoteButton={true}
                showPosition={filterType === 'mais-votadas'}
                hasVotedRecently={recentlyVotedIds.includes(idea.id)}
                isVoting={votingIds.includes(idea.id)}
                hasVoted={hasUserVoted(idea.id)}
                data-qa={`votar-card-${idea.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 max-w-4xl mx-auto">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <span className="text-4xl">💡</span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhuma funcionalidade disponível</h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                No momento não há funcionalidades disponíveis para votação.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 text-xs sm:text-sm text-muted-foreground space-y-2 px-4">
          <p>iFood Move 2025 - Saipos Chefe da Inovação</p>
          <p>
            Cada número de telefone pode votar uma vez por funcionalidade
          </p>
        </div>
      </div>

      <VoteModal
        open={isVoteModalOpen}
        onOpenChange={handleModalClose}
        ideia={selectedIdea}
        onVoteStart={handleVoteStart}
        onVoteSuccess={handleVoteSuccess}
        persistUserData={true}
      />

      {/* Help Modal */}
      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold text-primary">
              💡 Como sugerir uma nova ideia?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-center mb-6">
              Siga estes passos simples para contribuir com suas sugestões:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <p className="text-sm">
                  Vá até o stand da Saipos no iFood Move
                </p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <p className="text-sm">
                  Fale com um dos nossos especialistas sobre sua necessidade
                </p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <p className="text-sm">
                  Dê sua sugestão de melhoria para nossos produtos
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg mt-6">
              <p className="text-sm font-medium text-primary text-center">
                🚀 As ideias mais votadas pelo público irão para desenvolvimento e entregue em tempo real!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}