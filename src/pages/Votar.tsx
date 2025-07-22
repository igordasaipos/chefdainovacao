
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
        <div className="text-center mb-8">
          <p className="text-lg text-muted-foreground mb-6">
            Vote nas melhores funcionalidades para o Saipos PDV e acompanhe o ranking em tempo real
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">{ideias?.length || 0} funcionalidades</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold">{totalVotos} votos</span>
            </div>
          </div>
        </div>

        {/* Ranking Header */}
        {sortedIdeias && sortedIdeias.length > 0 && (
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Ranking das Funcionalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-muted-foreground">
                Ranking atualizado em tempo real • Clique em "Votar" para participar
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ideas Grid */}
        {sortedIdeias && sortedIdeias.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedIdeias.map((ideia, index) => (
              <IdeaCard
                key={ideia.id}
                ideia={ideia}
                position={index + 1}
                onVote={() => handleVote(ideia)}
                showVoteButton={true}
                showPosition={true}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma funcionalidade disponível</h3>
              <p className="text-muted-foreground">
                No momento não há funcionalidades disponíveis para votação.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>iFood Move 2024 - Sistema Saipos de Votação</p>
          <p className="mt-2">
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
