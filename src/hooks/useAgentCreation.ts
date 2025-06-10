
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ZapAgentService } from '@/services/zapAgentService';
import { normalizarNumero, validarNumero } from '@/utils/phoneUtils';

interface FormData {
  name: string;
  description: string;
  business_type: string;
  phone_number: string;
  training_data: string;
  personality_prompt: string;
}

type CreationState = 'idle' | 'saving' | 'creating_zapagent' | 'awaiting_qr' | 'success' | 'error';

export const useAgentCreation = () => {
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

  const createAgent = async (onAgentCreated: () => void) => {
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    console.log('🚀 Iniciando criação do agente...', {
      user: user.email,
      userId: user.id,
      agentName: formData.name,
      phoneNumber: formData.phone_number
    });

    try {
      setCreationState('saving');
      setError('');

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session || sessionData.session.user.id !== user.id) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      const numeroNormalizado = normalizarNumero(formData.phone_number);
      const numeroCompleto = numeroNormalizado.startsWith('+') ? numeroNormalizado : `+${numeroNormalizado}`;

      const { data: existingAgent } = await supabase
        .from('agents')
        .select('id')
        .eq('phone_number', numeroCompleto)
        .maybeSingle();

      if (existingAgent) {
        throw new Error('Já existe um agente com este número de telefone.');
      }

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

      const { error: insertError } = await supabase
        .from('agents')
        .insert(agentPayload);

      if (insertError) {
        throw new Error(insertError.message || 'Erro inesperado ao salvar agente');
      }

      setCreationState('creating_zapagent');

      const apiResponse = await ZapAgentService.createAgent({
        numero: numeroCompleto,
        nome: formData.name.trim(),
        tipo: formData.business_type,
        descricao: formData.description.trim() || '',
        prompt: formData.personality_prompt.trim() || '',
        plano: 'free'
      });

      console.log('✅ API respondeu com sucesso:', apiResponse);

      // Caso o QR code já venha de cara
      if (apiResponse.qrcodeUrl) {
        setQrcodeUrl(apiResponse.qrcodeUrl);
        setCreationState('success');
        onAgentCreated();
        return;
      }

      // Caso contrário, iniciar polling manual para buscar o QR
      setCreationState('awaiting_qr');

      const maxTentativas = 20;
      for (let i = 1; i <= maxTentativas; i++) {
        console.log(`🔁 Buscando QR (${i}/${maxTentativas})...`);
        const qrResponse = await ZapAgentService.getQrCode(numeroCompleto);

        if (qrResponse.conectado) {
          setCreationState('success');
          toast({
            title: "WhatsApp já conectado",
            description: "O número já estava ativo.",
            variant: "default"
          });
          onAgentCreated();
          return;
        }

        if (qrResponse.qr_code) {
          setQrcodeUrl(qrResponse.qr_code);
          setCreationState('success');
          onAgentCreated();
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 500)); // aguarda 0.5s
      }

      toast({
        title: "QR Code ainda não disponível",
        description: "Agente criado, mas QR não gerado a tempo. Tente novamente no painel.",
        variant: "destructive"
      });

      setCreationState('success');
      onAgentCreated();

    } catch (error: any) {
      console.error('❌ Erro ao criar agente:', error);
      setCreationState('error');
      setError(error.message || 'Erro desconhecido');
      toast({
        title: "❌ Erro ao criar agente",
        description: error.message || 'Erro inesperado',
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

  const resetForm = () => {
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
  };

  const retry = () => {
    setCreationState('idle');
    setError('');
  };

  return {
    formData,
    creationState,
    qrcodeUrl,
    error,
    handleInputChange,
    createAgent,
    resetForm,
    retry
  };
};
