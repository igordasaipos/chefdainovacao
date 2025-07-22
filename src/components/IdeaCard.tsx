
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComplexityBadge } from './ComplexityBadge';
import { Ideia } from '@/hooks/useIdeias';
import { ThumbsUp } from 'lucide-react';

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
    <Card className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      <CardContent className="p-6">
        {/* Header with title and vote count */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-3">
              {ideia.titulo}
            </h3>
            
            {/* Tags row */}
            <div className="flex gap-2 mb-4">
              <ComplexityBadge complexity={ideia.complexidade} />
              {showPosition && position && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  #{position}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Vote count */}
          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-gray-900">
              {ideia.votos}
            </div>
            <div className="text-sm text-gray-500">
              {ideia.votos === 1 ? 'voto' : 'votos'}
            </div>
          </div>
        </div>
        
        {/* Description */}
        {ideia.descricao && (
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            {ideia.descricao}
          </p>
        )}
        
        {/* Vote button */}
        {showVoteButton && onVote && (
          <Button 
            onClick={onVote}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Votar nesta ideia
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
