
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, Shield, Volume2, X, Save } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  agentUpdates: boolean;
  systemMaintenance: boolean;
}

const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    agentUpdates: true,
    systemMaintenance: true
  });

  const handleSave = async () => {
    setSaving(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Preferências salvas",
      description: "Suas configurações de notificação foram atualizadas",
      variant: "default"
    });
    
    setSaving(false);
    onClose();
  };

  const updateSetting = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Configurações de Notificação
            </DialogTitle>
            <DialogDescription className="text-blue-100">
              Gerencie como e quando você deseja ser notificado
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-500" />
                Notificações por Email
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-notifications" className="font-medium">
                      Notificações gerais
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receber atualizações importantes por email
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={() => updateSetting('emailNotifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="marketing-emails" className="font-medium">
                      Emails promocionais
                    </Label>
                    <p className="text-sm text-gray-500">
                      Novidades, ofertas e dicas
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={settings.marketingEmails}
                    onCheckedChange={() => updateSetting('marketingEmails')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
                Notificações de Sistema
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-notifications" className="font-medium">
                      Notificações push
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receber notificações no navegador
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={() => updateSetting('pushNotifications')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="agent-updates" className="font-medium">
                      Atualizações de agentes
                    </Label>
                    <p className="text-sm text-gray-500">
                      Notificações sobre seus agentes AI
                    </p>
                  </div>
                  <Switch
                    id="agent-updates"
                    checked={settings.agentUpdates}
                    onCheckedChange={() => updateSetting('agentUpdates')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="system-maintenance" className="font-medium">
                      Manutenções do sistema
                    </Label>
                    <p className="text-sm text-gray-500">
                      Avisos sobre manutenções programadas
                    </p>
                  </div>
                  <Switch
                    id="system-maintenance"
                    checked={settings.systemMaintenance}
                    onCheckedChange={() => updateSetting('systemMaintenance')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-500" />
                Segurança
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="security-alerts" className="font-medium">
                      Alertas de segurança
                    </Label>
                    <p className="text-sm text-gray-500">
                      Notificações sobre login e atividades suspeitas
                    </p>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={settings.securityAlerts}
                    onCheckedChange={() => updateSetting('securityAlerts')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="sms-notifications" className="font-medium">
                      SMS de segurança
                    </Label>
                    <p className="text-sm text-gray-500">
                      Códigos de verificação por SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={() => updateSetting('smsNotifications')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="hover:bg-gray-50"
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Preferências'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
