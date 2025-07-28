
import { useState, useEffect } from 'react';
import { useIdeiasVotacao } from '@/hooks/useIdeias';
import { IdeaCard } from '@/components/IdeaCard';
import { VoteModal } from '@/components/VoteModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Ideia } from '@/hooks/useIdeias';
import { Navbar } from '@/components/Navbar';

const Votar = () => {
  const { data: ideias, refetch } = useIdeiasVotacao();
  const [selectedIdeia, setSelectedIdeia] = useState<Ideia | null>(null);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

  // Real-time subscription for voting updates
  useEffect(() => {
    const channel = supabase
      .channel('voting-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideias' },
        () => refetch()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votos' },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleVote = (ideia: Ideia) => {
    setSelectedIdeia(ideia);
    setIsVoteModalOpen(true);
  };

  // Sort ideas by votes (descending) for ranking
  const sortedIdeias = ideias ? [...ideias].sort((a, b) => b.votos - a.votos) : [];
  const totalVotos = ideias?.reduce((sum, ideia) => sum + ideia.votos, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-vote-bg to-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6 px-2">
            Vote nas melhores funcionalidades para o Saipos PDV e acompanhe o ranking em tempo real
          </p>
          
          {/* Stats - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto sm:max-w-none sm:flex sm:justify-center sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 sm:p-0 bg-background/50 rounded-lg sm:bg-transparent">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm sm:text-base">{ideias?.length || 0} funcionalidades</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-3 sm:p-0 bg-background/50 rounded-lg sm:bg-transparent">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm sm:text-base">{totalVotos} votos</span>
            </div>
          </div>
        </div>

        {/* Ranking Header */}
        {sortedIdeias && sortedIdeias.length > 0 && (
          <Card className="mb-6 sm:mb-8 bg-primary/5 border-primary/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                Ranking das Funcionalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-xs sm:text-sm text-muted-foreground">
                Ranking atualizado em tempo real • Clique em "Votar" para participar
              </div>
            </CardContent>
          </Card>
        )}

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
                showPosition={true}
                hasVoted={false} // TODO: implementar lógica para verificar se já votou
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8 sm:py-12">
            <CardContent>
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
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
          onOpenChange={setIsVoteModalOpen}
          ideia={selectedIdeia}
        />
      </div>
    </div>
  );
};

export default Votar;
