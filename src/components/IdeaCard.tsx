
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComplexityBadge } from './ComplexityBadge';
import { Ideia } from '@/hooks/useIdeias';
import { ThumbsUp, Check } from 'lucide-react';

interface IdeaCardProps {
  ideia: Ideia;
  position?: number;
  onVote?: () => void;
  showVoteButton?: boolean;
  showPosition?: boolean;
  hasVoted?: boolean;
}

export const IdeaCard = ({ 
  ideia, 
  position, 
  onVote, 
  showVoteButton = false, 
  showPosition = false,
  hasVoted = false
}: IdeaCardProps) => {
  return (
    <Card className="w-full bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Horizontal Container */}
        <div className="flex items-center gap-6">
          {/* Container 1 - Conteúdo */}
          <div className="flex-1">
            {/* Title */}
            <h3 className="text-xl font-bold text-foreground mb-3 leading-tight">
              {ideia.titulo}
            </h3>
            
            {/* Tags and Vote Info Row */}
            <div className="flex items-center gap-3 mb-3">
              {showPosition && position && (
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 px-2 py-1 text-sm font-medium">
                  #{position}
                </Badge>
              )}
              <ComplexityBadge complexity={ideia.complexidade} />
              
              <div className="flex items-center gap-1 text-blue-600">
                <ThumbsUp className="h-4 w-4" />
                <span className="font-medium">{ideia.votos} votos</span>
              </div>
            </div>
            
            {/* Description */}
            {ideia.descricao && (
              <p className="text-muted-foreground leading-relaxed line-clamp-2">
                {ideia.descricao}
              </p>
            )}
          </div>
          
          {/* Container 2 - Botão */}
          <div className="flex-shrink-0">
            {showVoteButton && !hasVoted && onVote && (
              <Button 
                onClick={onVote}
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ThumbsUp className="h-4 w-4" />
                Votar
              </Button>
            )}
            
            {hasVoted && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4" />
                <span className="font-medium">Votado!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
