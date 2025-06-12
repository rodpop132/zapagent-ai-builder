
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
    
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
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

    const trimmedPhone = formData.phone_number.trim();
    if (!trimmedPhone) {
      toast({
        title: "Número obrigatório",
        description: "Por favor, insira o número do WhatsApp.",
        variant: "destructive"
      });
      return false;
    }

    const numeroNormalizado = normalizarNumero(trimmedPhone);
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
      agentName: formData.name.trim(),
      phoneNumber: formData.phone_number.trim(),
      personalityPrompt: formData.personality_prompt.trim()
    });

    try {
      setCreationState('saving');
      setError('');

      // Verificar sessão válida
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session || sessionData.session.user.id !== user.id) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      const numeroNormalizado = normalizarNumero(formData.phone_number.trim());
      const numeroCompleto = numeroNormalizado.startsWith('+') ? numeroNormalizado : `+${numeroNormalizado}`;

      // Verificar se já existe agente com este número
      const { data: existingAgent } = await supabase
        .from('agents')
        .select('id')
        .eq('phone_number', numeroCompleto)
        .maybeSingle();

      if (existingAgent) {
        throw new Error('Já existe um agente com este número de telefone.');
      }

      // Salvar no Supabase primeiro
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
        console.error('❌ Erro do Supabase:', insertError);
        throw new Error(insertError.message || 'Erro inesperado ao salvar agente no banco de dados');
      }

      setCreationState('creating_zapagent');

      // Construir o prompt conforme especificado no checklist
      const promptValue = `${formData.training_data.trim() || ''}\n\n${formData.personality_prompt.trim() || ''}`.trim() || 
        "Você é um atendente simpático e rápido. Responda de forma educada e ajude o cliente da melhor forma possível.";

      // Criar payload para API externa seguindo exatamente o padrão especificado
      const zapAgentPayload = {
        user_id: user.id,
        numero: numeroCompleto.replace(/\D/g, ''), // apenas dígitos
        nome: formData.name.trim(),
        tipo: formData.business_type,
        descricao: formData.description.trim() || '',
        prompt: promptValue,
        plano: 'gratuito', // ou 'pro', 'ultra' baseado na assinatura
        webhook: null
      };

      console.log('📦 Enviando payload para ZapAgent conforme checklist:', zapAgentPayload);

      // Chamar API externa
      const apiResponse = await ZapAgentService.createAgent(zapAgentPayload);

      console.log('✅ API respondeu com sucesso:', apiResponse);

      // Verificar se a resposta foi bem-sucedida
      if (apiResponse.status === 'error' || apiResponse.error) {
        const errorMsg = apiResponse.error || 'Erro desconhecido na API externa';
        throw new Error(`Falha na API externa: ${errorMsg}`);
      }

      // Caso o QR code já venha na resposta
      if (apiResponse.qrcodeUrl) {
        setQrcodeUrl(apiResponse.qrcodeUrl);
        setCreationState('success');
        toast({
          title: "✅ Agente criado com sucesso!",
          description: `${formData.name.trim()} foi criado e está pronto para uso.`,
          variant: "default"
        });
        onAgentCreated();
        return;
      }

      // Caso contrário, iniciar polling para buscar o QR
      setCreationState('awaiting_qr');

      const maxTentativas = 20;
      for (let i = 1; i <= maxTentativas; i++) {
        console.log(`🔁 Buscando QR (${i}/${maxTentativas})...`);
        
        try {
          const qrResponse = await ZapAgentService.getQrCode(numeroCompleto);

          if (qrResponse.conectado) {
            setCreationState('success');
            toast({
              title: "✅ WhatsApp já conectado",
              description: "O número já estava ativo e funcionando.",
              variant: "default"
            });
            onAgentCreated();
            return;
          }

          if (qrResponse.qr_code) {
            setQrcodeUrl(qrResponse.qr_code);
            setCreationState('success');
            toast({
              title: "✅ Agente criado com sucesso!",
              description: `${formData.name.trim()} foi criado. Escaneie o QR Code para ativar o WhatsApp.`,
              variant: "default"
            });
            onAgentCreated();
            return;
          }
        } catch (qrError: any) {
          console.warn(`⚠️ Tentativa ${i} falhou:`, qrError.message);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Se chegou até aqui, não conseguimos o QR a tempo
      toast({
        title: "⚠️ QR Code ainda não disponível",
        description: "Agente criado com sucesso, mas o QR Code ainda está sendo gerado. Verifique novamente no painel.",
        variant: "default"
      });

      setCreationState('success');
      onAgentCreated();

    } catch (error: any) {
      console.error('❌ Erro ao criar agente:', error);
      setCreationState('error');
      
      let errorMessage = 'Erro desconhecido';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.message?.includes('user_id, número ou prompt ausente')) {
        errorMessage = 'Dados obrigatórios ausentes. Verifique se todos os campos estão preenchidos.';
      } else if (error.message?.includes('NetworkError')) {
        errorMessage = 'Erro de conexão: A API pode estar offline. Tente novamente em alguns momentos.';
      }
      
      setError(errorMessage);
      
      toast({
        title: "❌ Erro ao criar agente",
        description: errorMessage,
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
