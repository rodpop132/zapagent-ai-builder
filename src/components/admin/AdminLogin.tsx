
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestEmail, setRequestEmail] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('🔐 Tentativa de login admin:', { username, password });

    if (username === 'admin' && password === 'Ro,pwd00!') {
      console.log('✅ Login admin bem-sucedido');
      toast.success('Login realizado com sucesso!');
      onLogin(true);
    } else {
      console.log('❌ Credenciais inválidas');
      toast.error('Credenciais inválidas!');
    }

    setLoading(false);
  };

  const handlePermissionRequest = async () => {
    if (!requestEmail) {
      toast.error('Digite um email válido');
      return;
    }

    try {
      console.log('📧 Solicitando permissão para:', requestEmail);
      
      const { error } = await supabase
        .from('admin_access_requests')
        .insert({
          email: requestEmail,
          ip_address: '192.168.1.1' // Aqui você pode implementar detecção real de IP
        });

      if (error) {
        console.error('❌ Erro ao solicitar permissão:', error);
        toast.error('Erro ao enviar solicitação');
        return;
      }

      console.log('✅ Solicitação enviada com sucesso');
      toast.success('Solicitação enviada! Aguarde aprovação.');
      setShowRequestDialog(false);
      setRequestEmail('');
    } catch (error) {
      console.error('❌ Erro geral:', error);
      toast.error('Erro ao processar solicitação');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            🔐 Painel Administrativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <button className="text-xs text-gray-500 hover:text-gray-700 underline">
                  pedir permissão
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar Acesso Administrativo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Seu email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handlePermissionRequest}
                      className="flex-1"
                    >
                      Submeter
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowRequestDialog(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
