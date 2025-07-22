
import { Badge } from '@/components/ui/badge';

interface PriorityBadgeProps {
  priority: 'alta' | 'media' | 'baixa';
}

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'alta':
        return { 
          label: 'Alta Prioridade', 
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
      case 'media':
        return { 
          label: 'Média Prioridade', 
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        };
      case 'baixa':
        return { 
          label: 'Baixa Prioridade', 
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      default:
        return { 
          label: priority, 
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
