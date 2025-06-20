
import { useState } from 'react';
import { useAffiliates } from '@/hooks/useAffiliates';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AffiliateSidebar from './AffiliateSidebar';
import DashboardOverview from './sections/DashboardOverview';
import AgentsSection from './sections/AgentsSection';
import WhatsAppSection from './sections/WhatsAppSection';

const AffiliateDashboard = () => {
  const { affiliate, stats } = useAffiliates();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Simulando plano do usuário - você pode pegar isso de outro hook ou contexto
  const userPlan = 'free'; // ou 'pro'

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview affiliate={affiliate} stats={stats} />;
      case 'agents':
        return <AgentsSection />;
      case 'whatsapp':
        return <WhatsAppSection />;
      case 'reports':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Relatórios detalhados em breve...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Configurações da conta em breve...</p>
          </div>
        );
      default:
        return <DashboardOverview affiliate={affiliate} stats={stats} />;
    }
  };

  if (!affiliate) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AffiliateSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userPlan={userPlan}
        />
        <main className="flex-1 p-6">
          <div className="mb-4 lg:hidden">
            <SidebarTrigger />
          </div>
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AffiliateDashboard;
