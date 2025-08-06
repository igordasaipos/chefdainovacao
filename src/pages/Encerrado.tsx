import { CheckCircle, TrendingUp, Users, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIdeias, useTotaisPorStatus } from "@/hooks/useIdeias";
import { IdeaCard } from "@/components/IdeaCard";
import { Navbar } from "@/components/Navbar";
const Encerrado = () => {
  const {
    data: ideias = []
  } = useIdeias();
  const {
    data: totais
  } = useTotaisPorStatus();
  const desenvolvimentoItems = ideias.filter(ideia => ideia.status === 'desenvolvimento').sort((a, b) => b.votos - a.votos);
  const finalizadasItems = ideias.filter(ideia => ideia.status === 'finalizado').sort((a, b) => b.votos - a.votos);
  const StatCard = ({
    title,
    value,
    icon: Icon,
    description
  }: {
    title: string;
    value: number;
    icon: any;
    description: string;
  }) => <Card className="text-center">
      <CardContent className="pt-6">
        <div className="flex justify-center mb-2">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <div className="text-3xl font-bold text-primary mb-1">{value}</div>
        <div className="text-sm font-medium mb-1">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </CardContent>
    </Card>;
  const IdeaColumn = ({
    title,
    items,
    className
  }: {
    title: string;
    items: typeof ideias;
    className?: string;
  }) => <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="outline" className="text-xs">
          {items.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma funcionalidade neste status</p>
          </Card> : items.map(ideia => <IdeaCard key={ideia.id} ideia={ideia} showVoteButton={false} compact={true} />)}
      </div>
    </div>;
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Nosso evento foi finalizado com sucesso
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Muito obrigado a todos que colaboraram. Tivemos os seguintes resultados:
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatCard title="Total de Ideias" value={totais?.totalIdeias || 0} icon={Target} description="funcionalidades cadastradas" />
          <StatCard title="Total de Votos" value={totais?.totalVotos || 0} icon={Users} description="votos recebidos" />
          <StatCard title="Entregues" value={totais?.finalizadas || 0} icon={CheckCircle} description="funcionalidades finalizadas" />
          <StatCard title="Em Desenvolvimento" value={totais?.desenvolvimento || 0} icon={TrendingUp} description="em andamento" />
        </div>

        {/* Funcionalidades List */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center">
            Funcionalidades Implementadas
          </h2>
          
          {/* Desktop View */}
          <div className="hidden md:grid md:grid-cols-2 gap-8">
            <IdeaColumn title="Em Desenvolvimento" items={desenvolvimentoItems} />
            <IdeaColumn title="Finalizadas" items={finalizadasItems} />
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <Tabs defaultValue="desenvolvimento" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="desenvolvimento">
                  Desenvolvimento ({desenvolvimentoItems.length})
                </TabsTrigger>
                <TabsTrigger value="finalizadas">
                  Finalizadas ({finalizadasItems.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="desenvolvimento" className="mt-6">
                <IdeaColumn title="Em Desenvolvimento" items={desenvolvimentoItems} />
              </TabsContent>
              <TabsContent value="finalizadas" className="mt-6">
                <IdeaColumn title="Finalizadas" items={finalizadasItems} />
               </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>;
};
export default Encerrado;