
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import { ComplexityBadge } from './ComplexityBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { Ideia } from '@/hooks/useIdeias';
import { Heart, Trophy, MessageCircle, Star } from 'lucide-react';

interface IdeaCardProps {
  ideia: Ideia;
  position?: number;
  onVote?: () => void;
  showVoteButton?: boolean;
  showPosition?: boolean;
}

export const IdeaCard = ({ 
  ideia, 
  position, 
  onVote, 
  showVoteButton = false, 
  showPosition = false 
}: IdeaCardProps) => {
  // Simular dados extras para demonstração
  const mockPriority = position && position <= 2 ? 'alta' : position && position <= 5 ? 'media' : 'baixa';
  const mockCategory = ideia.titulo.toLowerCase().includes('dashboard') ? 'dashboard' :
                       ideia.titulo.toLowerCase().includes('mobile') || ideia.titulo.toLowerCase().includes('app') ? 'mobile' :
                       ideia.titulo.toLowerCase().includes('whatsapp') || ideia.titulo.toLowerCase().includes('pix') ? 'integracao' :
                       ideia.titulo.toLowerCase().includes('relatório') || ideia.titulo.toLowerCase().includes('performance') ? 'relatorios' :
                       ideia.titulo.toLowerCase().includes('backup') ? 'backup' :
                       ideia.titulo.toLowerCase().includes('pagamento') ? 'pagamentos' : 'pdv';
  const mockComments = Math.floor(Math.random() * 15) + 1;
  const mockROI = Math.floor(Math.random() * 5) + 1;

  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200 hover:scale-105 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-semibold leading-tight">
            {ideia.titulo}
          </CardTitle>
          {showPosition && position && (
            <div className="flex items-center gap-1 text-sm font-bold text-primary">
              <Trophy className="h-4 w-4" />
              #{position}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={ideia.status} />
          <ComplexityBadge complexity={ideia.complexidade} />
          <PriorityBadge priority={mockPriority} />
          <CategoryBadge category={mockCategory} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {ideia.descricao && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {ideia.descricao}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-primary" />
              <span className="font-semibold">{ideia.votos}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{mockComments}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">ROI:</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < mockROI ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
          
          {showVoteButton && onVote && (
            <Button 
              onClick={onVote}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Votar
            </Button>
          )}
        </div>

        {ideia.nome_restaurante && (
          <div className="text-xs text-muted-foreground">
            <strong>Restaurante:</strong> {ideia.nome_restaurante}
          </div>
        )}

        {ideia.desenvolvedor && (
          <div className="text-xs text-muted-foreground">
            <strong>Desenvolvedor:</strong> {ideia.desenvolvedor}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Criado por:</strong> {ideia.criado_por}
        </div>
      </CardContent>
    </Card>
  );
};
