
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComplexityBadge } from './ComplexityBadge';
import { Ideia } from '@/hooks/useIdeias';
import { ThumbsUp, Check, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdeaCardProps {
  ideia: Ideia;
  position?: number;
  onVote?: () => void;
  showVoteButton?: boolean;
  showPosition?: boolean;
  hasVotedRecently?: boolean;
  isVoting?: boolean;
  hasVoted?: boolean;
  compact?: boolean;
  "data-qa"?: string;
}

export const IdeaCard = ({ 
  ideia, 
  position, 
  onVote, 
  showVoteButton = false, 
  showPosition = false,
  hasVotedRecently = false,
  isVoting = false,
  hasVoted = false,
  compact = false,
  "data-qa": dataQa
}: IdeaCardProps) => {
  return (
    <Card className="transition-all duration-200 hover:shadow-md border-l-4 border-l-primary bg-card card-mobile-active" data-qa={dataQa}>
      <CardContent className={cn("p-4 sm:p-6", compact && "p-3 sm:p-4")}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <div className={cn("mb-3", compact && "mb-2")}>
              <h3 className={cn("text-base sm:text-lg font-semibold text-gray-900 leading-tight", compact && "text-sm sm:text-base")}>
                {ideia.titulo}
              </h3>
            </div>
            
            <p className={cn("text-gray-600 text-sm mb-4 line-clamp-3", compact && "text-xs mb-2")}>
              {ideia.descricao}
            </p>
            
            <div className={cn("flex items-center gap-3 text-sm text-gray-500 mb-4 sm:mb-3", compact && "mb-2 text-xs")}>
              {showPosition && position && (
                <>
                  <span className="font-medium">#{position}</span>
                </>
              )}
            </div>
          </div>
          
          {showVoteButton && (
            <Button
              onClick={() => onVote?.()}
              disabled={hasVotedRecently || isVoting || hasVoted}
              className={cn(
                "w-full sm:w-auto sm:min-w-[100px] min-h-[48px] sm:min-h-[40px] transition-all duration-200 font-medium",
                hasVotedRecently || hasVoted
                  ? "bg-green-500 hover:bg-green-600 text-white cursor-not-allowed" 
                  : isVoting 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
              data-qa={`votar-button-${ideia.id}`}
            >
              {isVoting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Votando
                </span>
              ) : hasVotedRecently || hasVoted ? (
                <span className="flex items-center justify-center gap-1">
                  <Check className="h-4 w-4" />
                  Já votei
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  <Heart className="h-4 w-4" />
                  Votar
                </span>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
