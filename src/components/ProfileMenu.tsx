
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Settings, CreditCard, HelpCircle, LogOut, Shield, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfileModal from './ProfileModal';
import NotificationsModal from './NotificationsModal';
import { useIsMobile } from '@/hooks/use-mobile';

const ProfileMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro no logout",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleManageSubscription = async () => {
    setLoadingPortal(true);
    try {
      console.log('🎯 Abrindo portal do cliente...');
      
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        console.error('❌ Erro ao criar portal:', error);
        throw error;
      }

      if (data?.url) {
        // Abrir portal em nova aba
        window.open(data.url, '_blank');
        toast({
          title: "Portal do Cliente",
          description: "Abrindo portal de gerenciamento da assinatura",
          variant: "default"
        });
      } else {
        throw new Error('URL do portal não retornada');
      }
    } catch (error) {
      console.error('❌ Erro ao abrir portal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de assinatura. Verifique se você possui uma assinatura ativa.",
        variant: "destructive"
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleSettingsClick = () => {
    toast({
      title: "Configurações",
      description: "Funcionalidade em desenvolvimento",
      variant: "default"
    });
  };

  const handleSecurityClick = () => {
    toast({
      title: "Segurança",
      description: "Funcionalidade em desenvolvimento",
      variant: "default"
    });
  };

  const handleHelpClick = () => {
    toast({
      title: "Ajuda & Suporte",
      description: "Funcionalidade em desenvolvimento",
      variant: "default"
    });
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full hover:bg-gray-100 transition-colors">
            <Avatar className="h-8 w-8 md:h-10 md:w-10 border-2 border-gray-200 hover:border-brand-green transition-colors">
              <AvatarFallback className="bg-gradient-to-br from-brand-green to-green-600 text-white font-semibold text-xs md:text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={`${isMobile ? 'w-72' : 'w-80'} p-2`} align="end" forceMount>
          <DropdownMenuLabel className="font-normal p-3 md:p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-gray-200">
                  <AvatarFallback className="bg-gradient-to-br from-brand-green to-green-600 text-white font-semibold text-sm md:text-lg">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                  <p className="text-xs md:text-sm text-gray-500 truncate">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowProfileModal(true)}
            className="cursor-pointer p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <User className="mr-3 h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm md:text-base">Editar Perfil</span>
              <p className="text-xs text-gray-500 hidden md:block">Gerencie suas informações pessoais</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowNotificationsModal(true)}
            className="cursor-pointer p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Bell className="mr-3 h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm md:text-base">Notificações</span>
              <p className="text-xs text-gray-500 hidden md:block">Configure suas preferências</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleManageSubscription}
            disabled={loadingPortal}
            className="cursor-pointer p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <CreditCard className="mr-3 h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm md:text-base">
                {loadingPortal ? 'Carregando...' : 'Gerenciar Assinatura'}
              </span>
              <p className="text-xs text-gray-500 hidden md:block">
                {loadingPortal ? 'Abrindo portal...' : 'Billing, faturas e pagamentos'}
              </p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSettingsClick}
            className="cursor-pointer p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Settings className="mr-3 h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm md:text-base">Configurações</span>
              <p className="text-xs text-gray-500 hidden md:block">Ajustes da conta e preferências</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSecurityClick}
            className="cursor-pointer p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Shield className="mr-3 h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm md:text-base">Segurança</span>
              <p className="text-xs text-gray-500 hidden md:block">Senha e autenticação</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleHelpClick}
            className="cursor-pointer p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <HelpCircle className="mr-3 h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm md:text-base">Ajuda & Suporte</span>
              <p className="text-xs text-gray-500 hidden md:block">Central de ajuda e contato</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="cursor-pointer p-2 md:p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
          >
            <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm md:text-base">Sair da conta</span>
              <p className="text-xs text-red-500 hidden md:block">Fazer logout do sistema</p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      
      <NotificationsModal 
        isOpen={showNotificationsModal} 
        onClose={() => setShowNotificationsModal(false)} 
      />
    </>
  );
};

export default ProfileMenu;
