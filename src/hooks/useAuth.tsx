
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
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Atualizando assinatura...');
      await supabase.functions.invoke('verify-subscription');
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Configurar listener de auth primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT' || !currentSession) {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession?.user || null);
          setLoading(false);
          
          // Verificar assinatura apenas no login, não no refresh
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              refreshSubscription();
            }, 1000);
          }
        }
      }
    );

    // Verificar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Verificação periódica menos agressiva - apenas a cada 2 minutos
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshSubscription();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, [user]);

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
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('SignOut error:', error);
      // Forçar logout local mesmo se houver erro
      setSession(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading,
      refreshSubscription
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
