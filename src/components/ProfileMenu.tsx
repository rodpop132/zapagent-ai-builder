
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
import ProfileModal from './ProfileModal';
import NotificationsModal from './NotificationsModal';

const ProfileMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

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

  const handleSettingsClick = () => {
    toast({
      title: "Configurações",
      description: "Funcionalidade em desenvolvimento",
      variant: "default"
    });
  };

  const handleBillingClick = () => {
    toast({
      title: "Billing",
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
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors">
            <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-brand-green transition-colors">
              <AvatarFallback className="bg-gradient-to-br from-brand-green to-green-600 text-white font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-2" align="end" forceMount>
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-gray-200">
                  <AvatarFallback className="bg-gradient-to-br from-brand-green to-green-600 text-white font-semibold text-lg">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900">{getUserDisplayName()}</p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
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
            className="cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <User className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <span className="font-medium">Editar Perfil</span>
              <p className="text-xs text-gray-500">Gerencie suas informações pessoais</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowNotificationsModal(true)}
            className="cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Bell className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <span className="font-medium">Notificações</span>
              <p className="text-xs text-gray-500">Configure suas preferências</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSettingsClick}
            className="cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Settings className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <span className="font-medium">Configurações</span>
              <p className="text-xs text-gray-500">Ajustes da conta e preferências</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleBillingClick}
            className="cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <CreditCard className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <span className="font-medium">Billing</span>
              <p className="text-xs text-gray-500">Gerencie pagamentos e faturas</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSecurityClick}
            className="cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Shield className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <span className="font-medium">Segurança</span>
              <p className="text-xs text-gray-500">Senha e autenticação</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleHelpClick}
            className="cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <HelpCircle className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <span className="font-medium">Ajuda & Suporte</span>
              <p className="text-xs text-gray-500">Central de ajuda e contato</p>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="cursor-pointer p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
          >
            <LogOut className="mr-3 h-4 w-4" />
            <div className="flex-1">
              <span className="font-medium">Sair da conta</span>
              <p className="text-xs text-red-500">Fazer logout do sistema</p>
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
