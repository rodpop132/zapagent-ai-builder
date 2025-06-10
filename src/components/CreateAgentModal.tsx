import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { executeWithJWTHandling } from '@/utils/authUtils';
import { ZapAgentService } from '@/services/zapAgentService';
import CountryPhoneInput from './CountryPhoneInput';
import { normalizarNumero, validarNumero } from '@/utils/phoneUtils';
import { Loader2, Bot, Phone, Building, FileText, Brain, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: () => void;
}

interface FormData {
  name: string;
  description: string;
  business_type: string;
  phone_number: string;
  training_data: string;
  personality_prompt: string;
}

type CreationState = 'idle' | 'saving' | 'creating_zapagent' | 'awaiting_qr' | 'success' | 'error';

const CreateAgentModal = ({ isOpen, onClose, onAgentCreated }: CreateAgentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    business_type: '',
    phone_number: '',
    training_data: '',
    personality_prompt: ''
  });
  
  const [creationState, setCreationState] = useState<CreationState>('idle');
  const [qrcodeUrl, setQrcodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const businessTypes = [
    { value: 'ecommerce', label: 'E-commerce / Loja Online' },
    { value: 'servicos', label: 'Prestação de Serviços' },
    { value: 'consultoria', label: 'Consultoria' },
    { value: 'saude', label: 'Saúde e Bem-estar' },
    { value: 'educacao', label: 'Educação' },
    { value: 'imobiliario', label: 'Imobiliário' },
    { value: 'restaurante', label: 'Restaurante / Food' },
    { value: 'beleza', label: 'Beleza e Estética' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'outros', label: 'Outros' }
  ];

  const validateForm = (): boolean => {
    console.log('🔍 MODAL: Validando formulário...', formData);
    
    if (!formData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira o nome do agente.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.business_type) {
      toast({
        title: "Tipo de negócio obrigatório",
        description: "Por favor, selecione o tipo de negócio.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.phone_number.trim()) {
      toast({
        title: "Número obrigatório",
        description: "Por favor, insira o número do WhatsApp.",
        variant: "destructive"
      });
      return false;
    }

    const numeroNormalizado = normalizarNumero(formData.phone_number);
    if (!validarNumero(numeroNormalizado)) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de telefone válido com pelo menos 10 dígitos.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  // Função melhorada para verificar QR code com retry - CORRIGIDA
  const checkQrCodeWithRetry = async (numeroCompleto: string, maxTentativas = 5) => {
    let tentativas = 0;
    
    const interval = setInterval(async () => {
      tentativas++;
      console.log(`🔄 MODAL: Tentativa ${tentativas}/${maxTentativas} para obter QR code...`);
      
      try {
        const qrResponse = await ZapAgentService.getQrCode(numeroCompleto);
        if (qrResponse.qr_code) {
          console.log('✅ MODAL: QR code obtido com sucesso!');
          clearInterval(interval);
          setQrcodeUrl(qrResponse.qr_code); // Agora definimos o base64 real
          setCreationState('success');
        }
      } catch (qrError) {
        console.log(`⏰ MODAL: QR ainda não pronto (tentativa ${tentativas})`);
      }
      
      if (tentativas >= maxTentativas) {
        console.log('⚠️ MODAL: Máximo de tentativas atingido, mas agente foi criado');
        clearInterval(interval);
        setCreationState('success');
      }
    }, 2000); // Verificar a cada 2 segundos
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    console.log('🚀 MODAL: Iniciando criação do agente...', {
      user: user.email,
      userId: user.id,
      agentName: formData.name,
      phoneNumber: formData.phone_number
    });

    try {
      // 1. Primeiro salvar no Supabase
      setCreationState('saving');
      setError('');

      // Verificar sessão ativa e obter token atualizado
      console.log('🔐 MODAL: Verificando sessão e obtendo token...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        console.error('❌ MODAL: Sessão inválida:', sessionError);
        throw new Error('Sua sessão expirou. Faça login novamente.');
      }

      console.log('✅ MODAL: Sessão ativa confirmada para:', sessionData.session.user.email);

      // Verificar se o usuário autenticado é o mesmo
      if (sessionData.session.user.id !== user.id) {
        console.error('❌ MODAL: Usuário da sessão não confere com usuário do contexto');
        throw new Error('Inconsistência na autenticação. Faça login novamente.');
      }

      // Normalizar número de telefone
      const numeroNormalizado = normalizarNumero(formData.phone_number);
      const numeroCompleto = numeroNormalizado.startsWith('+') ? numeroNormalizado : `+${numeroNormalizado}`;
      
      console.log('📞 MODAL: Número normalizado:', numeroCompleto);

      // Verificar se já existe agente com mesmo número
      console.log('🔍 MODAL: Verificando se número já existe...');
      const { data: existingAgent, error: checkError } = await supabase
        .from('agents')
        .select('id, phone_number')
        .eq('phone_number', numeroCompleto)
        .maybeSingle();

      if (checkError) {
        console.error('❌ MODAL: Erro ao verificar número existente:', checkError);
      } else if (existingAgent) {
        console.log('⚠️ MODAL: Número já existe:', existingAgent);
        throw new Error('Já existe um agente cadastrado com este número de telefone.');
      }

      // Preparar dados do agente
      const agentPayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        business_type: formData.business_type,
        phone_number: numeroCompleto,
        training_data: formData.training_data.trim() || null,
        personality_prompt: formData.personality_prompt.trim() || null,
        user_id: user.id,
        whatsapp_status: 'pending',
        is_active: true
      };

      console.log('📋 MODAL: Payload para inserção:', agentPayload);

      // Criar agente no Supabase
      console.log('💾 MODAL: Salvando agente no Supabase...');
      const { data: agentData, error: insertError } = await supabase
        .from('agents')
        .insert(agentPayload)
        .select()
        .single();

      if (insertError) {
        console.error('❌ MODAL: Erro do Supabase ao inserir agente:', insertError);
        
        // Tratamento específico de erros
        let errorMessage = 'Erro inesperado ao criar agente';
        
        if (insertError.code === '23505') {
          errorMessage = 'Já existe um agente com este número de telefone.';
        } else if (insertError.code === '42501') {
          errorMessage = 'Permissão negada. Verifique se você está logado corretamente.';
        } else if (insertError.message?.includes('JWT')) {
          errorMessage = 'Sua sessão expirou. Faça login novamente.';
        } else if (insertError.message?.includes('RLS')) {
          errorMessage = 'Erro de permissão. Contate o suporte.';
        } else if (insertError.message) {
          errorMessage = insertError.message;
        }

        throw new Error(errorMessage);
      }

      console.log('✅ MODAL: Agente salvo no Supabase:', agentData);

      // 2. Depois criar agente na API ZapAgent
      setCreationState('creating_zapagent');
      console.log('🤖 MODAL: Registrando agente na API ZapAgent...');
      
      try {
        const apiResponse = await ZapAgentService.createAgent({
          numero: numeroCompleto,
          nome: formData.name.trim(),
          tipo: formData.business_type,
          descricao: formData.description.trim() || '',
          prompt: formData.personality_prompt.trim() || '',
          plano: 'free'
        });

        console.log('✅ MODAL: Agente registrado na API ZapAgent:', apiResponse);

        // 3. Agora aguardar QR code com retry melhorado - CORRIGIDO
        setCreationState('awaiting_qr');
        // NÃO definimos qrcodeUrl aqui, só após obter o QR real
        
        // Iniciar verificação com retry
        checkQrCodeWithRetry(numeroCompleto);

      } catch (apiError) {
        console.warn('⚠️ MODAL: Erro na API ZapAgent, mas agente foi salvo:', apiError);
        // Mesmo com erro na API externa, consideramos sucesso
        setCreationState('success');
      }

      // Sucesso
      console.log('🎉 MODAL: Processo de criação iniciado com sucesso!');
      
      onAgentCreated();

    } catch (error: any) {
      console.error('❌ MODAL: Erro geral na criação do agente:', error);
      
      setCreationState('error');
      setError(error.message || 'Erro inesperado ao criar agente');
      
      toast({
        title: "❌ Erro ao criar agente",
        description: error.message || 'Erro inesperado ao criar agente',
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClose = () => {
    // Reset form e estado
    setFormData({
      name: '',
      description: '',
      business_type: '',
      phone_number: '',
      training_data: '',
      personality_prompt: ''
    });
    setCreationState('idle');
    setQrcodeUrl(null);
    setError('');
    onClose();
  };

  const getStateMessage = () => {
    switch (creationState) {
      case 'saving':
        return { icon: Loader2, text: 'Salvando agente...', className: 'text-blue-600' };
      case 'creating_zapagent':
        return { icon: Bot, text: 'Registrando na API...', className: 'text-purple-600' };
      case 'awaiting_qr':
        return { icon: Clock, text: 'Aguardando QR code... (pode demorar até 10s)', className: 'text-orange-600' };
      case 'success':
        return { icon: CheckCircle, text: 'Agente criado com sucesso!', className: 'text-green-600' };
      case 'error':
        return { icon: AlertCircle, text: 'Erro ao criar agente', className: 'text-red-600' };
      default:
        return null;
    }
  };

  const isProcessing = ['saving', 'creating_zapagent', 'awaiting_qr'].includes(creationState);
  const isComplete = creationState === 'success';
  const hasError = creationState === 'error';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Bot className="h-6 w-6 mr-2 text-brand-green" />
            Criar Novo Agente
          </DialogTitle>
        </DialogHeader>

        {/* Status do processo */}
        {(isProcessing || isComplete || hasError) && (
          <div className={`p-4 rounded-lg border ${
            isComplete ? 'bg-green-50 border-green-200' :
            hasError ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            {(() => {
              const state = getStateMessage();
              if (!state) return null;
              const Icon = state.icon;
              return (
                <div className="flex items-center">
                  <Icon className={`h-5 w-5 mr-3 ${state.className} ${isProcessing ? 'animate-spin' : ''}`} />
                  <span className={`font-medium ${state.className}`}>{state.text}</span>
                </div>
              );
            })()}
            
            {hasError && error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            {/* QR Code - CORRIGIDO para usar base64 */}
            {creationState === 'awaiting_qr' && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Agente criado! Aguardando geração do QR code...
                </p>
                {qrcodeUrl ? (
                  <div className="flex justify-center">
                    <img 
                      src={qrcodeUrl.startsWith('data:') ? qrcodeUrl : `data:image/png;base64,${qrcodeUrl}`}
                      alt="QR Code do WhatsApp" 
                      className="w-48 h-48 border rounded-lg"
                      onError={() => {
                        console.log('⏰ Erro ao carregar QR Code');
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <div className="w-48 h-48 border rounded-lg bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Gerando QR Code...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* QR Code quando já está pronto - CORRIGIDO */}
            {isComplete && qrcodeUrl && (
              <div className="mt-4">
                <p className="text-green-700 font-medium mb-3">
                  🎉 Agente "{formData.name}" criado com sucesso!
                </p>
                <p className="text-sm text-green-600 mb-3">
                  Escaneie o QR Code abaixo com seu WhatsApp:
                </p>
                <div className="flex justify-center">
                  <img 
                    src={qrcodeUrl.startsWith('data:') ? qrcodeUrl : `data:image/png;base64,${qrcodeUrl}`}
                    alt="QR Code do WhatsApp" 
                    className="w-48 h-48 border rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  WhatsApp → Menu → Aparelhos conectados → Conectar aparelho
                </p>
              </div>
            )}

            {isComplete && !qrcodeUrl && (
              <div className="mt-4 text-center">
                <p className="text-green-700 font-medium">
                  🎉 Agente "{formData.name}" criado com sucesso!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Você pode configurar o WhatsApp na lista de agentes.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Formulário - só mostra se não estiver em processo ou concluído */}
        {!isProcessing && !isComplete && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Agente */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                Nome do Agente *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Assistente da Loja XYZ"
                required
                disabled={isProcessing || hasError}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Descrição (opcional)
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Breve descrição do agente"
                disabled={isProcessing || hasError}
              />
            </div>

            {/* Tipo de Negócio */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Tipo de Negócio *
              </Label>
              <Select
                value={formData.business_type}
                onValueChange={(value) => handleInputChange('business_type', value)}
                disabled={isProcessing || hasError}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de negócio" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Número do WhatsApp */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Número do WhatsApp *
              </Label>
              <CountryPhoneInput
                value={formData.phone_number}
                onChange={(value) => handleInputChange('phone_number', value)}
                placeholder="Digite o número do WhatsApp"
                disabled={isProcessing || hasError}
              />
              <p className="text-xs text-gray-600">
                Este será o número usado pelo agente para responder mensagens
              </p>
            </div>

            {/* Dados de Treinamento */}
            <div className="space-y-2">
              <Label htmlFor="training_data" className="flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Dados de Treinamento (opcional)
              </Label>
              <Textarea
                id="training_data"
                value={formData.training_data}
                onChange={(e) => handleInputChange('training_data', e.target.value)}
                placeholder="Informações sobre seus produtos, serviços, preços, políticas, etc."
                rows={4}
                disabled={isProcessing || hasError}
              />
              <p className="text-xs text-gray-600">
                Quanto mais informações você fornecer, melhor será o atendimento do agente
              </p>
            </div>

            {/* Personalidade */}
            <div className="space-y-2">
              <Label htmlFor="personality_prompt" className="flex items-center">
                <Brain className="h-4 w-4 mr-2" />
                Personalidade do Agente (opcional)
              </Label>
              <Textarea
                id="personality_prompt"
                value={formData.personality_prompt}
                onChange={(e) => handleInputChange('personality_prompt', e.target.value)}
                placeholder="Ex: Seja sempre educado, use emojis, responda de forma amigável..."
                rows={3}
                disabled={isProcessing || hasError}
              />
              <p className="text-xs text-gray-600">
                Como o agente deve se comportar nas conversas
              </p>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || hasError}
                className="bg-brand-green hover:bg-brand-green/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Criar Agente
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Botões para quando está concluído */}
        {isComplete && (
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={handleClose}
              className="bg-brand-green hover:bg-brand-green/90"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        )}

        {/* Botão para tentar novamente em caso de erro */}
        {hasError && (
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreationState('idle')}
            >
              Tentar Novamente
            </Button>
            <Button
              type="button"
              onClick={handleClose}
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentModal;

}
