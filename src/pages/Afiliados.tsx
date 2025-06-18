
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAffiliates } from '@/hooks/useAffiliates';
import AffiliateAuth from '@/components/affiliate/AffiliateAuth';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';
import AffiliateRegistration from '@/components/affiliate/AffiliateRegistration';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Afiliados = () => {
  const { user } = useAuth();
  const { affiliate, loading } = useAffiliates();
  const [showRegistration, setShowRegistration] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {!user ? (
          <AffiliateAuth />
        ) : !affiliate ? (
          showRegistration ? (
            <AffiliateRegistration onBack={() => setShowRegistration(false)} />
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Programa de Afiliados
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Você ainda não possui um perfil de afiliado. Crie agora e comece a ganhar comissões!
              </p>
              <button
                onClick={() => setShowRegistration(true)}
                className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Criar Perfil de Afiliado
              </button>
            </div>
          )
        ) : (
          <AffiliateDashboard />
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Afiliados;
