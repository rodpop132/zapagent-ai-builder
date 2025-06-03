
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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Função para atualizar o estado de auth
    const updateAuthState = (currentSession: Session | null) => {
      if (!isMounted) return;
      
      console.log('Updating auth state:', currentSession ? 'authenticated' : 'not authenticated');
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (!initialized) {
        setLoading(false);
        setInitialized(true);
      }
    };

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth event:', event);
        
        // Só processar eventos importantes, ignorar TOKEN_REFRESHED excessivos
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          updateAuthState(currentSession);
        } else if (event === 'TOKEN_REFRESHED' && currentSession) {
          // Para TOKEN_REFRESHED, só atualizar se realmente mudou
          if (currentSession.user?.id !== user?.id) {
            updateAuthState(currentSession);
          }
        }
      }
    );

    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
        }
        
        if (isMounted) {
          updateAuthState(initialSession);
        }
      } catch (error) {
        console.error('Falha na inicialização da sessão:', error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        },
      });
      return { data, error };
    } catch (error) {
      console.error('SignUp error:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('SignIn error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Iniciando logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
      } else {
        console.log('Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('SignOut error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading
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
