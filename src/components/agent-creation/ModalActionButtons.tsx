
import { Button } from '@/components/ui/button';
import { Loader2, Bot, CheckCircle } from 'lucide-react';

interface ModalActionButtonsProps {
  creationState: 'idle' | 'saving' | 'creating_zapagent' | 'awaiting_qr' | 'success' | 'error';
  onClose: () => void;
  onRetry: () => void;
}

const ModalActionButtons = ({ creationState, onClose, onRetry }: ModalActionButtonsProps) => {
  const isProcessing = ['saving', 'creating_zapagent', 'awaiting_qr'].includes(creationState);
  const isComplete = creationState === 'success';
  const hasError = creationState === 'error';

  if (isComplete) {
    return (
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          onClick={onClose}
          className="bg-brand-green hover:bg-brand-green/90"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Fechar
        </Button>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
        >
          Tentar Novamente
        </Button>
        <Button
          type="button"
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>
    );
  }

  if (isProcessing) {
    return null;
  }

  return (
    <div className="flex justify-end space-x-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isProcessing}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isProcessing}
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
  );
};

export default ModalActionButtons;
