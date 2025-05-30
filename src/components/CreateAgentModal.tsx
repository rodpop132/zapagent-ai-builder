
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, QrCode } from 'lucide-react';
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

  const checkConnectionStatus = async (phoneNumber: string) => {
    try {
      console.log('Verificando status de conexão para:', phoneNumber);
      const response = await fetch(`https://zapagent-api.onrender.com/status?numero=${encodeURIComponent(phoneNumber)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta do status:', response.status, errorText);
        throw new Error(`Erro ${response.status}: Servidor de status indisponível`);
      }
      
      const data = await response.json();
      console.log('Status recebido:', data);
      const status = data.connected ? 'connected' : 'pending';
      setConnectionStatus(status);
      
      if (!data.connected) {
        await fetchQrCode(phoneNumber);
      }
      
      return status;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor de status. Verifique sua internet.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro no Status",
          description: error instanceof Error ? error.message : "Falha ao verificar status de conexão",
          variant: "destructive"
        });
      }
      return 'pending';
    }
  };

  const fetchQrCode = async (phoneNumber: string) => {
    try {
      console.log('Buscando QR code para:', phoneNumber);
      const response = await fetch(`https://zapagent-bot.onrender.com/qrcode?numero=${encodeURIComponent(phoneNumber)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta do QR code:', response.status, errorText);
        throw new Error(`Erro ${response.status}: Servidor de QR code indisponível`);
      }
      
      const data = await response.json();
      console.log('QR code recebido:', data.qr ? 'Sim' : 'Não');
      
      if (data.qr) {
        setQrCodeUrl(`data:image/png;base64,${data.qr}`);
        setShowQrModal(true);
      } else {
        throw new Error('QR code não encontrado na resposta');
      }
    } catch (error) {
      console.error('Erro ao buscar QR code:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar ao servidor de QR code. Verifique sua internet.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro no QR Code",
          description: error instanceof Error ? error.message : "Falha ao gerar QR code",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Iniciando criação do agente...');
      
      // Validação dos dados obrigatórios
      if (!formData.name.trim()) {
        throw new Error('Nome do agente é obrigatório');
      }
      if (!formData.business_type) {
        throw new Error('Tipo de negócio é obrigatório');
      }
      if (!formData.phone_number.trim()) {
        throw new Error('Número do WhatsApp é obrigatório');
      }

      // Preparar FormData para envio
      const apiFormData = new FormData();
      apiFormData.append('nome', formData.name);
      apiFormData.append('negocio', formData.business_type);
      apiFormData.append('descricao', formData.description);
      apiFormData.append('numero', formData.phone_number);
      apiFormData.append('contexto_extra', formData.training_data);
      apiFormData.append('personalidade', formData.personality_prompt || `Você é um assistente virtual para ${formData.business_type}. Seja sempre educado, prestativo e responda de forma clara e objetiva.`);

      // Adicionar arquivo se houver
      if (uploadedFiles.length > 0) {
        apiFormData.append('arquivo', uploadedFiles[0]);
        console.log('Arquivo anexado:', uploadedFiles[0].name);
      }

      console.log('Enviando dados para API externa...');
      // Enviar para a API externa
      const apiResponse = await fetch('https://zapagent-api.onrender.com/create', {
        method: 'POST',
        body: apiFormData
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('Erro na API externa:', apiResponse.status, errorText);
        
        let errorMessage = 'Erro desconhecido na API';
        if (apiResponse.status === 400) {
          errorMessage = 'Dados inválidos enviados para a API';
        } else if (apiResponse.status === 500) {
          errorMessage = 'Erro interno da API de criação';
        } else if (apiResponse.status === 503) {
          errorMessage = 'Servidor de criação temporariamente indisponível';
        }
        
        throw new Error(`${errorMessage} (${apiResponse.status})`);
      }

      const apiResult = await apiResponse.json();
      console.log('Agente criado na API externa com sucesso:', apiResult);

      console.log('Salvando no banco de dados local...');
      // Salvar no Supabase para persistência local
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
        console.error('Erro no Supabase:', supabaseError);
        throw new Error(`Erro ao salvar no banco de dados: ${supabaseError.message}`);
      }

      console.log('Agente salvo no banco local com sucesso');

      toast({
        title: "Agente criado com sucesso!",
        description: "Verificando status de conexão do WhatsApp..."
      });

      console.log('Verificando status de conexão...');
      // Verificar status de conexão
      await checkConnectionStatus(formData.phone_number);

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
      
      // Tratamento específico por tipo de erro
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível conectar aos servidores. Verifique sua conexão com a internet.",
          variant: "destructive"
        });
      } else if (error instanceof Error) {
        // Erro conhecido com mensagem específica
        toast({
          title: "Erro na Criação do Agente",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Erro genérico
        toast({
          title: "Erro Inesperado",
          description: "Ocorreu um erro inesperado. Tente novamente em alguns minutos.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (fullNumber: string) => {
    setFormData({ ...formData, phone_number: fullNumber });
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
                Número do WhatsApp *
              </label>
              <CountryPhoneInput
                value={formData.phone_number}
                onChange={handlePhoneChange}
                placeholder="Digite o número"
                className="transition-all duration-200 focus:scale-[1.01]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Selecione o país e digite apenas o número local
              </p>
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

            {/* Status de conexão */}
            {connectionStatus && (
              <div className="animate-in fade-in-50 duration-300 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  {connectionStatus === 'connected' ? (
                    <>
                      <span className="text-green-600 font-medium">✅ Agente Ativo</span>
                    </>
                  ) : (
                    <>
                      <span className="text-orange-600 font-medium">⏳ Aguardando conexão via QR Code</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQrModal(true)}
                        className="ml-2"
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        Ver QR Code
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

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
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
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
                  className="max-w-full h-auto border rounded-lg"
                />
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Carregando QR Code...</p>
                </div>
              </div>
            )}
            
            <Button
              onClick={() => checkConnectionStatus(formData.phone_number)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Verificar Status Novamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateAgentModal;
