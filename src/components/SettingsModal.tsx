
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Palette, Bell, Globe, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    displayName: user?.user_metadata?.full_name || '',
    emailNotifications: true,
    pushNotifications: false,
    language: 'pt',
    theme: 'light',
    autoSave: true,
    showOnlineStatus: true
  });
  
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Atualizar metadados do usuário
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: settings.displayName,
          settings: {
            emailNotifications: settings.emailNotifications,
            pushNotifications: settings.pushNotifications,
            language: settings.language,
            theme: settings.theme,
            autoSave: settings.autoSave,
            showOnlineStatus: settings.showOnlineStatus
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso",
        variant: "default"
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configurações</span>
          </DialogTitle>
          <DialogDescription>
            Personalize sua experiência no ZapAgent AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Perfil */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Perfil</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input
                id="displayName"
                value={settings.displayName}
                onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                placeholder="Seu nome"
              />
            </div>
          </div>

          {/* Aparência */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Aparência</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Idioma */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Idioma</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Idioma preferido</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt">Português</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notificações */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Notificações</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Notificações por email</Label>
                  <p className="text-sm text-gray-500">Receber atualizações por email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pushNotifications">Notificações push</Label>
                  <p className="text-sm text-gray-500">Receber notificações no navegador</p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                />
              </div>
            </div>
          </div>

          {/* Privacidade */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Privacidade</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showOnlineStatus">Mostrar status online</Label>
                  <p className="text-sm text-gray-500">Outros usuários podem ver quando você está online</p>
                </div>
                <Switch
                  id="showOnlineStatus"
                  checked={settings.showOnlineStatus}
                  onCheckedChange={(checked) => setSettings({ ...settings, showOnlineStatus: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSave">Salvamento automático</Label>
                  <p className="text-sm text-gray-500">Salvar alterações automaticamente</p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
