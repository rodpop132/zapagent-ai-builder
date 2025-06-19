
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAffiliates } from '@/hooks/useAffiliates';
import AffiliateDashboard from '@/components/affiliate/AffiliateDashboard';
import AffiliateLoginForm from '@/components/affiliate/AffiliateLoginForm';
import AffiliateRegistrationForm from '@/components/affiliate/AffiliateRegistrationForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Afiliados = () => {
  const { user } = useAuth();
  const { affiliate, loading } = useAffiliates();
  const [activeTab, setActiveTab] = useState('login');

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
        ) : !affiliate ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Criar Perfil de Afiliado</CardTitle>
                <CardDescription>
                  Complete seu perfil para começar a ganhar comissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AffiliateRegistrationForm />
              </CardContent>
            </Card>
          </div>
        ) : (
          <AffiliateDashboard />
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Afiliados;
