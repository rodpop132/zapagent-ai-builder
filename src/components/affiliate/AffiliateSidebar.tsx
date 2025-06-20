
import { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { home, chart-bar, users, message-square, settings } from 'lucide-react';

interface SidebarItem {
  title: string;
  icon: any;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface AffiliateSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userPlan: 'free' | 'pro';
}

const AffiliateSidebar = ({ activeSection, onSectionChange, userPlan }: AffiliateSidebarProps) => {
  const menuItems: SidebarItem[] = [
    {
      title: 'Início',
      icon: home,
      active: activeSection === 'dashboard',
      onClick: () => onSectionChange('dashboard')
    },
    {
      title: 'Agentes',
      icon: users,
      active: activeSection === 'agents',
      onClick: () => onSectionChange('agents')
    },
    {
      title: 'WhatsApp Integrado',
      icon: message-square,
      active: activeSection === 'whatsapp',
      disabled: userPlan !== 'pro',
      onClick: () => userPlan === 'pro' ? onSectionChange('whatsapp') : null
    },
    {
      title: 'Relatórios',
      icon: chart-bar,
      active: activeSection === 'reports',
      onClick: () => onSectionChange('reports')
    },
    {
      title: 'Configurações',
      icon: settings,
      active: activeSection === 'settings',
      onClick: () => onSectionChange('settings')
    }
  ];

  return (
    <Sidebar className="w-64 border-r bg-white">
      <SidebarHeader className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ZA</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">ZapAgent</h2>
            <p className="text-xs text-gray-500">Painel Afiliado</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : item.disabled
                    ? 'text-gray-400 cursor-not-allowed opacity-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                disabled={item.disabled}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
                {item.disabled && (
                  <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    PRO
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AffiliateSidebar;
