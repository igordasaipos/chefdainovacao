
import { useState, useEffect, useMemo } from 'react';
import { useIdeiasVotacao } from '@/hooks/useIdeias';
import { useVotos } from '@/hooks/useVotos';
import { IdeaCard } from '@/components/IdeaCard';
import { VoteModal } from '@/components/VoteModal';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Ideia } from '@/hooks/useIdeias';
import { Navbar } from '@/components/Navbar';

const Votar = () => {
  const { data: ideias, refetch } = useIdeiasVotacao();
  const [selectedIdeia, setSelectedIdeia] = useState<Ideia | null>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('mais-votadas');

  // Dynamic sorting based on filter type
  const sortedIdeias = useMemo(() => {
    if (!ideias) return [];
    
    const ideiasClone = [...ideias];
    
    switch (filterType) {
      case 'mais-votadas':
        return ideiasClone.sort((a, b) => b.votos - a.votos);
      case 'recentes':
        return ideiasClone.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
      case 'alfabetica':
        return ideiasClone.sort((a, b) => a.titulo.localeCompare(b.titulo));
      default:
        return ideiasClone.sort((a, b) => b.votos - a.votos);
    }
  }, [ideias, filterType]);

  // Get all votes for real-time updates
  const { refetch: refetchVotes } = useVotos();

  // Real-time subscription for voting updates
  useEffect(() => {
    const channel = supabase
      .channel('voting-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideias' },
        () => {
          refetch();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votos' },
        () => {
          refetch();
          refetchVotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch, refetchVotes]);

  const handleVote = (ideia: Ideia) => {
    setSelectedIdeia(ideia);
    setIsVoteModalOpen(true);
  };

  const handleModalClose = (isOpen: boolean) => {
    setIsVoteModalOpen(isOpen);
    if (!isOpen) {
      // Force refresh of data when modal closes
      refetch();
      refetchVotes();
    }
  };

  const totalVotos = ideias?.reduce((sum, ideia) => sum + ideia.votos, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vote-bg to-background">
      <Navbar />
      
      {/* Banner Section with Communication Image */}
      <div className="bg-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <img 
              src="/lovable-uploads/698aaa8a-b352-44a5-90d4-c41dae8987bb.png"
              alt="A Great Place to Work - Certificada"
              className="w-full h-auto rounded-lg shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter and Stats Section */}
        <div className="flex justify-between items-center gap-4 mb-8 max-w-4xl mx-auto">
          {/* Left side - Filter */}
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mais-votadas">Ideias mais votadas</SelectItem>
                <SelectItem value="recentes">Mais recentes</SelectItem>
                <SelectItem value="alfabetica">Ordem alfabética</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Right side - Counters */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-blue-600">
              <Layers className="h-5 w-5" />
              <span className="font-semibold">{ideias?.length || 0} funcionalidades</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Heart className="h-5 w-5" />
              <span className="font-semibold">{totalVotos} votos</span>
            </div>
          </div>
        </div>

        {/* Ideas Grid - Single Column */}
        {sortedIdeias && sortedIdeias.length > 0 ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {sortedIdeias.map((ideia, index) => (
              <IdeaCard
                key={ideia.id}
                ideia={ideia}
                position={index + 1}
                onVote={() => handleVote(ideia)}
                showVoteButton={true}
                showPosition={filterType === 'mais-votadas'}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8 sm:py-12">
            <CardContent>
              <Layers className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhuma funcionalidade disponível</h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                No momento não há funcionalidades disponíveis para votação.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12 text-xs sm:text-sm text-muted-foreground space-y-2 px-4">
          <p>iFood Move 2025 - Sistema Saipos de Votação</p>
          <p>
            Cada número de telefone pode votar uma vez por funcionalidade
          </p>
        </div>

        {/* Vote Modal */}
        <VoteModal
          open={isVoteModalOpen}
          onOpenChange={handleModalClose}
          ideia={selectedIdeia}
        />
      </div>
    </div>
  );
};

export default Votar;
