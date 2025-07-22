
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  adminEmail: string | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAdminStatus = async (email: string) => {
    try {
      console.log(`Verificando se ${email} é admin...`);
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', email)
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

  useEffect(() => {
    // Verificar se há um email salvo no localStorage
    const savedEmail = localStorage.getItem('admin_email');
    if (savedEmail) {
      console.log(`Email salvo encontrado: ${savedEmail}`);
      checkAdminStatus(savedEmail).then(isAdminUser => {
        if (isAdminUser) {
          setAdminEmail(savedEmail);
          setIsAdmin(true);
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
    
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  return (
    <AuthContext.Provider value={{
      adminEmail,
      isAdmin,
      loading,
      signIn,
      signOut
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
