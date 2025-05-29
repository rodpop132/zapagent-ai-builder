
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
    let mounted = true;
    let sessionCheckCount = 0;
    const maxSessionChecks = 3;

    const initializeAuth = async () => {
      sessionCheckCount++;
      
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
        }
        
        if (!mounted) return;
        
        // Set the session state regardless of whether it exists or not
        setSession(initialSession);
        setUser(initialSession?.user || null);
        
        if (!initialized) {
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
        if (mounted && !initialized) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        // Handle all auth events properly
        switch (event) {
          case 'SIGNED_IN':
            setSession(session);
            setUser(session?.user || null);
            setLoading(false);
            break;
          case 'SIGNED_OUT':
            setSession(null);
            setUser(null);
            setLoading(false);
            break;
          case 'TOKEN_REFRESHED':
            // Only update if we have a valid session
            if (session?.user && session.access_token) {
              setSession(session);
              setUser(session.user);
            }
            break;
          case 'INITIAL_SESSION':
            if (initialized) {
              setSession(session);
              setUser(session?.user || null);
            }
            break;
          default:
            // Handle any other events without causing state changes
            break;
        }
      }
    );

    // Initialize auth with retry logic
    const initWithRetry = async () => {
      await initializeAuth();
      
      // If we still don't have a clear state and haven't exceeded max checks, try again
      if (!initialized && sessionCheckCount < maxSessionChecks) {
        setTimeout(initWithRetry, 500);
      }
    };

    initWithRetry();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    // State will be updated by the auth state change listener
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
