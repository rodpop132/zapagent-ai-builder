
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAffiliates } from '@/hooks/useAffiliates';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AfiliadosDashboard = () => {
  const { user } = useAuth();
  const { affiliate, loading } = useAffiliates();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/afiliados');
      } else if (!affiliate) {
        navigate('/afiliados');
      }
    }
  }, [user, affiliate, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !affiliate) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <AffiliateDashboard />
      </div>
      
      <Footer />
    </div>
  );
};

export default AfiliadosDashboard;
