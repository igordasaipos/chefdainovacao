
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  registerAdmin: (email: string, password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkAdminStatus = async (userEmail: string) => {
    try {
      console.log(`Verificando status de admin para: ${userEmail}`);
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', userEmail)
        .single();
      
      if (error) {
        console.log(`Erro ao verificar admin: ${error.message}`);
        setIsAdmin(false);
        return false;
      }
      
      const isAdminUser = !!data;
      console.log(`Usuário ${userEmail} é admin: ${isAdminUser}`);
      setIsAdmin(isAdminUser);
      return isAdminUser;
    } catch (error) {
      console.error('Erro na verificação de admin:', error);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    console.log('Configurando listener de autenticação...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Evento de auth: ${event}`, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user is admin
        if (session?.user?.email) {
          await checkAdminStatus(session.user.email);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Sessão existente:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        checkAdminStatus(session.user.email);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log(`Tentativa de login para: ${email}`);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.log(`Erro no login: ${error.message}`);
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Login realizado com sucesso');
      }
      
      return { error };
    } catch (error) {
      console.error('Erro no signIn:', error);
      return { error };
    }
  };

  const registerAdmin = async (email: string, password: string) => {
    try {
      console.log(`Tentativa de registro admin para: ${email}`);
      const { data, error } = await supabase.functions.invoke('register-admin', {
        body: { email, password }
      });

      if (error) {
        console.log(`Erro no registro admin: ${error.message}`);
        toast({
          title: "Erro no registro",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Sucesso",
        description: "Usuário admin registrado com sucesso. Você pode fazer login agora.",
      });

      return { error: null };
    } catch (error) {
      console.error('Erro no registerAdmin:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('Fazendo logout...');
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      loading,
      signIn,
      signOut,
      registerAdmin
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
