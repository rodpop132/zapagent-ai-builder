import axios from 'axios';

const API_URL = 'https://zapagent-bot-9jkk.onrender.com';
const WEBHOOK_URL = 'https://rrbgsmaxzostwbcqntnz.supabase.co/functions/v1/mensagens';

export interface CreateAgentPayload {
  user_id: string;
  numero: string;
  nome?: string;
  tipo?: string;
  descricao?: string;
  prompt: string;
  plano?: string;
  webhook?: string;
}

export interface QrCodeResponse {
  conectado: boolean;
  qr_code?: string;
  message?: string;
}

export interface ApiResponse {
  status?: string;
  error?: string;
  msg?: string;
  qrcodeUrl?: string;
  numero?: string;
  user_id?: string;
  agente?: any;
}

export interface MessagesUsedResponse {
  numero: string;
  mensagensUsadas: number;
  plano: string;
  agentesAtivos: number;
}

export interface AgentStatusResponse {
  numero: string;
  conectado: boolean;
  mensagens_enviadas?: number;
  ultima_mensagem?: {
    user?: string;
    bot?: string;
    timestamp?: string;
  };
  historico?: Array<{
    user?: string;
    bot?: string;
    message?: string;
    response?: string;
    timestamp?: string;
  }>;
}

export interface HistoryResponse {
  numero: string;
  historico: Array<{
    user?: string;
    bot?: string;
    message?: string;
    response?: string;
    timestamp?: string;
  }>;
}

export interface SendMessageResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export const ZapAgentService = {
  async createAgent(payload: CreateAgentPayload): Promise<ApiResponse> {
    try {
      console.log('🚀 Enviando payload para API:', payload);
      
      // Ensure numero is clean (digits only)
      const cleanedPayload = {
        ...payload,
        numero: payload.numero.replace(/\D/g, ''),
        webhook: WEBHOOK_URL // Adicionar webhook automaticamente
      };
      
      console.log('📦 Payload limpo com webhook:', cleanedPayload);
      
      const response = await fetch(`${API_URL}/zapagent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedPayload)
      });

      const json = await response.json();
      console.log('✅ API respondeu:', json);

      if (!response.ok) {
        throw new Error(json.error || 'Erro ao criar agente');
      }

      return json;
    } catch (error: any) {
      console.error('❌ Erro na API:', error);
      
      if (error.message.includes('NetworkError')) {
        return {
          status: 'error',
          error: 'Erro de conexão: Verifique se a API está online.'
        };
      }
      
      return {
        status: 'error',
        error: error.message || 'Erro de conexão com a API'
      };
    }
  },

  async getQrCode(numero: string): Promise<QrCodeResponse> {
    try {
      console.log('🔍 Buscando QR Code para:', numero);
      
      const cleanNumero = numero.replace(/\D/g, '');
      const response = await fetch(`${API_URL}/qrcode?numero=${cleanNumero}`, {
        method: 'GET',
      });
      
      const json = await response.json();
      console.log('✅ QR Code response:', json);
      
      if (!response.ok) {
        throw new Error(json.message || 'Erro ao buscar QR Code');
      }
      
      return json;
    } catch (error: any) {
      console.error('❌ Erro ao buscar QR Code:', error);
      
      return { 
        conectado: false, 
        message: error.message || "Erro ao obter QR Code" 
      };
    }
  },

  async getMessagesUsed(user_id: string, numero: string): Promise<MessagesUsedResponse | null> {
    try {
      console.log('📊 Buscando uso de mensagens para:', { user_id, numero });
      
      const cleanNumero = numero.replace(/\D/g, '');
      const response = await fetch(`${API_URL}/mensagens-usadas?user_id=${user_id}&numero=${cleanNumero}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar mensagens usadas');
      }
      
      const json = await response.json();
      console.log('✅ Messages used response:', json);
      return json;
    } catch (error: any) {
      console.error('❌ Erro ao buscar mensagens usadas:', error);
      return null;
    }
  },

