
import { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Bot, BarChart3, Settings, MessageSquare, Users } from 'lucide-react';

interface SidebarItem {
  title: string;
  icon: any;
  active?: boolean;
  onClick: () => void;
}

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const menuItems: SidebarItem[] = [
    {
      title: 'Início',
      icon: Home,
      active: activeSection === 'home',
      onClick: () => onSectionChange('home')
    },
    {
      title: 'Meus Agentes',
      icon: Bot,
      active: activeSection === 'agents',
      onClick: () => onSectionChange('agents')
    },
    {
      title: 'Conversas',
      icon: MessageSquare,
      active: activeSection === 'conversations',
      onClick: () => onSectionChange('conversations')
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      active: activeSection === 'reports',
      onClick: () => onSectionChange('reports')
    },
    {
      title: 'Configurações',
      icon: Settings,
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
            <p className="text-xs text-gray-500">Dashboard</p>
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
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
