import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'caixinha' | 'votacao' | 'desenvolvimento' | 'finalizado';
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'caixinha':
        return { 
          label: 'Caixinha', 
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground'
        };
      case 'votacao':
        return { 
          label: 'Votação', 
          variant: 'default' as const,
          className: 'bg-primary text-primary-foreground'
        };
      case 'desenvolvimento':
        return { 
          label: 'Desenvolvimento', 
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        };
      case 'finalizado':
        return { 
          label: 'Finalizado', 
          variant: 'secondary' as const,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      default:
        return { 
          label: status, 
          variant: 'outline' as const,
          className: ''
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};