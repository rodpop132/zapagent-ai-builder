
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
      await supabase.functions.invoke('verify-subscription');
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
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

          // Verificar assinatura se o usuário estiver logado
          if (initialSession?.user) {
            refreshSubscription();
          }
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

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, 'Session:', !!session);
        
        if (!mounted) return;
        
        // Update state immediately for all events
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
        
        // Verificar assinatura quando usuário faz login
        if (event === 'SIGNED_IN' && session?.user) {
          refreshSubscription();
        }
        
        // Log session details for debugging
        if (session) {
          console.log('User authenticated:', session.user.email);
        } else {
          console.log('User logged out or session expired');
        }
      }
    );

    // THEN check for existing session
    initializeAuth();

    return () => {
      mounted = false;
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
      // Limpa os estados localmente primeiro
      setSession(null);
      setUser(null);
      
      // Tenta fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      // Se der erro de sessão ausente, ignora pois já limpamos localmente
      if (error && error.message.includes('Auth session missing')) {
        console.log('Session already cleared, logout successful');
        return;
      }
      
      if (error) {
        console.error('SignOut error:', error);
        // Mesmo com erro, mantem os estados limpos
        return;
      }
      
      console.log('Logout successful');
    } catch (error) {
      console.error('SignOut failed:', error);
      // Mesmo com erro, mantem os estados limpos para permitir "logout forçado"
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
