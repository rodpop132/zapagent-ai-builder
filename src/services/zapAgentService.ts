
import axios from 'axios';

const API_URL = 'https://zapagent-bot.onrender.com';

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
  historico?: any[];
}

export interface HistoryResponse {
  numero: string;
  historico: Array<{
    user?: string;
    bot?: string;
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
      
      const response = await axios.post(`${API_URL}/zapagent`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      });

      console.log('✅ API respondeu:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro na API:', error);
      
      if (error.response?.data) {
        return {
          status: 'error',
          error: error.response.data.error || error.response.data.msg || 'Erro na API',
          msg: error.response.data.msg
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          status: 'error',
          error: 'Timeout: O servidor demorou muito para responder. Tente novamente.'
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
      
      const response = await axios.get(`${API_URL}/qrcode`, {
        params: { numero },
        timeout: 10000
      });
      
      console.log('✅ QR Code response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar QR Code:', error);
      
      if (error.response?.status === 404) {
        return { 
          conectado: false, 
          message: "Agente não encontrado. Verifique se o número está correto." 
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return { 
          conectado: false, 
          message: "Timeout ao buscar QR Code. Tente novamente." 
        };
      }
      
      return { 
        conectado: false, 
        message: error.response?.data?.message || "Erro ao obter QR Code" 
      };
    }
  },

  async getMessagesUsed(user_id: string, numero: string): Promise<MessagesUsedResponse | null> {
    try {
      console.log('📊 Buscando uso de mensagens para:', { user_id, numero });
      
      const response = await axios.get(`${API_URL}/mensagens-usadas`, {
        params: { user_id, numero },
        timeout: 10000
      });
      
      console.log('✅ Messages used response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar mensagens usadas:', error);
      return null;
    }
  },

  async getAgentStatus(numero: string): Promise<AgentStatusResponse> {
    try {
      console.log('🔍 Verificando status do agente:', numero);
      
      const response = await axios.get(`${API_URL}/verificar`, {
        params: { numero },
        timeout: 10000
      });
      
      console.log('✅ Agent status response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao verificar status do agente:', error);
      
      return {
        numero,
        conectado: false
      };
    }
  },

  async getAgentHistory(user_id: string, numero: string): Promise<HistoryResponse | null> {
    try {
      console.log('📋 Buscando histórico do agente:', { user_id, numero });
      
      const response = await axios.get(`${API_URL}/historico`, {
        params: { user_id, numero },
        timeout: 10000
      });
      
      console.log('✅ Agent history response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar histórico do agente:', error);
      return null;
    }
  },

  async restartAgent(numero: string): Promise<ApiResponse> {
    try {
      console.log('🔄 Reiniciando agente:', numero);
      
      const response = await axios.get(`${API_URL}/reiniciar`, {
        params: { numero },
        timeout: 15000
      });
      
      console.log('✅ Restart response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao reiniciar agente:', error);
      
      return {
        status: 'error',
        error: error.response?.data?.error || error.message || 'Erro ao reiniciar agente'
      };
    }
  },

  async checkApiStatus(): Promise<boolean> {
    try {
      console.log('🔍 Verificando status da API...');
      
      const response = await axios.get(`${API_URL}/`, {
        timeout: 5000
      });
      
      const isOnline = response.status === 200 && response.data.includes('ZapAgent Bot ativo');
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
        message: error.response?.data?.message || "Erro ao verificar conexão" 
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
