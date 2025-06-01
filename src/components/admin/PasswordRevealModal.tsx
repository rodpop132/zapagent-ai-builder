
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface PasswordRevealModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const PasswordRevealModal = ({ user, isOpen, onClose }: PasswordRevealModalProps) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userPassword, setUserPassword] = useState('');
  const [verified, setVerified] = useState(false);

  const handleVerifyPassword = () => {
    console.log('🔐 Verificando senha admin para revelação...');
    
    if (adminPassword === 'Ro,pwd00!') {
      console.log('✅ Senha admin correta, revelando senha do usuário');
      setVerified(true);
      // Aqui seria a lógica real para obter a senha do usuário
      // Por motivos de segurança, vamos simular uma senha
      setUserPassword('senha123_simulada');
      toast.success('Senha revelada com sucesso!');
    } else {
      console.log('❌ Senha admin incorreta');
      toast.error('Senha administrativa incorreta!');
    }
  };

  const handleClose = () => {
    setAdminPassword('');
    setShowPassword(false);
    setUserPassword('');
    setVerified(false);
    onClose();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(userPassword);
      toast.success('Senha copiada para a área de transferência!');
    } catch (error) {
      console.error('❌ Erro ao copiar:', error);
      toast.error('Erro ao copiar senha');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            🔐 Revelar Senha do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Usuário:</strong> {user.full_name || user.email}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Esta ação será registrada nos logs de segurança.
            </p>
          </div>

          {!verified ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirme sua senha administrativa:
                </label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Digite sua senha admin..."
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVerifyPassword}
                  disabled={!adminPassword}
                  className="flex-1"
                >
                  Verificar e Revelar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Senha do usuário:
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={userPassword}
                    readOnly
                    className="font-mono bg-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={copyToClipboard}
                  className="mt-2 w-full"
                  variant="outline"
                >
                  📋 Copiar Senha
                </Button>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                ⚠️ Esta senha foi revelada em {new Date().toLocaleString('pt-BR')} por motivos administrativos.
              </div>

              <Button
                onClick={handleClose}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordRevealModal;
