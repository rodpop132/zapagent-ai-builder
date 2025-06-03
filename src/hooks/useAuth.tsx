
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 AUTH: Inicializando sistema de autenticação...');
    
    // Configurar listener de mudanças de estado primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AUTH: Estado mudou:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('✅ AUTH: Usuário logado:', session.user.email);
          setSession(session);
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 AUTH: Usuário deslogado');
          setSession(null);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 AUTH: Token atualizado');
          setSession(session);
          setUser(session.user);
        }
        
        setLoading(false);
      }
    );

    // Verificar sessão existente depois
    const initializeAuth = async () => {
      try {
        console.log('🔍 AUTH: Verificando sessão existente...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AUTH: Erro ao obter sessão:', error);
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          console.log('✅ AUTH: Sessão encontrada:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log('ℹ️ AUTH: Nenhuma sessão encontrada');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('💥 AUTH: Erro na inicialização:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 AUTH: Limpando subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 AUTH: Tentando cadastro para:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        },
      });
      
      if (error) {
        console.error('❌ AUTH: Erro no cadastro:', error);
      } else {
        console.log('✅ AUTH: Cadastro realizado com sucesso');
      }
      
      return { data, error };
    } catch (error) {
      console.error('💥 AUTH: Erro inesperado no cadastro:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 AUTH: Tentando login para:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ AUTH: Erro no login:', error);
      } else {
        console.log('✅ AUTH: Login realizado com sucesso');
      }
      
      return { data, error };
    } catch (error) {
      console.error('💥 AUTH: Erro inesperado no login:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('🚪 AUTH: Realizando logout...');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ AUTH: Erro no logout:', error);
      } else {
        console.log('✅ AUTH: Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('💥 AUTH: Erro inesperado no logout:', error);
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
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
