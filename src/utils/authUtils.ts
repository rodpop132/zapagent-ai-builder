
import { useToast } from '@/hooks/use-toast';

export interface ApiError {
  code?: string;
  message?: string;
  details?: any;
}

/**
 * Verifica se o erro é de JWT expirado
 */
export function isJWTExpiredError(error: any): boolean {
  return (
    error?.code === 'PGRST301' ||
    error?.message?.includes('JWT expired') ||
    error?.message?.includes('Unauthorized') ||
    (typeof error === 'object' && error?.status === 401)
  );
}

/**
 * Trata erros de JWT expirado mostrando mensagem amigável
 */
export function handleJWTError(error: any, toast?: any): boolean {
  if (isJWTExpiredError(error)) {
    if (toast) {
      toast({
        title: "❌ Sessão Expirada",
        description: "Por favor, faça login novamente.",
        variant: "destructive"
      });
    }
    console.error('🔒 JWT expirado - redirecionando para login');
    // Opcional: redirecionar para login
    // window.location.href = '/auth';
    return true;
  }
  return false;
}

/**
 * Wrapper para chamadas que podem ter erro de JWT
 */
export async function executeWithJWTHandling<T>(
  operation: () => Promise<T>,
  toast?: any,
  fallbackValue?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error('Erro na operação:', error);
    
    if (handleJWTError(error, toast)) {
      return fallbackValue || null;
    }
    
    throw error;
  }
}
