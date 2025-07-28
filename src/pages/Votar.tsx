
import { useState, useEffect } from 'react';
import { useIdeiasVotacao } from '@/hooks/useIdeias';
import { IdeaCard } from '@/components/IdeaCard';
import { VoteModal } from '@/components/VoteModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Users, Heart, ChevronDown } from 'lucide-react';
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
      
      {/* Banner Section - Placeholder for communication image */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 mb-8">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/10 rounded-lg p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Trophy className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-bold">A GREAT PLACE TO WORK</h1>
              <div className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                Certificada
              </div>
            </div>
            <p className="text-blue-100">
              Espaço para imagem de comunicação
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter and Stats Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          {/* Left side - Filter */}
          <div className="flex items-center gap-2">
            <Select defaultValue="mais-votadas">
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
              <Users className="h-5 w-5" />
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
