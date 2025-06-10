
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Phone, Building, FileText, Brain } from 'lucide-react';
import CountryPhoneInput from '../CountryPhoneInput';

interface FormData {
  name: string;
  description: string;
  business_type: string;
  phone_number: string;
  training_data: string;
  personality_prompt: string;
}

interface AgentFormFieldsProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string) => void;
  disabled: boolean;
}

const AgentFormFields = ({ formData, onInputChange, disabled }: AgentFormFieldsProps) => {
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

  return (
    <div className="space-y-6">
      {/* Nome do Agente */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center">
          <Bot className="h-4 w-4 mr-2" />
          Nome do Agente *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Ex: Assistente da Loja XYZ"
          required
          disabled={disabled}
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
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Breve descrição do agente"
          disabled={disabled}
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
          onValueChange={(value) => onInputChange('business_type', value)}
          disabled={disabled}
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
          onChange={(value) => onInputChange('phone_number', value)}
          placeholder="Digite o número do WhatsApp"
          disabled={disabled}
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
          onChange={(e) => onInputChange('training_data', e.target.value)}
          placeholder="Informações sobre seus produtos, serviços, preços, políticas, etc."
          rows={4}
          disabled={disabled}
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
          onChange={(e) => onInputChange('personality_prompt', e.target.value)}
          placeholder="Ex: Seja sempre educado, use emojis, responda de forma amigável..."
          rows={3}
          disabled={disabled}
        />
        <p className="text-xs text-gray-600">
          Como o agente deve se comportar nas conversas
        </p>
      </div>
    </div>
  );
};

export default AgentFormFields;
