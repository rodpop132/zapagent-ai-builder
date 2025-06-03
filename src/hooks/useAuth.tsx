
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
    console.log('🚀 AUTH PROVIDER: Starting initialization');
    
    // Get initial session first
    const getInitialSession = async () => {
      try {
        console.log('🔍 AUTH: Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AUTH: Error getting initial session:', error);
        } else {
          console.log('📋 AUTH: Initial session found:', !!initialSession);
          if (initialSession) {
            setSession(initialSession);
            setUser(initialSession.user);
            console.log('✅ AUTH: User set from initial session:', initialSession.user.email);
          }
        }
        
        setLoading(false);
        setInitialized(true);
      } catch (error) {
        console.error('💥 AUTH: Failed to get initial session:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    getInitialSession();

    // Set up auth state listener after getting initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('🔔 AUTH EVENT:', event, 'Session exists:', !!currentSession);
        
        // Only update state if we're initialized to avoid race conditions
        if (initialized) {
          if (event === 'SIGNED_IN' && currentSession) {
            console.log('✅ AUTH: User signed in:', currentSession.user.email);
            setSession(currentSession);
            setUser(currentSession.user);
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 AUTH: User signed out');
            setSession(null);
            setUser(null);
          } else if (event === 'TOKEN_REFRESHED' && currentSession) {
            console.log('🔄 AUTH: Token refreshed, maintaining session');
            // Don't change state on token refresh to avoid logout
            setSession(currentSession);
            setUser(currentSession.user);
          }
        }
      }
    );

    return () => {
      console.log('🧹 AUTH: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('📝 AUTH: Attempting sign up for:', email);
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
        console.error('❌ AUTH: Sign up error:', error);
      } else {
        console.log('✅ AUTH: Sign up successful');
      }
      
      return { data, error };
    } catch (error) {
      console.error('💥 AUTH: Sign up exception:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 AUTH: Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ AUTH: Sign in error:', error);
      } else {
        console.log('✅ AUTH: Sign in successful for:', email);
      }
      
      return { data, error };
    } catch (error) {
      console.error('💥 AUTH: Sign in exception:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 AUTH: Manual sign out requested');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AUTH: Sign out error:', error);
      } else {
        console.log('✅ AUTH: Manual sign out successful');
      }
    } catch (error) {
      console.error('💥 AUTH: Sign out exception:', error);
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
