import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:mime;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async () => {
    let trainingContent = formData.training_data;
    let fileBase64 = '';
    
    if (uploadedFiles.length > 0) {
      const file = uploadedFiles[0]; // Pega o primeiro arquivo
      fileBase64 = await convertFileToBase64(file);
      
      for (const file of uploadedFiles) {
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          const text = await file.text();
          trainingContent += `\n\n=== ${file.name} ===\n${text}`;
        } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          trainingContent += `\n\n=== ${file.name} ===\n[PDF content - will be processed by backend]`;
        }
      }
    }
    
    return { trainingContent, fileBase64 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { trainingContent, fileBase64 } = await processFiles();
      
      // Enviar para API Flask
      const apiPayload = {
        nome: formData.name,
        negocio: formData.business_type,
        descricao: formData.description,
        numero: formData.phone_number,
        arquivo_base64: fileBase64,
        contexto_extra: trainingContent,
        personalidade: formData.personality_prompt || `Você é um assistente virtual para ${formData.business_type}. Seja sempre educado, prestativo e responda de forma clara e objetiva.`
      };

      // TODO: Substituir pela URL real da API Flask
      const apiUrl = 'https://your-flask-api-url.com/criar-agente';
      
      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });

      if (!apiResponse.ok) {
        throw new Error('Erro ao criar agente na API');
      }

      const apiResult = await apiResponse.json();
      console.log('Agente criado na API:', apiResult);

      // Salvar no Supabase para persistência local
      const { error } = await supabase
        .from('agents')
        .insert({
          ...formData,
          training_data: trainingContent,
          user_id: user?.id,
          personality_prompt: formData.personality_prompt || `Você é um assistente virtual para ${formData.business_type}. Seja sempre educado, prestativo e responda de forma clara e objetiva.`,
          whatsapp_status: 'pending' // Status inicial
        });

      if (error) throw error;

      toast({
        title: "Agente criado com sucesso!",
        description: "Seu agente foi configurado e enviado para o backend"
      });

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
      console.error('Error creating agent:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o agente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
              Número do WhatsApp *
            </label>
            <Input
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="Ex: +5511999999999"
              type="tel"
              required
              className="transition-all duration-200 focus:scale-[1.01]"
            />
          </div>

          <div className="animate-in fade-in-50 duration-300 delay-500">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload de Arquivos para Treinamento
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-brand-green transition-colors duration-200">
              <input
                type="file"
                multiple
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Clique para fazer upload de arquivos PDF ou TXT
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Estes arquivos ajudarão a treinar seu agente
                </p>
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
  );
};

export default CreateAgentModal;
