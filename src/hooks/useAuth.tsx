
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  // Verificar se estamos no navegador
  const isBrowser = typeof window !== 'undefined';

  // Inicializar estado de autenticação
  useEffect(() => {
    if (!isBrowser) return;
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔧 AUTH: Inicializando autenticação...');
        
        // Obter sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ AUTH: Erro ao obter sessão:', error);
          setSession(null);
          setUser(null);
        } else if (currentSession?.user && currentSession?.access_token) {
          console.log('✅ AUTH: Sessão ativa encontrada:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
        } else {
          console.log('ℹ️ AUTH: Nenhuma sessão ativa válida');
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error('💥 AUTH: Erro na inicialização:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [isBrowser]);

  // Configurar listener de mudanças de estado
  useEffect(() => {
    if (!isBrowser) return;

    console.log('🔧 AUTH: Configurando listener de estado...');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 AUTH: Mudança de estado:', event, session?.user?.email || 'sem usuário');
        
        // Evitar loops desnecessários
        if (event === 'SIGNED_IN' && session?.user && session?.access_token) {
          setSession(session);
          setUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          setSession(session);
          setUser(session.user);
        }
      }
    );

    return () => {
      console.log('🧹 AUTH: Removendo listener');
      subscription.unsubscribe();
    };
  }, [isBrowser]);

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('📝 AUTH: Iniciando cadastro para:', email);
    
    try {
      const redirectUrl = isBrowser ? `${window.location.origin}/` : undefined;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl
        },
      });
      
      if (error) {
        console.error('❌ AUTH: Erro no cadastro:', error);
      } else {
        console.log('✅ AUTH: Cadastro realizado');
      }
      
      return { data, error };
    } catch (error) {
      console.error('💥 AUTH: Erro inesperado no cadastro:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 AUTH: Iniciando login para:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ AUTH: Erro no login:', error);
      } else {
        console.log('✅ AUTH: Login realizado');
      }
      
      return { data, error };
    } catch (error) {
      console.error('💥 AUTH: Erro inesperado no login:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('🚪 AUTH: Iniciando logout...');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ AUTH: Erro no logout:', error);
      } else {
        console.log('✅ AUTH: Logout realizado');
      }
      
      // Limpar estado local
      setSession(null);
      setUser(null);
      
    } catch (error) {
      console.error('💥 AUTH: Erro inesperado no logout:', error);
      // Mesmo com erro, limpar estado local
      setSession(null);
      setUser(null);
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
