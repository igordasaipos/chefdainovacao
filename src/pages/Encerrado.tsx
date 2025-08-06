import { CheckCircle, TrendingUp, Users, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIdeias, useTotaisPorStatus } from "@/hooks/useIdeias";
import { IdeaCard } from "@/components/IdeaCard";
import { Navbar } from "@/components/Navbar";
const Encerrado = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  const {
    data: ideias = []
  } = useIdeias();
  const {
    data: totais
  } = useTotaisPorStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('inscricoes_newsletter')
        .insert([
          {
            nome: nome.trim(),
            email: email.trim().toLowerCase()
          }
        ]);

      if (error) {
        console.error('Erro ao salvar inscrição:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao salvar sua inscrição. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Você será notificado sobre as novidades",
      });
      
      setIsModalOpen(false);
      setNome("");
      setEmail("");
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };
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
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Banner Section with Communication Image */}
        <div className="bg-white py-4 sm:py-8 mb-2 sm:mb-4 relative">
          <div className="max-w-4xl mx-auto relative">
            <img src="/lovable-uploads/chefedainovacao.webp" alt="Chef da Inovação - Você faz o pedido, a gente desenvolve a solução" className="w-full h-auto rounded-lg shadow-sm" loading="eager" decoding="async" />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="md:text-5xl font-bold mb-4 text-3xl">
            Nosso evento foi finalizado com sucesso
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base">
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

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 md:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left order-1">
              <h3 className="text-xl font-semibold text-foreground">
                Ficar por dentro tudo que rolou
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 order-2">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="lg">
                    Receber os destaques
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Receber os destaques</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1">
                        Confirmar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="lg"
                asChild
              >
                <a 
                  href="https://chat.whatsapp.com/KwqneNRzYFn1BNLZoRmw6O?mode=ac_t"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Entrar na comunidade
                </a>
              </Button>
            </div>
          </div>
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
      </div>
    </div>;
};
export default Encerrado;