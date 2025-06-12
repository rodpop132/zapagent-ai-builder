
import axios from 'axios';

const API_URL = 'https://zapagent.com.br/api';

export interface CreateAgentPayload {
  user_id: string;
  numero: string;
  nome: string;
  tipo: string;
  descricao: string;
  prompt: string;
  plano: string;
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
}

export interface MessagesUsedResponse {
  messages_used: number;
  messages_limit: number;
  percentage: number;
}

export interface AgentStatusResponse {
  conectado: boolean;
  mensagens_enviadas: number;
  historico: any[];
  ultima_mensagem?: {
    user?: string;
    bot?: string;
    timestamp?: string;
  };
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
      
      return {
        status: 'error',
        error: error.message || 'Erro de conexão com a API'
      };
    }
  },

  async getQrCode(numero: string): Promise<QrCodeResponse> {
    try {
      const response = await axios.get(`${API_URL}/qrcode`, {
        params: { numero },
        timeout: 10000
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar QR Code:', error);
      return { 
        conectado: false, 
        message: error.response?.data?.message || "Erro ao obter QR Code" 
      };
    }
  },

  async getMessagesUsed(numero: string): Promise<MessagesUsedResponse> {
    try {
      const response = await axios.get(`${API_URL}/messages-used`, {
        params: { numero },
        timeout: 10000
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar mensagens usadas:', error);
      return {
        messages_used: 0,
        messages_limit: 0,
        percentage: 0
      };
    }
  },

  async getAgentStatus(numero: string): Promise<AgentStatusResponse> {
    try {
      const response = await axios.get(`${API_URL}/agent-status`, {
        params: { numero },
        timeout: 10000
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao buscar status do agente:', error);
      return {
        conectado: false,
        mensagens_enviadas: 0,
        historico: []
      };
    }
  },

  async sendMessage(numero: string, message: string, prompt: string): Promise<SendMessageResponse> {
    try {
      const response = await axios.post(`${API_URL}/send-message`, {
        numero,
        message,
        prompt
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });
      
      return {
        success: true,
        response: response.data.response || 'Mensagem enviada com sucesso'
      };
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Erro ao enviar mensagem'
      };
    }
  },

  async checkApiStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/health`, {
        timeout: 5000
      });
      
      return response.status === 200;
    } catch (error: any) {
      console.error('❌ Erro ao verificar status da API:', error);
      return false;
    }
  },

  async verifyConnection(numero: string): Promise<QrCodeResponse> {
    try {
      const response = await axios.get(`${API_URL}/verify-connection`, {
        params: { numero },
        timeout: 10000
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao verificar conexão:', error);
      return { 
        conectado: false, 
        message: error.response?.data?.message || "Erro ao verificar conexão" 
      };
    }
  }
};
