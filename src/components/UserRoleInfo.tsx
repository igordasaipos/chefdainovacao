import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, User, Lock } from 'lucide-react';

export const UserRoleInfo = () => {
  const { adminEmail, userRole, permissions } = useAuth();

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', color: 'bg-red-100 text-red-800' };
      case 'admin':
        return { label: 'Admin', color: 'bg-blue-100 text-blue-800' };
      case 'editor':
        return { label: 'Editor', color: 'bg-green-100 text-green-800' };
      case 'viewer':
        return { label: 'Visualizador', color: 'bg-gray-100 text-gray-800' };
      default:
        return { label: 'Sem role', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      'delete_any_idea': 'Deletar qualquer ideia',
      'edit_any_idea': 'Editar qualquer ideia',
      'create_idea': 'Criar ideias',
      'edit_own_idea': 'Editar próprias ideias',
      'view_ideas': 'Visualizar ideias',
      'view_stats': 'Visualizar estatísticas',
      'manage_users': 'Gerenciar usuários',
      'manage_events': 'Gerenciar eventos'
    };
    return labels[permission] || permission;
  };

  const roleInfo = getRoleLabel(userRole);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          Informações do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Email:</span>
          <p className="text-sm font-medium">{adminEmail}</p>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Role:</span>
          <Badge className={roleInfo.color}>
            <Shield className="h-3 w-3 mr-1" />
            {roleInfo.label}
          </Badge>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Permissões:</span>
          <div className="flex flex-wrap gap-1">
            {permissions.length > 0 ? (
              permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  <Lock className="h-2 w-2 mr-1" />
                  {getPermissionLabel(permission)}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Nenhuma permissão
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};