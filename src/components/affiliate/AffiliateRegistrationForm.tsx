
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAffiliates } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AffiliateRegistrationForm = () => {
  const { user, signUp } = useAuth();
  const { createAffiliate } = useAffiliates();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    instagram_handle: '',
    youtube_channel: '',
    other_social: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.password || !formData.confirmPassword) {
      toast.error('Email, nome e senha são obrigatórios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        // Criar conta primeiro
        const { error: signUpError } = await signUp(
          formData.email, 
          formData.password, 
          formData.name
        );
        
        if (signUpError) {
          toast.error('Erro ao criar conta: ' + signUpError.message);
          return;
        }

        toast.success('Conta criada! Criando perfil de afiliado...');
        // Aguardar autenticação
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Criar perfil de afiliado
      await createAffiliate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        instagram_handle: formData.instagram_handle,
        youtube_channel: formData.youtube_channel,
        other_social: formData.other_social
      });

      toast.success('Perfil de afiliado criado com sucesso!');
      navigate('/afiliados/dashboard');
    } catch (error) {
      toast.error('Erro ao criar perfil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dados da Conta</h3>
        <div>
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <hr />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dados do Afiliado</h3>
        <div>
          <Label htmlFor="name">Nome Completo *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Redes Sociais (Opcional)</h4>
          
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              type="text"
              value={formData.instagram_handle}
              onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
              placeholder="@seuusuario"
            />
          </div>

          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <Input
              id="youtube"
              type="text"
              value={formData.youtube_channel}
              onChange={(e) => setFormData({ ...formData, youtube_channel: e.target.value })}
              placeholder="https://youtube.com/@seucanal"
            />
          </div>

          <div>
            <Label htmlFor="other">Outras Redes</Label>
            <Input
              id="other"
              type="text"
              value={formData.other_social}
              onChange={(e) => setFormData({ ...formData, other_social: e.target.value })}
              placeholder="TikTok, LinkedIn, etc."
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-900">Benefícios do Programa:</h4>
        <ul className="list-disc list-inside text-blue-800 mt-2 space-y-1">
          <li>Comissão de 10% em todas as vendas</li>
          <li>Link personalizado de rastreamento</li>
          <li>Dashboard com estatísticas detalhadas</li>
          <li>Pagamentos mensais</li>
        </ul>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Criando Perfil...' : 'Criar Perfil de Afiliado'}
      </Button>
    </form>
  );
};

export default AffiliateRegistrationForm;
