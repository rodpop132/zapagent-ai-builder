
const API_BASE_URL = 'https://zapagent-api.onrender.com';

export interface ChatMessage {
  message: string;
  response: string;
  timestamp: string;
}

export interface ApiResponse {
  resposta: string;
  status?: string;
}

export interface StatusResponse {
  status: string;
  historico: ChatMessage[];
}

export class ZapAgentService {
  static async checkApiStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      const text = await response.text();
      return text.includes('ZapAgent IA está online');
    } catch (error) {
      console.error('❌ Erro ao verificar status da API:', error);
      return false;
    }
  }

  static async sendMessage(numero: string, message: string, prompt: string): Promise<string> {
    try {
      console.log(`🤖 Enviando mensagem para ${numero}:`, message);
      
      // Limpar número (remover + e espaços)
      const cleanNumber = numero.replace(/[\s+]/g, '');
      
      const response = await fetch(`${API_BASE_URL}/responder/${cleanNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msg: message,
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log('✅ Resposta da IA:', data.resposta);
      
      return data.resposta;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  static async getAgentHistory(numero: string): Promise<ChatMessage[]> {
    try {
      // Limpar número (remover + e espaços)
      const cleanNumber = numero.replace(/[\s+]/g, '');
      
      const response = await fetch(`${API_BASE_URL}/status/${cleanNumber}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data: StatusResponse = await response.json();
      return data.historico || [];
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      return [];
    }
  }

  static async sendSimpleMessage(message: string, prompt: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msg: message,
          prompt: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data.resposta;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem simples:', error);
      throw error;
    }
  }
}
