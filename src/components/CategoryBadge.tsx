
import { Badge } from '@/components/ui/badge';

interface CategoryBadgeProps {
  category: 'pdv' | 'mobile' | 'integracao' | 'relatorios' | 'dashboard' | 'pagamentos' | 'backup';
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'pdv':
        return { 
          label: 'PDV', 
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
        };
      case 'mobile':
        return { 
          label: 'Mobile', 
          className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
        };
      case 'integracao':
        return { 
          label: 'Integração', 
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
        };
      case 'relatorios':
        return { 
          label: 'Relatórios', 
          className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
        };
      case 'dashboard':
        return { 
          label: 'Dashboard', 
          className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
        };
      case 'pagamentos':
        return { 
          label: 'Pagamentos', 
          className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
        };
      case 'backup':
        return { 
          label: 'Backup', 
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        };
      default:
        return { 
          label: category, 
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
