
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ PROTECTED: Verificando acesso...', { 
    userEmail: user?.email, 
    loading,
    path: location.pathname 
  });

  if (loading) {
    console.log('⏳ PROTECTED: Carregando autenticação...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 PROTECTED: Redirecionando para login...');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  console.log('✅ PROTECTED: Acesso autorizado');
  return <>{children}</>;
};

export default ProtectedRoute;
