
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
  }
};
