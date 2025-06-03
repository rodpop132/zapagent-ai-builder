
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 User not authenticated, will redirect to auth');
      // Pequeno delay para evitar redirecionamentos múltiplos
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
      setShouldRedirect(false);
    }
  }, [user, loading]);

  if (loading) {
    console.log('⏳ Auth loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    console.log('🔄 Redirecting to auth page');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log('🎯 Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
