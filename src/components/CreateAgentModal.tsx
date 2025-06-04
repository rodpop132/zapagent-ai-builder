import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, QrCode, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
    personality_prompt: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'connected' | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [qrGenerationAttempts, setQrGenerationAttempts] = useState(0);
  const [userPlan, setUserPlan] = useState<string>('free');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Verifica se o usuário tem plano Pro ou Ultra
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
      console.log('📋 Plano do usuário obtido:', plan, 'Is unlimited:', data?.is_unlimited);
      setUserPlan(plan);
      return plan;
    } catch (error) {
      console.error('Error getting user plan:', error);
      setUserPlan('free');
      return 'free';
    }
  };

  // Carregar plano do usuário quando o modal abrir
  React.useEffect(() => {
    if (isOpen) {
      getUserPlan();
    }
  }, [isOpen]);

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
      console.log('🚀 STEP 2: Iniciando criação do agente na API externa');
      
      const userPlan = await getUserPlan();
      console.log('📋 STEP 2.1: Plano do usuário obtido:', userPlan);
      
      // Mapear plano para os valores aceitos pela API
      let planValue = 'gratuito';
      if (userPlan === 'pro') planValue = 'standard';
      if (userPlan === 'ultra') planValue = 'ultra';
      
      console.log('📋 STEP 2.2: Plano mapeado para API:', planValue);
      console.log('📞 STEP 2.3: Número completo com DDI:', formData.phone_number);
      
      // Verificar se o número tem DDI
      if (!formData.phone_number || formData.phone_number.length < 10) {
        console.error('❌ STEP 2.3 ERROR: Número inválido');
        throw new Error('Número do WhatsApp deve incluir o código do país (DDI)');
      }
      
      const payload = {
        nome: formData.name,
        tipo: formData.business_type,
        descricao: formData.description,
        prompt: formData.personality_prompt || `Você é um assistente virtual para ${formData.business_type}. Seja sempre educado, prestativo e responda de forma clara e objetiva.`,
        numero: formData.phone_number,
        plano: planValue
      };

      console.log('📦 STEP 2.4: Payload completo preparado:', JSON.stringify(payload, null, 2));
      console.log('🔗 STEP 2.5: URL da API:', 'https://zapagent-bot.onrender.com/zapagent');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.error('⏰ STEP 2.6 TIMEOUT: Requisição cancelada por timeout (45s)');
        controller.abort();
      }, 45000);
      
      const startTime = performance.now();
      console.log('📡 STEP 2.7: Enviando requisição para API externa...');
      
      const response = await fetch('https://zapagent-bot.onrender.com/zapagent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();

      console.log(`⏱️ STEP 2.8: Tempo de resposta: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('📊 STEP 2.9: Status da resposta:', response.status);
      console.log('📊 STEP 2.10: Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ STEP 2.11 ERROR: Resposta não OK:', response.status, errorText);
        
        if (response.status === 403) {
          throw new Error('Número já está sendo usado em outra conta ou serviço. Use um número diferente.');
        } else if (response.status === 429) {
          throw new Error('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        } else if (response.status >= 500) {
          throw new Error('Servidor temporariamente indisponível. Tente novamente em alguns minutos.');
        }
        
        throw new Error(`Erro ${response.status}: ${errorText || response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📥 STEP 2.12: Resposta bruta recebida:', responseText.substring(0, 500));
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ STEP 2.13 SUCCESS: JSON parseado com sucesso:', result);
      } catch (parseError) {
        console.error('❌ STEP 2.13 ERROR: Erro ao parsear JSON:', parseError);
        console.error('❌ STEP 2.13 ERROR: Resposta que falhou no parse:', responseText.substring(0, 200));
        throw new Error(`Resposta inválida do servidor: ${responseText.substring(0, 100)}`);
      }

      return result;
    } catch (error) {
      console.error('🚨 STEP 2 FINAL ERROR na createAgentAPI:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A requisição demorou muito para responder. Tente novamente.');
      }
      
      if (error.message && error.message.includes('fetch')) {
        console.error('🌐 STEP 2 NETWORK ERROR: Problema de conectividade detectado');
        throw new Error('Erro de conectividade. Verifique sua internet e tente novamente.');
      }
      
      throw error;
    }
  };

  const checkConnectionStatus = async () => {
    try {
      console.log('🔍 Verificando status de conexão para:', formData.phone_number);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // Usar a nova rota de status
      const response = await fetch(`https://zapagent-bot.onrender.com/status?numero=${encodeURIComponent(formData.phone_number)}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('❌ Erro na verificação de status:', response.status);
        return false;
      }
      
      const statusData = await response.json();
      console.log('📊 Status recebido:', statusData);
      
      if (statusData.conectado === true) {
        setConnectionStatus('connected');
        stopStatusPolling();
        
        // Atualizar status no banco de dados
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

  const startStatusPolling = () => {
    console.log('🔄 Iniciando polling de status a cada 5 segundos...');
    
    // Verificar imediatamente após 5 segundos
    setTimeout(() => {
      checkConnectionStatus();
    }, 5000);
    
    // Depois verificar a cada 5 segundos
    const interval = setInterval(checkConnectionStatus, 5000);
    setStatusCheckInterval(interval);
    
    // Parar após 5 minutos
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

  const fetchQrCode = async (attempt = 1, maxAttempts = 5) => {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxAttempts} - Buscando QR code para número:`, formData.phone_number);
      
      if (attempt > maxAttempts) {
        throw new Error('Número máximo de tentativas atingido. O QR code pode não ter sido gerado ainda.');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const qrUrl = `https://zapagent-bot.onrender.com/qrcode?numero=${encodeURIComponent(formData.phone_number)}`;
      console.log('🔗 URL completa do QR:', qrUrl);
      
      const response = await fetch(qrUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/html',
          'Cache-Control': 'no-cache',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta do QR code:', response.status, errorText);
        
        if (errorText.includes('QR não encontrado') && attempt < maxAttempts) {
          const waitTime = Math.min(attempt * 3000, 10000);
          console.log(`⏳ QR ainda não gerado, tentando novamente em ${waitTime/1000} segundos...`);
          setTimeout(() => fetchQrCode(attempt + 1, maxAttempts), waitTime);
          return;
        }
        
        throw new Error('QR code ainda não foi gerado. Aguarde alguns segundos e tente manualmente.');
      }
      
      const htmlContent = await response.text();
      console.log('📄 HTML QR recebido (primeiros 200 chars):', htmlContent.substring(0, 200));
      
      // Verificar se retornou mensagem de QR não encontrado
      if (htmlContent.includes('QR não encontrado')) {
        if (attempt < maxAttempts) {
          const waitTime = Math.min(attempt * 3000, 10000);
          console.log(`⏳ QR ainda não gerado, tentando novamente em ${waitTime/1000} segundos...`);
          setTimeout(() => fetchQrCode(attempt + 1, maxAttempts), waitTime);
          return;
        }
        throw new Error('QR code ainda não foi gerado. Tente atualizar manualmente.');
      }
      
      // Extrair a imagem base64 do HTML
      const imgMatch = htmlContent.match(/src\s*=\s*["'](data:image\/[^;]+;base64,[^"']+)["']/i);
      
      if (imgMatch && imgMatch[1] && imgMatch[1].startsWith('data:image/') && imgMatch[1].includes('base64,')) {
        console.log('✅ QR code válido extraído, primeiros 100 chars:', imgMatch[1].substring(0, 100));
        setQrCodeUrl(imgMatch[1]);
        setQrGenerationAttempts(0);
        setShowQrModal(true);
        startStatusPolling(); // Iniciar polling após mostrar QR
      } else {
        console.error('❌ QR code não encontrado ou inválido no HTML');
        if (attempt < maxAttempts) {
          const waitTime = Math.min(attempt * 4000, 15000);
          console.log(`🔄 Tentando novamente em ${waitTime/1000} segundos...`);
          setTimeout(() => fetchQrCode(attempt + 1, maxAttempts), waitTime);
          return;
        }
        throw new Error('QR code ainda não foi gerado ou está em formato inválido. Tente atualizar manualmente.');
      }
    } catch (error) {
      console.error('💥 Erro ao buscar QR code:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Timeout: QR code demorou muito para carregar');
      }
      
      if (attempt < maxAttempts) {
        const waitTime = Math.min(attempt * 4000, 15000);
        console.log(`🔄 Erro na tentativa ${attempt}, tentando novamente em ${waitTime/1000} segundos...`);
        setTimeout(() => fetchQrCode(attempt + 1, maxAttempts), waitTime);
        return;
      }
      
      toast({
        title: "Erro no QR Code",
        description: error instanceof Error ? error.message : "Falha ao gerar QR code. Tente novamente manualmente.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🎯 MAIN PROCESS: Iniciando criação completa do agente...');
      console.log('📞 MAIN PROCESS: Número do telefone recebido:', formData.phone_number);
      console.log('👤 MAIN PROCESS: Usuário logado:', user?.email);
      
      // Validação dos dados obrigatórios
      console.log('🔍 VALIDATION: Validando dados obrigatórios...');
      if (!formData.name.trim()) {
        console.error('❌ VALIDATION ERROR: Nome vazio');
        throw new Error('Nome do agente é obrigatório');
      }
      if (!formData.business_type) {
        console.error('❌ VALIDATION ERROR: Tipo de negócio vazio');
        throw new Error('Tipo de negócio é obrigatório');
      }
      if (!formData.phone_number.trim()) {
        console.error('❌ VALIDATION ERROR: Número vazio');
        throw new Error('Número do WhatsApp é obrigatório');
      }

      if (formData.phone_number.length < 10) {
        console.error('❌ VALIDATION ERROR: Número muito curto');
        throw new Error('Número deve incluir o código do país (DDI) e ter pelo menos 10 dígitos');
      }
      console.log('✅ VALIDATION SUCCESS: Todos os dados obrigatórios estão preenchidos');

      // STEP 1: Verificar disponibilidade do número
      await checkPhoneNumberAvailability(formData.phone_number);

      // STEP 2: Criar agente na API externa
      console.log('📡 MAIN PROCESS: Iniciando STEP 2 - Criação na API externa');
      await createAgentAPI();
      console.log('✅ MAIN PROCESS: STEP 2 completado com sucesso');

      // STEP 3: Salvar no Supabase
      console.log('💾 STEP 3: Salvando no banco de dados local...');
      const { error: supabaseError } = await supabase
        .from('agents')
        .insert({
          ...formData,
          training_data: formData.training_data,
          user_id: user?.id,
          personality_prompt: formData.personality_prompt || `Você é um assistente virtual para ${formData.business_type}. Seja sempre educado, prestativo e responda de forma clara e objetiva.`,
          whatsapp_status: 'pending'
        });

      if (supabaseError) {
        console.error('❌ STEP 3 ERROR: Erro no Supabase:', supabaseError);
        throw new Error(`Erro ao salvar no banco de dados: ${supabaseError.message}`);
      }

      console.log('✅ STEP 3 SUCCESS: Agente salvo no banco local com sucesso');

      toast({
        title: "Agente criado com sucesso!",
        description: "Aguarde alguns segundos para o QR code aparecer..."
      });

      // STEP 4: Aguardar e buscar QR code
      console.log('⏳ STEP 4: Aguardando 8 segundos antes de buscar QR code...');
      setTimeout(async () => {
        console.log('🔄 STEP 4: Iniciando busca do QR code...');
        await fetchQrCode(1, 5);
      }, 8000);

      onAgentCreated();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        business_type: '',
        phone_number: '',
        training_data: '',
        personality_prompt: ''
      });
      setUploadedFiles([]);

    } catch (error) {
      console.error('💥 MAIN PROCESS FINAL ERROR: Erro completo na criação do agente:', error);
      console.error('💥 MAIN PROCESS ERROR STACK:', error.stack);
      
      if (error instanceof Error) {
        console.error('💥 MAIN PROCESS ERROR MESSAGE:', error.message);
        toast({
          title: "Erro na Criação do Agente",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.error('💥 MAIN PROCESS UNKNOWN ERROR:', error);
        toast({
          title: "Erro Inesperado",
          description: "Ocorreu um erro inesperado. Verifique o console para mais detalhes.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (fullNumber: string) => {
    console.log('📱 Número atualizado no input:', fullNumber);
    setFormData({ ...formData, phone_number: fullNumber });
  };

  const handleCloseQrModal = () => {
    setShowQrModal(false);
    stopStatusPolling();
    onClose();
  };

  const handleRetryQrCode = () => {
    setQrGenerationAttempts(prev => prev + 1);
    setQrCodeUrl('');
    console.log('🔄 Tentativa manual de atualizar QR Code...');
    fetchQrCode(1, 3); // Menos tentativas para retry manual
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
          <DialogHeader>
            <DialogTitle>Criar Novo Agente</DialogTitle>
            <DialogDescription>
              Configure seu agente de IA para atendimento automático no WhatsApp
            </DialogDescription>
          </DialogHeader>

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
                className="transition-all duration-200 focus:scale-[1.01]"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ IMPORTANTE: Selecione o país correto. O número deve incluir o DDI (código do país) para o QR code funcionar.
              </p>
              {formData.phone_number && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Número com DDI: {formData.phone_number}
                </p>
              )}
            </div>

            <div className="animate-in fade-in-50 duration-300 delay-500">
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

            <div className="animate-in fade-in-50 duration-300 delay-600">
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

            <div className="animate-in fade-in-50 duration-300 delay-700">
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

            <div className="flex space-x-4 pt-4 animate-in fade-in-50 duration-300 delay-800">
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
                    <span>Criando...</span>
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
              Escaneie o QR Code abaixo com seu WhatsApp para conectar o agente
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            {qrCodeUrl ? (
              <div className="flex justify-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code do WhatsApp" 
                  className="max-w-full h-auto border rounded-lg shadow-lg"
                  onError={(e) => {
                    console.error('❌ Erro ao carregar imagem do QR code');
                  }}
                  onLoad={() => {
                    console.log('✅ QR code carregado com sucesso na UI');
                  }}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Gerando QR Code...</p>
                </div>
              </div>
            )}
            
            {/* Status de conexão com visual melhorado */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center space-x-2">
                {connectionStatus === 'connected' ? (
                  <div className="text-center">
                    <div className="text-green-600 font-bold text-lg mb-1">✅ Agente Conectado!</div>
                    <p className="text-green-700 text-sm">Pronto para receber mensagens</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-blue-600 font-medium text-base mb-1">⏳ Aguardando conexão com o WhatsApp...</div>
                    <p className="text-blue-600 text-sm">Escaneie o QR code acima para conectar</p>
                    <div className="flex justify-center mt-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
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
                {qrCodeUrl ? 'Atualizar QR Code' : 'Tentar Novamente'}
              </Button>
              
              <Button
                onClick={checkConnectionStatus}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Verificar Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAgentModal;
