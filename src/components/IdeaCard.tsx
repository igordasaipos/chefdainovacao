import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';
import { ComplexityBadge } from './ComplexityBadge';
import { Ideia } from '@/hooks/useIdeias';
import { Heart, Trophy } from 'lucide-react';

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
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {ideia.descricao && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {ideia.descricao}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            <span className="font-semibold">{ideia.votos} votos</span>
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
      </CardContent>
    </Card>
  );
};