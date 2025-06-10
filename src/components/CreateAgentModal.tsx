
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bot } from 'lucide-react';
import { useAgentCreation } from '@/hooks/useAgentCreation';
import CreationStatusDisplay from './agent-creation/CreationStatusDisplay';
import AgentFormFields from './agent-creation/AgentFormFields';
import ModalActionButtons from './agent-creation/ModalActionButtons';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: () => void;
}

const CreateAgentModal = ({ isOpen, onClose, onAgentCreated }: CreateAgentModalProps) => {
  const {
    formData,
    creationState,
    qrcodeUrl,
    error,
    handleInputChange,
    createAgent,
    resetForm,
    retry
  } = useAgentCreation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAgent(onAgentCreated);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

        <CreationStatusDisplay 
          creationState={creationState}
          error={error}
          qrcodeUrl={qrcodeUrl}
          agentName={formData.name}
        />

        {/* Formulário - só mostra se não estiver em processo ou concluído */}
        {!isProcessing && !isComplete && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <AgentFormFields 
              formData={formData}
              onInputChange={handleInputChange}
              disabled={isProcessing || hasError}
            />
            
            <ModalActionButtons 
              creationState={creationState}
              onClose={handleClose}
              onRetry={retry}
            />
          </form>
        )}

        {/* Botões para quando está concluído ou com erro */}
        {(isComplete || hasError) && (
          <ModalActionButtons 
            creationState={creationState}
            onClose={handleClose}
            onRetry={retry}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentModal;
