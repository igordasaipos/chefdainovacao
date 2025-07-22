import { useEffect } from 'react';
import { useIdeias } from '@/hooks/useIdeias';
import { IdeaCard } from '@/components/IdeaCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vote, Code, CheckCircle, BarChart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';

const Kanban = () => {
  const { data: ideias, refetch } = useIdeias();

  // Real-time subscription for kanban updates
  useEffect(() => {
    const channel = supabase
      .channel('kanban-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'ideias' },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const ideiasVotacao = ideias?.filter(ideia => ideia.status === 'votacao') || [];
  const ideiasDesenvolvimento = ideias?.filter(ideia => ideia.status === 'desenvolvimento') || [];
  const ideiasFinalizada = ideias?.filter(ideia => ideia.status === 'finalizado') || [];

  const KanbanColumn = ({ 
    title, 
    icon: Icon, 
    items, 
    bgColor, 
    count 
  }: { 
    title: string; 
    icon: any; 
    items: any[]; 
    bgColor: string; 
    count: number;
  }) => (
    <div className="flex-1 min-w-0">
      <Card className={`h-full ${bgColor}`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <span className="text-lg">{title}</span>
            </div>
            <Badge variant="secondary" className="ml-2">
              {count}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          {items.length > 0 ? (
            items.map((ideia) => (
              <IdeaCard
                key={ideia.id}
                ideia={ideia}
                showVoteButton={false}
                showPosition={false}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma funcionalidade nesta etapa</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-kanban-bg">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-lg text-muted-foreground">
            Acompanhe o status de desenvolvimento das funcionalidades Saipos
          </p>

          {/* Overview Stats */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              <span className="font-semibold">{ideias?.length || 0} funcionalidades totais</span>
            </div>
            <div className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">{ideiasVotacao.length} em votação</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-orange-600" />
              <span className="font-semibold">{ideiasDesenvolvimento.length} em desenvolvimento</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold">{ideiasFinalizada.length} finalizadas</span>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
          <KanbanColumn
            title="Em Votação"
            icon={Vote}
            items={ideiasVotacao.sort((a, b) => b.votos - a.votos)}
            bgColor="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
            count={ideiasVotacao.length}
          />

          <KanbanColumn
            title="Em Desenvolvimento"
            icon={Code}
            items={ideiasDesenvolvimento.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())}
            bgColor="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
            count={ideiasDesenvolvimento.length}
          />

          <KanbanColumn
            title="Finalizadas"
            icon={CheckCircle}
            items={ideiasFinalizada.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())}
            bgColor="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
            count={ideiasFinalizada.length}
          />
        </div>

        {/* Info Footer */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-sm text-muted-foreground">
            Atualizações em tempo real • Saipos Innovation Week 2025
          </p>
          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <span>🔵 Votação da equipe aberta</span>
            <span>🟠 Desenvolvimento ativo</span>
            <span>🟢 Implementação concluída</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kanban;
