
import { useState } from 'react';
import { useAffiliates } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, MousePointer, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const AffiliateDashboard = () => {
  const { affiliate, stats } = useAffiliates();

  const affiliateLink = `${window.location.origin}/?afiliado=${affiliate?.affiliate_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success('Link copiado para a área de transferência!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'suspended':
        return 'Suspenso';
      default:
        return 'Desconhecido';
    }
  };

  if (!affiliate) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Afiliado</h1>
          <p className="text-gray-600 mt-2">Bem-vindo de volta, {affiliate.name}!</p>
        </div>
        <Badge className={getStatusColor(affiliate.status)}>
          {getStatusText(affiliate.status)}
        </Badge>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clicks}</div>
            <p className="text-xs text-muted-foreground">
              Pessoas que clicaram no seu link
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversions}</div>
            <p className="text-xs text-muted-foreground">
              Vendas realizadas através do seu link
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.earnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Comissões acumuladas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Link de Afiliado */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Link de Afiliado</CardTitle>
          <CardDescription>
            Compartilhe este link para ganhar comissões de 10% em cada venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg border">
              <code className="text-sm break-all">{affiliateLink}</code>
            </div>
            <Button onClick={copyLink} size="sm">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Como usar seu link:</h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Compartilhe nas suas redes sociais</li>
              <li>• Inclua em bio do Instagram/TikTok</li>
              <li>• Use em vídeos do YouTube</li>
              <li>• Envie para amigos e familiares</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Afiliado */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Código do Afiliado</label>
              <p className="font-mono text-lg">{affiliate.affiliate_code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Taxa de Comissão</label>
              <p className="text-lg">{affiliate.commission_rate}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">E-mail</label>
              <p>{affiliate.email}</p>
            </div>
            {affiliate.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Telefone</label>
                <p>{affiliate.phone}</p>
              </div>
            )}
          </div>

          {(affiliate.instagram_handle || affiliate.youtube_channel || affiliate.other_social) && (
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">Redes Sociais</label>
              <div className="space-y-1">
                {affiliate.instagram_handle && (
                  <p><span className="font-medium">Instagram:</span> {affiliate.instagram_handle}</p>
                )}
                {affiliate.youtube_channel && (
                  <p><span className="font-medium">YouTube:</span> {affiliate.youtube_channel}</p>
                )}
                {affiliate.other_social && (
                  <p><span className="font-medium">Outras:</span> {affiliate.other_social}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateDashboard;