  async getAgentStatus(numero: string): Promise<AgentStatusResponse> {
    try {
      console.log('🔍 Verificando status do agente:', numero);
      
      const cleanNumero = numero.replace(/\D/g, '');
      const response = await fetch(`${API_URL}/verificar?numero=${cleanNumero}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao verificar status');
      }
      
      const json = await response.json();
      console.log('✅ Agent status response:', json);
      
      // Map the response to include expected properties
      return {
        numero: json.numero || cleanNumero,
        conectado: json.conectado || false,
        mensagens_enviadas: json.mensagens_enviadas || json.mensagensUsadas || 0,
        ultima_mensagem: json.ultima_mensagem,
        historico: json.historico || []
      };
    } catch (error: any) {
      console.error('❌ Erro ao verificar status do agente:', error);
      
      return {
        numero: numero.replace(/\D/g, ''),
        conectado: false,
        mensagens_enviadas: 0,
        historico: []
      };
    }
  },

  async getAgentHistory(user_id: string, numero: string): Promise<HistoryResponse | null> {
    try {
      console.log('📋 Buscando histórico do agente:', { user_id, numero });
      
      const cleanNumero = numero.replace(/\D/g, '');
      const response = await fetch(`${API_URL}/historico?user_id=${user_id}&numero=${cleanNumero}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao buscar histórico');
      }
      
      const json = await response.json();
      console.log('✅ Agent history response:', json);
      return json;
    } catch (error: any) {
      console.error('❌ Erro ao buscar histórico do agente:', error);
      return null;
    }
  },

  async restartAgent(numero: string): Promise<ApiResponse> {
    try {
      console.log('🔄 Reiniciando agente:', numero);
      
      const cleanNumero = numero.replace(/\D/g, '');
      const response = await fetch(`${API_URL}/reiniciar?numero=${cleanNumero}`, {
        method: 'GET',
      });
      
      const json = await response.json();
      console.log('✅ Restart response:', json);
      
      if (!response.ok) {
        throw new Error(json.error || 'Erro ao reiniciar agente');
      }
      
      return json;
    } catch (error: any) {
      console.error('❌ Erro ao reiniciar agente:', error);
      
      return {
        status: 'error',
        error: error.message || 'Erro ao reiniciar agente'
      };
    }
  },

  async checkApiStatus(): Promise<boolean> {
    try {
      console.log('🔍 Verificando status da API...');
      
      const response = await fetch(`${API_URL}/`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        return false;
      }
      
      const text = await response.text();
      const isOnline = text.includes('ZapAgent Bot ativo');
      console.log('✅ API Status:', isOnline ? 'Online' : 'Offline');
      
      return isOnline;
    } catch (error: any) {
      console.error('❌ Erro ao verificar status da API:', error);
      return false;
    }
  },

  async verifyConnection(numero: string): Promise<QrCodeResponse> {
    try {
      console.log('🔍 Verificando conexão para:', numero);
      
      const statusResponse = await this.getAgentStatus(numero);
      
      if (statusResponse.conectado) {
        return { 
          conectado: true, 
          message: "Agente conectado e funcionando" 
        };
      }
      
      // Se não estiver conectado, tenta buscar o QR code
      const qrResponse = await this.getQrCode(numero);
      return qrResponse;
      
    } catch (error: any) {
      console.error('❌ Erro ao verificar conexão:', error);
      
      return { 
        conectado: false, 
        message: error.message || "Erro ao verificar conexão" 
      };
    }
  },

  // Método de compatibilidade para sendMessage (se necessário no futuro)
  async sendMessage(numero: string, message: string, prompt: string): Promise<SendMessageResponse> {
    console.warn('⚠️ sendMessage não implementado na API atual');
    return {
      success: false,
      error: 'Funcionalidade não disponível na API atual'
    };
  }
};
