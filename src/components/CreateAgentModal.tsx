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
import { Loader2, Bot, Phone, Building, FileText, Brain } from 'lucide-react';

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
  
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    console.log('🚀 MODAL: Iniciando criação do agente...', {
      user: user.email,
      userId: user.id,
      agentName: formData.name,
      phoneNumber: formData.phone_number
    });

    try {
      // Verificar sessão ativa e obter token atualizado
      console.log('🔐 MODAL: Verificando sessão e obtendo token...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session) {
        console.error('❌ MODAL: Sessão inválida:', sessionError);
        toast({
          title: "Sessão expirada",
          description: "Sua sessão expirou. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ MODAL: Sessão ativa confirmada para:', sessionData.session.user.email);
      console.log('🔑 MODAL: Token JWT obtido, expira em:', new Date(sessionData.session.expires_at! * 1000));

      // Verificar se o usuário autenticado é o mesmo
      if (sessionData.session.user.id !== user.id) {
        console.error('❌ MODAL: Usuário da sessão não confere com usuário do contexto');
        toast({
          title: "Erro de autenticação",
          description: "Inconsistência na autenticação. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      // Normalizar número de telefone
      const numeroNormalizado = normalizarNumero(formData.phone_number);
      const numeroCompleto = numeroNormalizado.startsWith('+') ? numeroNormalizado : `+${numeroNormalizado}`;
      
      console.log('📞 MODAL: Número normalizado:', numeroCompleto);

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
        toast({
          title: "Número já em uso",
          description: "Já existe um agente cadastrado com este número de telefone.",
          variant: "destructive"
        });
        return;
      }

      // Criar agente no Supabase
      console.log('💾 MODAL: Salvando agente no Supabase...');
      console.log('🔄 MODAL: Executando inserção na tabela agents...');
      
      const { data: agentData, error: insertError } = await supabase
        .from('agents')
        .insert(agentPayload)
        .select()
        .single();

      if (insertError) {
        console.error('❌ MODAL: Erro do Supabase ao inserir agente:', insertError);
        console.error('📋 MODAL: Payload que causou erro:', agentPayload);
        console.error('🔍 MODAL: Detalhes do erro:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });

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

        toast({
          title: "❌ Erro ao criar agente",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ MODAL: Agente salvo no Supabase:', agentData);

      // Registrar agente na API ZapAgent
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
      } catch (apiError) {
        console.warn('⚠️ MODAL: Erro na API ZapAgent (continuando):', apiError);
        // Não bloquear a criação se a API externa falhar
      }

      // Sucesso
      console.log('🎉 MODAL: Agente criado com sucesso!');
      toast({
        title: "✅ Agente criado com sucesso!",
        description: `${formData.name} foi criado e está sendo configurado.`,
        variant: "default"
      });

      // Reset form e fechar modal
      setFormData({
        name: '',
        description: '',
        business_type: '',
        phone_number: '',
        training_data: '',
        personality_prompt: ''
      });

      onAgentCreated();
      onClose();

    } catch (error: any) {
      console.error('❌ MODAL: Erro geral na criação do agente:', error);
      
      let errorMessage = 'Erro inesperado ao criar agente';
      
      if (error.message?.includes('JWT expired') || error.message?.includes('Unauthorized')) {
        errorMessage = 'Sua sessão expirou. Faça login novamente.';
      } else if (error.message?.includes('permission denied') || error.message?.includes('access denied')) {
        errorMessage = 'Acesso negado. Verifique suas permissões.';
      } else if (error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        errorMessage = 'Já existe um agente com este número de telefone.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "❌ Erro ao criar agente",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Bot className="h-6 w-6 mr-2 text-brand-green" />
            Criar Novo Agente
          </DialogTitle>
        </DialogHeader>

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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-green hover:bg-brand-green/90"
            >
              {loading ? (
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
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentModal;
