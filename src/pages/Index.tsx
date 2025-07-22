import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Users, BarChart3, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            iFood Move - Gestão de Ideias
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ferramenta de gestão colaborativa para coleta, votação e desenvolvimento de ideias durante o evento iFood Move.
          </p>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Admin Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Área Administrativa</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Acesso restrito para cadastro, edição e gerenciamento de ideias
              </p>
              <Link to="/admin">
                <Button className="w-full">
                  Acessar Admin
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Voting Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Votação Pública</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Vote nas melhores ideias e acompanhe o ranking em tempo real
              </p>
              <Link to="/votar">
                <Button className="w-full" variant="secondary">
                  Ir para Votação
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Kanban Card */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Acompanhamento</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Visualize o progresso das ideias em desenvolvimento
              </p>
              <Link to="/kanban">
                <Button className="w-full" variant="outline">
                  Ver Kanban
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <div className="text-center bg-card rounded-lg p-8 border">
          <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-4">Acesso via QR Code</h2>
          <p className="text-muted-foreground mb-6">
            Durante o evento, os participantes podem acessar diretamente as páginas de votação e acompanhamento através de QR Codes específicos.
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-sm mb-2">QR - Votação</h3>
              <p className="text-xs text-muted-foreground">/votar</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-sm mb-2">QR - Kanban</h3>
              <p className="text-xs text-muted-foreground">/kanban</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>iFood Move 2024 - Ferramenta de Gestão de Ideias</p>
        </div>
      </div>
    </div>
  );
};

export default Index;