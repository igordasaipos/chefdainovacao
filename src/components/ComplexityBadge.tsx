import { Badge } from '@/components/ui/badge';

interface ComplexityBadgeProps {
  complexity: '1h30' | '3h' | '1turno' | 'complexa';
}

export const ComplexityBadge = ({ complexity }: ComplexityBadgeProps) => {
  const getComplexityConfig = (complexity: string) => {
    switch (complexity) {
      case '1h30':
        return { 
          label: '1h30', 
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case '3h':
        return { 
          label: '3h', 
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        };
      case '1turno':
        return { 
          label: '1 Turno', 
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
        };
      case 'complexa':
        return { 
          label: 'Complexa', 
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
      default:
        return { 
          label: complexity, 
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const config = getComplexityConfig(complexity);

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};