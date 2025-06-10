
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

    console.log('🚀 MODAL: Iniciando criação do agente...', {
      user: user.email,
      userId: user.id,
      agentName: formData.name,
      phoneNumber: formData.phone_number
    });

    try {
      setCreationState('saving');
      setError('');

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        console.error('❌ MODAL: Sessão inválida:', sessionError);
        throw new Error('Sua sessão expirou. Faça login novamente.');
      }

      if (sessionData.session.user.id !== user.id) {
        console.error('❌ MODAL: Usuário da sessão não confere com usuário do contexto');
        throw new Error('Inconsistência na autenticação. Faça login novamente.');
      }

      const numeroNormalizado = normalizarNumero(formData.phone_number);
      const numeroCompleto = numeroNormalizado.startsWith('+') ? numeroNormalizado : `+${numeroNormalizado}`;
      
      const { data: existingAgent, error: checkError } = await supabase
        .from('agents')
        .select('id, phone_number')
        .eq('phone_number', numeroCompleto)
        .maybeSingle();

      if (checkError) {
        console.error('❌ MODAL: Erro ao verificar número existente:', checkError);
      } else if (existingAgent) {
        throw new Error('Já existe um agente cadastrado com este número de telefone.');
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

      const { data: agentData, error: insertError } = await supabase
        .from('agents')
        .insert(agentPayload)
        .select()
        .single();

      if (insertError) {
        console.error('❌ MODAL: Erro do Supabase ao inserir agente:', insertError);
        
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

      // ✅ ETAPA 1: Aguardar criação do agente no backend
      setCreationState('creating_zapagent');
      
      console.log('🔄 MODAL: Criando agente na API ZapAgent...');
      const apiResponse = await ZapAgentService.createAgent({
        numero: numeroCompleto,
        nome: formData.name.trim(),
        tipo: formData.business_type,
        descricao: formData.description.trim() || '',
        prompt: formData.personality_prompt.trim() || '',
        plano: 'free'
      });

      console.log('✅ MODAL: Agente criado na API:', apiResponse);

      // ✅ Se já veio QR na resposta da criação
      if (apiResponse.qrcodeUrl) {
        console.log('🎯 MODAL: QR code já disponível na resposta da criação!');
        // Tratar URL relativa do backend
        const fullQrUrl = apiResponse.qrcodeUrl.startsWith('/') 
          ? `https://zapagent-bot.onrender.com${apiResponse.qrcodeUrl}`
          : apiResponse.qrcodeUrl;
        setQrcodeUrl(fullQrUrl);
        setCreationState('success');
        onAgentCreated();
        return;
      }

      // ✅ ETAPA 2: Iniciar polling manual até o QR ficar pronto
      setCreationState('awaiting_qr');
      console.log('🔄 MODAL: Iniciando polling do QR code...');

      const maxTentativas = 20;
      for (let i = 1; i <= maxTentativas; i++) {
        console.log(`🔍 MODAL: Tentando buscar QR code... tentativa ${i}/${maxTentativas}`);

        try {
          const qrResponse = await ZapAgentService.getQrCode(numeroCompleto);

          // ✅ Agente já conectado
          if (qrResponse.conectado === true) {
            console.log('✅ MODAL: Agente já está conectado!');
            setCreationState('success');
            onAgentCreated();
            return;
          }

          // ✅ QR code disponível
          if (qrResponse.qr_code) {
            console.log('✅ MODAL: QR code obtido com sucesso!');
            setQrcodeUrl(qrResponse.qr_code);
            setCreationState('success');
            onAgentCreated();
            return;
          }

          // ⏳ QR ainda não pronto - continuar tentando
          console.log('⏳ MODAL: QR ainda não pronto, aguardando...', qrResponse.message || 'Sem mensagem');
        } catch (qrError) {
          console.log(`⏰ MODAL: Erro ao buscar QR (tentativa ${i}):`, qrError);
          // Continuar tentando mesmo com erro
        }

        // Aguardar 500ms antes da próxima tentativa (exceto na última)
        if (i < maxTentativas) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // ⚠️ Máximo de tentativas atingido
      console.log('⚠️ MODAL: Máximo de tentativas atingido, mas agente foi criado');
      toast({
        title: "QR Code ainda não disponível",
        description: "Você pode tentar novamente manualmente no painel do agente.",
        variant: "default"
      });
      setCreationState('success');
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
