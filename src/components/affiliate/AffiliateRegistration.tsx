
import { useState } from 'react';
import { useAffiliates } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AffiliateRegistrationProps {
  onBack: () => void;
}

const AffiliateRegistration = ({ onBack }: AffiliateRegistrationProps) => {
  const { createAffiliate } = useAffiliates();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    instagram_handle: '',
    youtube_channel: '',
    other_social: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAffiliate(formData);
      toast.success('Perfil de afiliado criado com sucesso!');
      // Não precisamos fazer nada mais aqui - o hook já atualizará o estado
      // e o componente pai irá automaticamente renderizar o dashboard
    } catch (error) {
      toast.error('Erro ao criar perfil de afiliado');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-2xl">Criar Perfil de Afiliado</CardTitle>
              <CardDescription>
                Preencha suas informações para começar a ganhar comissões
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Redes Sociais (Opcional)</h3>
              
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

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Benefícios do Programa:</h4>
              <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 mt-2 space-y-1">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateRegistration;
