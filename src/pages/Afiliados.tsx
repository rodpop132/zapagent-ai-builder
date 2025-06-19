
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAffiliates } from '@/hooks/useAffiliates';
import AffiliateLoginForm from '@/components/affiliate/AffiliateLoginForm';
import AffiliateRegistrationForm from '@/components/affiliate/AffiliateRegistrationForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Afiliados = () => {
  const { user } = useAuth();
  const { affiliate, loading } = useAffiliates();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    if (!loading && user && affiliate) {
      navigate('/afiliados/dashboard');
    }
  }, [user, affiliate, loading, navigate]);

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
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Área do Afiliado</CardTitle>
              <CardDescription>
                Faça login ou crie sua conta para acessar o programa de afiliados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Criar Conta</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <AffiliateLoginForm />
                </TabsContent>
                
                <TabsContent value="register">
                  <AffiliateRegistrationForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Afiliados;
