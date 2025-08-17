
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  adminEmail: string | null;
  isAdmin: boolean;
  loading: boolean;
  userRole: string | null;
  permissions: string[];
  signIn: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canDeleteIdea: (ideaCreator?: string) => boolean;
  canEditIdea: (ideaCreator?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const { toast } = useToast();

  const checkAdminStatus = async (email: string) => {
    try {
      console.log(`Verificando se ${email} é admin...`);
      const { data, error } = await supabase
        .from('admins')
        .select('nome')
        .eq('nome', email)
        .single();
      
      if (error) {
        console.log(`Email ${email} não encontrado na lista de admins`);
        return false;
      }
      
      const isAdminUser = !!data;
      console.log(`Email ${email} é admin: ${isAdminUser}`);
      return isAdminUser;
    } catch (error) {
      console.error('Erro na verificação de admin:', error);
      return false;
    }
  };

  const loadUserPermissions = async (email: string) => {
    try {
      // Buscar role do usuário
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role', { user_email: email });

      if (roleError) {
        console.error('Erro ao buscar role:', roleError);
        return;
      }

      if (roleData && roleData.length > 0) {
        setUserRole(roleData[0].role_name);
      }

      // Buscar permissões do usuário
      const { data: permissionsData, error: permissionsError } = await supabase
        .rpc('get_user_permissions', { user_email: email });

      if (permissionsError) {
        console.error('Erro ao buscar permissões:', permissionsError);
        return;
      }

      const userPermissions = permissionsData?.map((p: any) => p.permission_name) || [];
      setPermissions(userPermissions);
      console.log(`Permissões carregadas para ${email}:`, userPermissions);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    }
  };

  useEffect(() => {
    // Verificar se há um email salvo no localStorage
    const savedEmail = localStorage.getItem('admin_email');
    if (savedEmail) {
      console.log(`Email salvo encontrado: ${savedEmail}`);
      checkAdminStatus(savedEmail).then(isAdminUser => {
        if (isAdminUser) {
          setAdminEmail(savedEmail);
          setIsAdmin(true);
          loadUserPermissions(savedEmail);
        } else {
          // Email não é mais admin, remover do localStorage
          localStorage.removeItem('admin_email');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string) => {
    try {
      console.log(`Tentativa de login para: ${email}`);
      
      const isAdminUser = await checkAdminStatus(email);
      
      if (!isAdminUser) {
        const error = { message: "Email não autorizado. Apenas emails da lista de admins podem acessar." };
        toast({
          title: "Acesso negado",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Salvar email no localStorage e atualizar estado
      localStorage.setItem('admin_email', email);
      setAdminEmail(email);
      setIsAdmin(true);
      
      // Carregar permissões do usuário
      await loadUserPermissions(email);
      
      console.log('Login realizado com sucesso');
      toast({
        title: "Acesso autorizado",
        description: `Bem-vindo, ${email}!`,
      });
      
      return { error: null };
    } catch (error) {
      console.error('Erro no signIn:', error);
      toast({
        title: "Erro no login",
        description: "Erro interno do sistema",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    console.log('Fazendo logout...');
    localStorage.removeItem('admin_email');
    setAdminEmail(null);
    setIsAdmin(false);
    setUserRole(null);
    setPermissions([]);
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const canDeleteIdea = (ideaCreator?: string): boolean => {
    if (hasPermission('delete_any_idea')) return true;
    if (hasPermission('edit_own_idea') && ideaCreator === adminEmail) return true;
    return false;
  };

  const canEditIdea = (ideaCreator?: string): boolean => {
    if (hasPermission('edit_any_idea')) return true;
    if (hasPermission('edit_own_idea') && ideaCreator === adminEmail) return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{
      adminEmail,
      isAdmin,
      loading,
      userRole,
      permissions,
      signIn,
      signOut,
      hasPermission,
      canDeleteIdea,
      canEditIdea
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
