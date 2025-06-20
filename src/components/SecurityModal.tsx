
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Eye, EyeOff, Lock, Key } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecurityModal = ({ isOpen, onClose }: SecurityModalProps) => {
  const { toast } = useToast();
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);

  const validatePasswords = () => {
    if (!passwords.currentPassword) {
      toast({
        title: "Erro",
        description: "Digite sua senha atual",
        variant: "destructive"
      });
      return false;
    }

    if (passwords.newPassword.length < 6) {
      toast({
        title: "Erro", 
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return false;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return false;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      toast({
        title: "Erro",
        description: "A nova senha deve ser diferente da atual",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      // Primeiro, verificar se a senha atual está correta tentando fazer login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: passwords.currentPassword
      });

      if (signInError) {
        toast({
          title: "Erro",
          description: "Senha atual incorreta",
          variant: "destructive"
        });
        return;
      }

      // Atualizar para a nova senha
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso",
        variant: "default"
      });
      
      // Limpar campos
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a senha. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Segurança</span>
          </DialogTitle>
          <DialogDescription>
            Altere sua senha para manter sua conta segura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                placeholder="Digite sua senha atual"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Digite sua nova senha"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('new')}
              >
                {showPasswords.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Confirme sua nova senha"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => togglePasswordVisibility('confirm')}
              >
                {showPasswords.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Dicas de Segurança */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Key className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Dicas para uma senha segura:</p>
                <ul className="text-xs space-y-1">
                  <li>• Use pelo menos 8 caracteres</li>
                  <li>• Combine letras, números e símbolos</li>
                  <li>• Evite informações pessoais</li>
                  <li>• Use uma senha única para cada conta</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePassword} 
            disabled={loading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
          >
            {loading ? 'Alterando...' : 'Alterar senha'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityModal;
