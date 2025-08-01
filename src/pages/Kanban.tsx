import { useEffect, useState } from 'react';
import { useIdeias } from '@/hooks/useIdeias';
import { IdeaCard } from '@/components/IdeaCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Vote, Code, CheckCircle, BarChart, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { cn } from '@/lib/utils';
const Kanban = () => {
  const {
    data: ideias,
    refetch
  } = useIdeias();
  const [activeTab, setActiveTab] = useState(0);

  // Real-time subscription for kanban updates
  useEffect(() => {
    const channel = supabase.channel('kanban-updates').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ideias'
    }, () => refetch()).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  const ideiasVotacao = ideias?.filter(ideia => ideia.status === 'votacao') || [];
  const ideiasDesenvolvimento = ideias?.filter(ideia => ideia.status === 'desenvolvimento') || [];
  const ideiasFinalizada = ideias?.filter(ideia => ideia.status === 'finalizado') || [];
  const columns = [{
    title: "Votação",
    icon: Vote,
    items: ideiasVotacao.sort((a, b) => b.votos - a.votos),
    bgColor: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
    count: ideiasVotacao.length,
    color: "text-blue-600"
  }, {
    title: "Desenvolvimento",
    icon: Code,
    items: ideiasDesenvolvimento.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()),
    bgColor: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
    count: ideiasDesenvolvimento.length,
    color: "text-orange-600"
  }, {
    title: "Finalizadas",
    icon: CheckCircle,
    items: ideiasFinalizada.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()),
    bgColor: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
    count: ideiasFinalizada.length,
    color: "text-green-600"
  }];
  const KanbanColumn = ({
    title,
    icon: Icon,
    items,
    bgColor,
    count,
    color
  }: {
    title: string;
    icon: any;
    items: any[];
    bgColor: string;
    count: number;
    color: string;
  }) => <div className="flex-1 min-w-0">
      <div className={`h-full rounded-lg ${bgColor}`} data-qa={`kanban-column-${title.toLowerCase()}`}>
        <div className="flex flex-col space-y-1.5 p-6 pb-4">
          <div className="flex items-center justify-between text-2xl font-semibold leading-none tracking-tight">
            <div className={`flex items-center gap-2 ${color}`}>
              <Icon className="h-5 w-5" />
              <span className="text-base sm:text-lg font-medium">{title}</span>
            </div>
            <Badge variant="secondary" className="ml-2 text-xs">
              {count}
            </Badge>
          </div>
        </div>
        <div className="p-6 pt-0 space-y-4 pb-6 max-h-[60vh] overflow-y-auto">
          {items.length > 0 ? items.map(ideia => <IdeaCard key={ideia.id} ideia={ideia} showVoteButton={false} showPosition={false} data-qa={`kanban-card-${ideia.id}`} />) : <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">Nenhuma funcionalidade nesta etapa</p>
            </div>}
        </div>
      </div>
    </div>;
  return <div className="min-h-screen bg-gradient-to-br from-background to-kanban-bg">
      <Navbar />
      
      {/* Communication Banner */}
      
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-6">
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
            {columns.map((column, index) => (
              <Button 
                key={index} 
                variant={activeTab === index ? "default" : "outline"} 
                size="sm" 
                onClick={() => setActiveTab(index)} 
                className={cn(
                  "flex-shrink-0 min-w-[120px] min-h-[44px] text-xs touch-target transition-all",
                  activeTab === index ? "bg-primary text-primary-foreground" : "hover:bg-background active:bg-accent/70"
                )}
                data-qa={`kanban-tab-${column.title.toLowerCase()}`}
              >
                <column.icon className="h-3 w-3 mr-1" />
                {column.title}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {column.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Mobile Single Column View */}
        <div className="lg:hidden">
          <KanbanColumn title={columns[activeTab].title} icon={columns[activeTab].icon} items={columns[activeTab].items} bgColor={columns[activeTab].bgColor} count={columns[activeTab].count} color={columns[activeTab].color} />
        </div>

        {/* Desktop Multi-Column View */}
        <div className="hidden lg:flex lg:flex-row gap-6 min-h-[600px]">
          {columns.map((column, index) => <KanbanColumn key={index} title={column.title} icon={column.icon} items={column.items} bgColor={column.bgColor} count={column.count} color={column.color} />)}
        </div>

        {/* Info Footer */}
        <div className="text-center mt-8 sm:mt-12 space-y-2 px-4">
          <p className="text-xs sm:text-sm text-muted-foreground">Atualizações em tempo real • Saipos - iFood Move 2025</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Votação aberta
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Desenvolvimento ativo
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Implementação concluída
            </span>
          </div>
        </div>
      </div>
    </div>;
};
export default Kanban;