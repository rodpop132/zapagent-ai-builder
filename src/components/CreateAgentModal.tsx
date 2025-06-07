import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, QrCode, Lock, Wifi, AlertCircle, RefreshCw, Server } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ZapAgentService } from '@/services/zapAgentService';
import CountryPhoneInput from './CountryPhoneInput';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: () => void;
}

const CreateAgentModal = ({ isOpen, onClose, onAgentCreated }: CreateAgentModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    business_type: '',
    phone_number: '',
    training_data: '',
    personality_prompt: '',
    webhook: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'connected' | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const businessTypes = [
    'E-commerce',
    'Serviços',
    'Consultoria',
    'Educação',
    'Saúde',
    'Tecnologia',
    'Alimentação',
    'Beleza',
    'Imobiliário',
    'Outros'
  ];

  // Verificar status da API quando o modal abrir
  React.useEffect(() => {
    if (isOpen) {
      checkApiStatus();
      getUserPlan();
    }
  }, [isOpen]);

  const checkApiStatus = async () => {
    try {
      console.log('🔍 CreateAgentModal: Verificando status da API...');
      setApiStatus(null);
      
      const status = await ZapAgentService.checkApiStatus();
      setApiStatus(status);
      console.log('📊 CreateAgentModal: Status da API:', status);
    } catch (error) {
      console.error('❌ CreateAgentModal: Erro ao verificar API:', error);
      setApiStatus(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userPlan === 'free') {
      toast({
        title: "Funcionalidade Premium",
        description: "Upload de arquivos está disponível apenas nos planos Pro e Ultra",
        variant: "destructive"
      });
      return;
    }

    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type === 'text/plain' || 
      file.type === 'application/pdf' || 
      file.name.endsWith('.txt') || 
      file.name.endsWith('.pdf')
    );
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Arquivos inválidos",
        description: "Apenas arquivos PDF e TXT são permitidos",
        variant: "destructive"
      });
    }
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getUserPlan = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('subscriptions')
        .select('plan_type, is_unlimited')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        return 'free';
      }
      
      const plan = data?.plan_type || 'free';
      console.log('📋 Plano do usuário obtido:', plan);
      setUserPlan(plan);
      return plan;
    } catch (error) {
      console.error('Error getting user plan:', error);
      setUserPlan('free');
      return 'free';
    }
  };

  // Função para limpar número (apenas dígitos)
  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, '');
  };

  const checkPhoneNumberAvailability = async (phoneNumber: string) => {
    try {
      console.log('🔍 STEP 1: Verificando disponibilidade do número:', phoneNumber);
      
      const { data: existingAgent, error } = await supabase
        .from('agents')
        .select('id, user_id, name')
        .eq('phone_number', phoneNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ STEP 1 ERROR: Erro ao verificar número no Supabase:', error);
        throw new Error(`Erro ao verificar disponibilidade: ${error.message}`);
      }

      if (existingAgent) {
        console.error('❌ STEP 1 ERROR: Número já em uso:', existingAgent);
        if (existingAgent.user_id === user?.id) {
          throw new Error(`Você já possui um agente (${existingAgent.name}) usando este número. Use um número diferente.`);
        } else {
          throw new Error('Este número já está sendo usado por outro usuário.');
        }
      }

      console.log('✅ STEP 1 SUCCESS: Número disponível para uso');
      return true;
    } catch (error) {
      console.error('❌ STEP 1 FINAL ERROR:', error);
      throw error;
    }
  };

  const createAgentAPI = async () => {
    try {
      console.log('🚀 STEP 2: Criando agente via API ZapAgent');
      
      const userPlan = await getUserPlan();
      let planValue = 'gratuito';
      if (userPlan === 'pro') planValue = 'standard';
      if (userPlan === 'ultra') planValue = 'ultra';
      
      const webhook = formData.webhook || `${window.location.origin}/webhook/${cleanPhoneNumber(formData.phone_number)}`;
      
      // Limpar número para enviar apenas dígitos
      const numeroLimpo = cleanPhoneNumber(formData.phone_number);
      
      const payload = {
        nome: formData.name,
        tipo: formData.business_type,
        descricao: formData.description,
        prompt: formData.personality_prompt || `Você é um assistente virtual para ${formData.business_type}. Seja sempre educado, prestativo e responda de forma clara e objetiva.`,
        numero: numeroLimpo,
        plano: planValue,
        webhook: webhook
      };

      console.log('📦 STEP 2: Payload preparado:', payload);
      
      const result = await ZapAgentService.createAgent(payload);
      console.log('✅ STEP 2: Resposta da API:', result);
      
      if (result.status === 'ok') {
        console.log('✅ STEP 2: Agente criado com sucesso');
        
        // Salvar dados no localStorage para uso futuro
        localStorage.setItem('zapagent_numero', numeroLimpo);
        localStorage.setItem('zapagent_plano', planValue);
        
        // Usar a rota direta da imagem QR Code
        const qrImageUrl = `https://zapagent-bot.onrender.com/qrcode-imagem?numero=${numeroLimpo}`;
        console.log('📱 STEP 2: URL da imagem QR Code:', qrImageUrl);
        setQrCodeUrl(qrImageUrl);
        setShowQrModal(true);
        startStatusPolling(numeroLimpo);
        
        toast({
          title: "✅ Agente criado com sucesso!",
          description: "Seu agente foi criado e está sendo configurado.",
        });
        
        return result;
      } else {
        throw new Error(result.error || result.msg || 'Erro desconhecido na criação do agente');
      }
    } catch (error) {
      console.error('🚨 STEP 2 ERROR:', error);
      throw error;
    }
  };

  const checkConnectionStatus = async (numero?: string) => {
    try {
      const numeroParaVerificar = numero || cleanPhoneNumber(formData.phone_number);
      console.log('🔍 Verificando status de conexão para:', numeroParaVerificar);
      
      const connectionData = await ZapAgentService.verifyConnection(numeroParaVerificar);
      console.log('📊 Status de conexão recebido:', connectionData);
      
      if (connectionData.conectado === true) {
        setConnectionStatus('connected');
        stopStatusPolling();
        
        try {
          await (supabase as any)
            .from('agents')
            .update({ whatsapp_status: 'connected' })
            .eq('phone_number', formData.phone_number);
        } catch (dbError) {
          console.error('Erro ao atualizar status no banco:', dbError);
        }
        
        toast({
          title: "✅ Agente Conectado!",
          description: "Seu agente está ativo e pronto para receber mensagens.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('💥 Erro ao verificar status:', error);
      return false;
    }
  };

  const startStatusPolling = (numero: string) => {
    console.log('🔄 Iniciando polling de status a cada 10 segundos...');
    
    setTimeout(() => {
      checkConnectionStatus(numero);
    }, 10000);
    
    const interval = setInterval(() => checkConnectionStatus(numero), 10000);
    setStatusCheckInterval(interval);
    
    setTimeout(() => {
      stopStatusPolling();
      console.log('⏰ Polling de status interrompido após 5 minutos');
    }, 300000);
  };

  const stopStatusPolling = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  const fetchQrCode = async (attempt = 1, maxAttempts = 3) => {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxAttempts} - Buscando QR code para número:`, formData.phone_number);
      
      if (attempt > maxAttempts) {
        throw new Error('Número máximo de tentativas atingido. O QR code pode não ter sido gerado ainda.');
      }
      
      const qrResponse = await ZapAgentService.getQrCode(formData.phone_number);
      
      if (qrResponse.conectado) {
        console.log('✅ ZapAgentService: Agente já conectado via QR check');
        setConnectionStatus('connected');
        setShowQrModal(false);
        toast({
          title: "✅ Agente Conectado!",
          description: "Seu agente está ativo e pronto para receber mensagens.",
        });
        return;
      }
      
      if (qrResponse.qr_code) {
        console.log('✅ QR code válido extraído');
        setQrCodeUrl(qrResponse.qr_code);
        setShowQrModal(true);
        startStatusPolling();
      } else {
        if (attempt < maxAttempts) {
          const waitTime = attempt * 3000;
          console.log(`⏳ QR ainda não gerado, tentando novamente em ${waitTime/1000} segundos...`);
          setTimeout(() => fetchQrCode(attempt + 1, maxAttempts), waitTime);
          return;
        }
        throw new Error('QR code ainda não foi gerado. Tente novamente em alguns segundos.');
      }
    } catch (error) {
      console.error('💥 Erro ao buscar QR code:', error);
      
      if (attempt < maxAttempts) {
        const waitTime = attempt * 4000;
        console.log(`🔄 Erro na tentativa ${attempt}, tentando novamente em ${waitTime/1000} segundos...`);
        setTimeout(() => fetchQrCode(attempt + 1, maxAttempts), waitTime);
        return;
      }
      
      toast({
        title: "Erro no QR Code",
        description: error instanceof Error ? error.message : "Falha ao gerar QR code. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 MAIN PROCESS: Iniciando criação completa do agente...');
      
      // Validação básica
      if (!formData.name.trim()) {
        throw new Error('Nome do agente é obrigatório');
      }
      if (!formData.business_type) {
        throw new Error('Tipo de negócio é obrigatório');
      }
      if (!formData.phone_number.trim() || cleanPhoneNumber(formData.phone_number).length < 10) {
        throw new Error('Número do WhatsApp deve ter pelo menos 10 dígitos');
      }

      // Verificar se API está online
      const isApiOnline = await ZapAgentService.checkApiStatus();
      if (!isApiOnline) {
        throw new Error('API não está disponível no momento. Aguarde alguns segundos e tente novamente.');
      }

      // STEP 1: Verificar disponibilidade
      await checkPhoneNumberAvailability(formData.phone_number);

      // STEP 2: Criar na API externa
      console.log('📡 MAIN PROCESS: Criando agente na API externa...');
      const apiResult = await createAgentAPI();

      // STEP 3: Salvar no Supabase
      console.log('💾 STEP 3: Salvando no banco de dados...');
      const { error: supabaseError } = await supabase
        .from('agents')
        .insert({
          name: formData.name,
          description: formData.description,
          business_type: formData.business_type,
          phone_number: formData.phone_number,
          training_data: formData.training_data,
          personality_prompt: formData.personality_prompt || `Você é um assistente virtual para ${formData.business_type}. Seja sempre educado, prestativo e responda de forma clara e objetiva.`,
          user_id: user?.id,
          whatsapp_status: 'pending'
        });

      if (supabaseError) {
        console.error('❌ STEP 3 ERROR:', supabaseError);
        throw new Error(`Erro ao salvar: ${supabaseError.message}`);
      }

      console.log('✅ STEP 3 SUCCESS: Agente salvo com sucesso');

      onAgentCreated();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        business_type: '',
        phone_number: '',
        training_data: '',
        personality_prompt: '',
        webhook: ''
      });
      setUploadedFiles([]);

    } catch (error) {
      console.error('💥 MAIN PROCESS ERROR:', error);
      
      let errorMessage = 'Erro inesperado';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Erro na Criação",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (fullNumber: string) => {
    console.log('📱 Número atualizado:', fullNumber);
    setFormData({ ...formData, phone_number: fullNumber });
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    stopStatusPolling();
    onClose();
  };

  const handleRetryQrCode = () => {
    setQrCodeUrl('');
    console.log('🔄 Verificando status de conexão novamente...');
    checkConnectionStatus();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Agente</DialogTitle>
            <DialogDescription>
              Configure seu agente de IA para atendimento automático no WhatsApp
            </DialogDescription>
          </DialogHeader>

          {/* Status da API */}
          {apiStatus === false && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <span className="text-sm text-yellow-700 font-medium">
                  Servidor Inicializando
                </span>
                <p className="text-xs text-yellow-600 mt-1">
                  O servidor pode estar inicializando (normal em serviços gratuitos). Isso leva 1-2 minutos.
                </p>
              </div>
              <Button
                onClick={checkApiStatus}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Verificar
              </Button>
            </div>
          )}

          {apiStatus === true && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Server className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                ✅ Servidor Online - Pronto para criar agentes
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="animate-in fade-in-50 duration-300 delay-100">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Agente *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Assistente da Loja XYZ"
                required
                className="transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <div className="animate-in fade-in-50 duration-300 delay-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Negócio *
              </label>
              <Select 
                value={formData.business_type} 
                onValueChange={(value) => setFormData({ ...formData, business_type: value })}
              >
                <SelectTrigger className="transition-all duration-200 focus:scale-[1.01]">
                  <SelectValue placeholder="Selecione o tipo de negócio" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type} className="hover:bg-gray-50 transition-colors">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="animate-in fade-in-50 duration-300 delay-300">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o que seu agente faz..."
                rows={3}
                className="transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            <div className="animate-in fade-in-50 duration-300 delay-400">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número do WhatsApp * (com código do país)
              </label>
              <CountryPhoneInput
                value={formData.phone_number}
                onChange={handlePhoneChange}
                placeholder="Digite o número"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ IMPORTANTE: O número deve incluir o DDI (código do país) completo
              </p>
              {formData.phone_number && (
                <div className="text-xs mt-1 space-y-1">
                  <p className="text-green-600">
                    ✅ Número completo: {formData.phone_number}
                  </p>
                  <p className="text-blue-600">
                    📞 Será enviado como: {cleanPhoneNumber(formData.phone_number)}
                  </p>
                </div>
              )}
            </div>

            <div className="animate-in fade-in-50 duration-300 delay-500">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL (Opcional)
              </label>
              <Input
                value={formData.webhook}
                onChange={(e) => setFormData({ ...formData, webhook: e.target.value })}
                placeholder="https://seusite.com/webhook"
                className="transition-all duration-200 focus:scale-[1.01]"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL para receber notificações de mensagens (deixe em branco para usar padrão)
              </p>
            </div>

            <div className="animate-in fade-in-50 duration-300 delay-600">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload de Arquivos para Treinamento
                {userPlan === 'free' && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    <Lock className="w-3 h-3 mr-1" />
                    Pro/Ultra
                  </span>
                )}
              </label>
              <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${
                userPlan === 'free' 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-brand-green cursor-pointer'
              }`}>
                <input
                  type="file"
                  multiple
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={userPlan === 'free'}
                />
                <label htmlFor="file-upload" className={userPlan === 'free' ? 'cursor-not-allowed' : 'cursor-pointer'}>
                  <Upload className={`mx-auto h-8 w-8 mb-2 ${userPlan === 'free' ? 'text-gray-300' : 'text-gray-400'}`} />
                  <p className={`text-sm ${userPlan === 'free' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {userPlan === 'free' 
                      ? 'Upload de arquivos disponível nos planos Pro e Ultra'
                      : 'Clique para fazer upload de arquivos PDF ou TXT'
                    }
                  </p>
                  {userPlan !== 'free' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Estes arquivos ajudarão a treinar seu agente
                    </p>
                  )}
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg animate-in slide-in-from-left-1 duration-200">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="animate-in fade-in-50 duration-300 delay-700">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dados de Treinamento Adicionais
              </label>
              <Textarea
                value={formData.training_data}
                onChange={(e) => setFormData({ ...formData, training_data: e.target.value })}
                placeholder="Cole aqui informações sobre seu negócio, produtos, serviços, FAQs, etc..."
                rows={4}
                className="transition-all duration-200 focus:scale-[1.01]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Estas informações complementam os arquivos enviados acima
              </p>
            </div>

            <div className="animate-in fade-in-50 duration-300 delay-800">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personalidade do Agente
              </label>
              <Textarea
                value={formData.personality_prompt}
                onChange={(e) => setFormData({ ...formData, personality_prompt: e.target.value })}
                placeholder="Como o agente deve se comportar? Ex: Formal, amigável, técnico..."
                rows={3}
                className="transition-all duration-200 focus:scale-[1.01]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para usar uma personalidade padrão
              </p>
            </div>

            <div className="flex space-x-4 pt-4 animate-in fade-in-50 duration-300 delay-900">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 transition-all duration-200 hover:scale-105"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.name || !formData.business_type || !formData.phone_number}
                className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>
                      {apiStatus === false ? 'Aguardando servidor...' : 'Criando...'}
                    </span>
                  </div>
                ) : (
                  'Criar Agente'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal do QR Code */}
      <Dialog open={showQrModal} onOpenChange={handleCloseQrModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code para conectar seu agente
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            {qrCodeUrl ? (
              <div className="flex justify-center">
                <img 
                  src={qrCodeUrl}
                  alt="QR Code do WhatsApp"
                  style={{ width: '300px', height: '300px' }}
                  className="border rounded-lg shadow-lg"
                  onError={(e) => {
                    console.error('Erro ao carregar QR Code:', e);
                    toast({
                      title: "Erro no QR Code",
                      description: "Erro ao carregar QR code. Verifique se o número está correto.",
                      variant: "destructive"
                    });
                  }}
                  onLoad={() => {
                    console.log('✅ QR Code carregado com sucesso');
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Conectando com WhatsApp...</p>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center space-x-2">
                {connectionStatus === 'connected' ? (
                  <div className="text-center">
                    <div className="text-green-600 font-bold text-lg mb-1">✅ Agente Conectado!</div>
                    <p className="text-green-700 text-sm">Pronto para receber mensagens</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-blue-600 font-medium text-base mb-1">⏳ Aguardando conexão...</div>
                    <p className="text-blue-600 text-sm">
                      Escaneie o QR code com seu WhatsApp
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleRetryQrCode}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Verificar Status
              </Button>
              
              <Button
                onClick={handleCloseQrModal}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAgentModal;
