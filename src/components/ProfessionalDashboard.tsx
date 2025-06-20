
import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardHome from './dashboard/sections/DashboardHome';
import Dashboard from './Dashboard';

const ProfessionalDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <DashboardHome />;
      case 'agents':
        return <Dashboard />;
      case 'whatsapp':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Integrado</h1>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">PRO</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Funcionalidade Exclusiva PRO</h3>
                  <p className="text-gray-600">Integração direta com WhatsApp disponível apenas para usuários PRO.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'conversations':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Conversas</h1>
            <p className="text-gray-600">Histórico de conversas em breve...</p>
          </div>
        );
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
        return <DashboardHome />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
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

export default ProfessionalDashboard;
