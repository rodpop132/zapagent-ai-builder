
import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardHome from './dashboard/sections/DashboardHome';
import { Dashboard } from './Dashboard';

const ProfessionalDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <DashboardHome />;
      case 'agents':
        return <Dashboard />;
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
